const express = require('express')
const app = express();
const mongoose = require("mongoose")
const cors = require('cors')
const fs = require('fs')
const Question = require('./Objects/Question')
const questionNames = require('./Objects/questionNames')
const User = require('./Models/users')
require('dotenv').config()


const questionFuncs = require('./Routes/questionFuncs');
const { randomUUID } = require('crypto');
const { default: axios } = require('axios');

const currentQuestion = new Question();

app.use(cors());
app.use(express.json())

const PORT = 5000;

//Conncect to mongodb database
const url = process.env.ATLAS_URL;
mongoose.connect(url)
//alert console that mongoose database is connected
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB is connected")
})

app.get('/', async (req, res) => {
    try{
        return res.json('Connected to api');
    } catch(error) {
        return res.status(400).json("Error loading api")
    }
})

app.get('/question', async (req, res) => {
    const n = questionNames.length - 1;
    const randQuestionIndex = Math.floor(Math.random() * (n - 0) + 0);
    const question = questionNames[randQuestionIndex];

    //format the question name to match how it's formatted in the .txt files.
    const questionName = question.toLowerCase().replace(/ /g, '_');
    let funcCall = "";
    questionFuncs.questions.map((question) => {
        if(questionName == question.name) {
            funcCall = question.functionCall
            return;
        }
    })

    try{
        fs.readFile(`../client/src/assets/Questions/${question}.txt`, async (err, data) => {
            if(err) throw err;
            if(funcCall && funcCall.length > 0) {
                currentQuestion.SetQuestion(JSON.parse(data.toString()))
                currentQuestion.SetFunctionCall(funcCall);
                return res.status(200).json({lcQuestion: data.toString(), functionCall: funcCall})
            }
            return res.status(417).json("Can't retrieve functionCall");
        })
    } catch(error){
        res.status(404).json(error)
    }
})

const getQuestionExperience = (questionDifficulty) => {
    let experience = 0;
    if(questionDifficulty == "Easy") {
        experience = 500
    } else if(questionDifficulty == "Normal") {
        experience = 800
    } else if(questionDifficulty == "Hard") {
        experience = 1100
    }
    return experience;
}

app.get('/question/runTest', async (req, res) => {
    const {userCode, currLanguage, languageVersion, lobbyID, userName, questionDifficulty} = req.query;
    
    //fix username not sending
    console.log(userCode, currLanguage, languageVersion, lobbyID, userName, questionDifficulty)
    //calculate how much experience question is worth
    try{
        const testsPassed = await currentQuestion.RunTests(userCode, currLanguage, languageVersion);
    
        //check if all tests are passed
        let passed = true
        testsPassed.map((result) => {
            if (result.passed == false) {
                passed = false
            }
        })

        //if all testcases are passed means game is now over.
        if(passed) {
            //update user's experience
            const rewardedExp = getQuestionExperience(questionDifficulty)
            const user = await User.findOneAndUpdate(
                { userName: userName },
                    {
                    $inc: { experience: rewardedExp }
                    },
                { new: true } 
            )
            if(!user) return res.status(400).json("Couldn't update user's experience")
        
            //use lobbyID to retrieve current room name
            //emit to all sockets in the room that someone has won
            lobbies.map((lobby) => {
                if(lobby.lobbyID == lobbyID) {
                    const roomName = lobby.roomName
                    io.to(roomName).emit('gameResult', {result: true, message: 'Player has won'})
                    return res.json({testsPassed: testsPassed, updatedExp: rewardedExp, passed: passed})
                }
            })
        }

        return res.json({testResults: testsPassed, updatedExp: 0, passed: passed})
    } catch(error) {
        console.log(error)
    }
})

const expressServer = app.listen(PORT, () => {
    console.log('Listening on port: ', PORT);
})

const socketio = require('socket.io')

const io = socketio(expressServer, {
    cors: [
        'http://localhost:3000',
        'http://localhost:5000'
    ]
})

const fetchQuestion = async () => {
    try{
    const res = await axios.get('http://localhost:5000/question');
    return res.data;    
    } catch(error) {
        console.log(error);
    }
}

const roomData = {};
const lobbies = [];
const sockets = new Set();
const roomSocketInfo = [];
const roomsBeingCreated = new Set();

const lobbyExist = (lobbyID) => {
    //check if roomData has been stored in lobbies
    lobbies.map((lobby) => {
        if(lobby.lobbyID === lobbyID) {
            return true;
        }
    })
    return false;    
}

let lobbyID = randomUUID();
let roomName = "lobby" + String(lobbyID)

//central socket
io.on('connect', (socket) => {
    console.log("Welcome to the server: ", socket.id)
    //Listener for creating a match
    socket.on('joinMatch', async () => {
        try{
            //check if the socket has already joined a match (cause of useEffect double-rendering on mount)
            if(sockets.has(socket.id)) return;
            sockets.add(socket.id)

            //if there is no data for the currentRoom create it.
            //else add the socket's id to the room
            const existingRoom = roomSocketInfo.find((room) => room.roomName === roomName);
            if(!existingRoom) {
                roomSocketInfo.push({
                    roomName: roomName,
                    players: [socket.id]
                })
            } else {
                existingRoom.players.push(socket.id)
            }
            
            let playersInRoom = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        
            if(playersInRoom == 2) {
                lobbyID = randomUUID();
                roomName = "lobby" + String(lobbyID);
            }

            socket.join(roomName)
            playersInRoom = io.sockets.adapter.rooms.get(roomName)?.size || 0;
            console.log(socket.id, " has joined ", roomName)
            
            io.to(roomName).emit('roomUpdate', {roomName, playersInRoom})

            if(playersInRoom === 2) {
                //If the room for the current lobby doesn't exist create it.
                if(!roomData[roomName] && !roomsBeingCreated.has(roomName)) {
                    roomsBeingCreated.add(roomName)
                    //need to fetch question & function call
                    const data = await fetchQuestion();
                    const {lcQuestion, functionCall} = data;

                    roomData[roomName] = {
                        lobbyID,
                        lcQuestion,
                        functionCall
                    };

                    if(!lobbyExist(lobbyID)) {
                        const currentTime = Date.now()
                        lobbies.push({
                            roomName: roomName,
                            lobbyID: lobbyID,
                            lcQuestion: lcQuestion,
                            funcCall: functionCall,
                            timeStarted: currentTime, 
                        });
                    }

                    io.to(roomName).emit('startMatch', { lobbyId: lobbyID})
                    io.to(roomName).emit('occuringMatch', {lcQuestion, functionCall} )
                } else if(roomData[roomName]){
                    const {lobbyID, lcQuestion, functionCall} = roomData[roomName];

                    io.to(roomName).emit('startMatch', { lobbyId: lobbyID})
                    io.to(roomName).emit('occuringMatch', {lcQuestion, functionCall} )
                }
            }
        } catch(error) {
            console.error("Error in joinmatch handler: ", error);
        } finally {
            roomsBeingCreated.delete(roomName);
        }
        })

        socket.on('disconnect', () => {
            let roomName = ""
            roomSocketInfo.forEach((room, index) => {
                if (room.players.includes(socket.id)) {
                    roomName = room.roomName;
                    roomSocketInfo.splice(index, 1);  // Remove the room from the array
                    io.to(roomName).emit('playerDisconnected', {disconnected: true})
                }
            });

            lobbies.forEach((lobby, index) => {
                if(lobby.roomName == roomName) {
                    lobbies.splice(index, 1)
                }
            });

            if(roomData[roomName]) {
                delete roomData[roomName]
            }

            if(sockets.has(socket.id)) {
                sockets.delete(socket.id)
            }
        })
})

const checkLobbyTimes = () => {
    //if no lobbies are currently happening don't check times
    if(lobbies.length == 0) {
        return;
    }

    /**
     * For every lobby check if the match has been occuring for longer than a certain time
     * (here we check 30minutes might extend based off problem difficulty later)
     */
    lobbies.forEach((lobby) => {
        const lobbyStartTime = lobby.timeStarted;
        const currentTime = Date.now()

        const elapsedTime = currentTime - lobbyStartTime
        const MINUTES = 30;
        const INTERVAL = 60 * 1000 * MINUTES; //30 minutes
        if(elapsedTime >= INTERVAL) {
            const roomName = lobby.roomName
            //will navigate user to home page so the disocnnect event listener will be called. (don't have to worry about cleaning up the socket and lobby/room)
            io.to(roomName).emit('matchExpired', {disconnected: true, message: 'RAN OUT OF TIME'}) //can make another listener on client-side later but playerDisconnected and this do the same thing
        }
    })
}

setInterval(() => {
    checkLobbyTimes();
}, 5000)

const lobbyRouter = require("./Routes/lobby");
const usersRouter = require("./Routes/user");

app.use('/lobby', lobbyRouter)
app.use('/users', usersRouter)
