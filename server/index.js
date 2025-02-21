const express = require('express')
const app = express();
const mongoose = require("mongoose")
const cors = require('cors')
const fs = require('fs')
const RunTests = require('./Objects/Question')
const questionNames = require('./Objects/questionNames')
const ResultLobbies = require('./Objects/ResultLobbies')
const User = require('./Models/users')
const { levels } = require('./levels');
const util = require('util')
const readFile = util.promisify(fs.readFile);
require('dotenv').config()

const questionFuncs = require('./Routes/questionFuncs');
const { randomUUID } = require('crypto');
const { default: axios } = require('axios');

app.use(cors());
app.use(express.json())

const PORT = 5000;

//Conncect to mongodb database
const url = process.env.ATLAS_URI;
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
            funcCall = question.functionCalls['python'] //default lang is set to python
            return;
        }
    })

    try{
        fs.readFile(`./Questions/${question}.txt`, async (err, data) => {
            if(err) throw err;
            if(funcCall && funcCall.length > 0) {
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

app.post('/question/update', async (req, res) => {
    const {currLanguage, question} = req.body;

    const questionName = question.title.toLowerCase().replace(/-/g, '_');
    let funcCall = "";
    questionFuncs.questions.map((question) => {
        if(questionName == question.name) {
            funcCall = question.functionCalls[`${currLanguage}`]
            return;
        }
    })
   
    if(!funcCall) {
        return res.status(500).json('Error running tests no function call provided')
    }

    return res.status(200).json({functionCall: funcCall})
})

async function isInPlace(questionName) {
    try {
        const data = await readFile(`./Questions/${questionName}.txt`, 'utf-8');
        if (data.length > 0) {
            const inPlace = JSON.parse(data)["in-place"];
            return inPlace; // Ensure boolean is returned
        }
        return false;
    } catch (error) {
        console.log(`Error fetching inPlace boolean: ${error}`);
        return false;
    }
}


const winners = [];
app.post('/question/runTest', async (req, res) => {
    const {userCode, currLanguage, languageVersion, lobbyID, userName, question} = req.body;

    const questionName = question.title.toLowerCase().replace(/ /g, '_');
    let funcCall = "";
    questionFuncs.questions.map((question) => {
        if(questionName == question.name) {
            funcCall = question.functionCalls[`${currLanguage}`]
            return;
        }
    })

    if(!funcCall) {
        return res.status(500).json('Error running tests no function call provided')
    }

    const inPlace = await isInPlace(question.title.replace(/-/g, ' '))
    try{
        const testsPassed = await RunTests(question, funcCall, userCode, currLanguage, languageVersion, inPlace);
    
        //check if all tests are passed
        let passed = testsPassed.every((result) => result.passed)

        const resultRes = {
            testsPassed,
            passed
        };
        console.log('passed?: ', passed)
        //if all testcases are passed means game is now over.
        if(passed) {
            const rewardedExp = getQuestionExperience(question.difficulty)
            //fetch user and update the user.
            const user = await User.findOne({userName: userName});
            if(!user) return res.status(400).json("Couldn't update user's experience")
        
            user.experience += rewardedExp;
            
            const userLevel = user.level;
            const nextLevelExp = levels[`${userLevel+1}`];
            if(user.experience >= nextLevelExp) {
                user.level += 1;
            }
            await user.save();
            console.log(lobbies)
            //use lobbyID to retrieve current room name
            //emit to all sockets in the room that someone has won
            lobbies.map(async (lobby) => {
                if(lobby.lobbyID == lobbyID) {
                    const roomName = lobby.roomName
                    
                    //update users questionsSolved array
                    const questionTitle = (JSON.parse(lobby.lcQuestion))['title']
                    if(questionTitle && !user.questionsSolved.includes(questionTitle)) {
                        user.questionsSolved = [...user.questionsSolved, questionTitle]
                        await user.save() 
                    }

                    const playerAdded = winners.find((winner) => winner.userName == userName)
                    if(!playerAdded) {
                        const resultRoomName = 'result' + String(lobby.lobbyID)
                        winners.push({roomName: resultRoomName, userName: userName, userOutput: userCode})
                    }
                    
                    destroyLobby(roomName)
                }
            })
        } 
        
        return res.json(resultRes)
    } catch(error) {
        console.log(error)
    }
})

const destroyLobby = (roomName) => {
    setTimeout(() => {        
        io.to(roomName).emit('gameResult', {
            result: true,
            message: 'Player has won'
        });
    }, 15000);
}

const expressServer = app.listen(PORT, () => {
    console.log('Listening on port: ', PORT);
})

const socketio = require('socket.io')

const io = socketio(expressServer, {
    cors: [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://codeblitzxyz.vercel.app'
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
const roomsBeingCreated = new Set();
const resultRooms = new ResultLobbies()
const roomSockets = new Set()

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
    //Listener for creating a match
    socket.on('joinMatch', async () => {
        console.log('socket connected')
        try{
            
            //check if the socket has already joined a match (cause of useEffect double-rendering on mount)
            if(sockets.has(socket.id)) return;
            sockets.add(socket.id)
            
    
            socket.roomName = roomName // store roomName as property of socket to use if player disconnects from match
            socket.join(roomName)
        
            const playersInRoom = io.sockets.adapter.rooms.get(roomName)?.size || 0;
            
            if(playersInRoom == 2) {
                lobbyID = randomUUID();
                roomName = "lobby" + String(lobbyID);
            }

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

                    io.to(roomName).emit('occuringMatch', {lcQuestion, functionCall} )
                    io.to(roomName).emit('startMatch', { lobbyId: lobbyID})
                } else if(roomData[roomName]){
                    const {lobbyID, lcQuestion, functionCall} = roomData[roomName];

                    io.to(roomName).emit('occuringMatch', {lcQuestion, functionCall} )
                    io.to(roomName).emit('startMatch', { lobbyId: lobbyID})
                }
            }
        } catch(error) {
            console.error("Error in joinmatch handler: ", error);
        } finally {
            roomsBeingCreated.delete(roomName);
        }
        })

        socket.on('resultLobbyCreated', async ({lobbyID, user}) => {
            //add socket to roomName result/lobbyID
            if(roomSockets.has(socket.id)) {
                return
            }
            roomSockets.add(socket.id)
            const roomName = 'result' + String(lobbyID)
            socket.join(roomName)

            const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
            
            const {userName, experience, level} = user;

            const currUser = {
                userName: userName,
                experience: experience,
                level: level
            }

            await resultRooms.addUser(lobbyID, currUser)
            console.log('Room size is: ', roomSize)
            console.log('Winners so far:', winners)
            if(roomSize == 2) {
                // find winner of current room
                const winner = winners.find((winner) => {
                    return winner.roomName == roomName
                })

                if(winner) {
                    //currentRoom is an array of players
                    const currentRoom = await resultRooms.getLobby(lobbyID)
                    io.to(roomName).emit('notifyResult', {playersInRoom: currentRoom, winner: winner.userName, winnerCode: winner.userOutput})
                    
                    //remove room from winners array
                    const roomIndex = winners.findIndex((winner) => {
                        return winner.roomName == roomName
                    })
                    if(roomIndex !== -1) {
                        winners.splice(roomIndex, 1)
                    }
                }
            }
            console.log('Winners after:', winners)
        })

        socket.on('createPrivate', () => {
            const lobbyID = randomUUID()
            //send user id to redirect
            io.to(socket.id).emit('privateCreated', {lobbyId: lobbyID})
        })

        socket.on('disconnect', () => {
          
            if(!socket.roomName || socket.roomName.length == 0) return
            
            let roomName = socket.roomName
            if(roomName) {
                io.to(roomName).emit('playerDisconnected', {disconnected: true})
            }
            
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

            if(roomSockets.has(socket.id)) {
                roomSockets.delete(socket.id)
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
