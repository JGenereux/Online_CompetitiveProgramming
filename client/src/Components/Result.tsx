import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useUser } from "./Contexts/userContext";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import { Avatar } from "@mui/material";
import { Editor } from "@monaco-editor/react";
import { UseQuestion } from "./Contexts/questionContext";

interface Player {
    userName: string;
    experience: number;
    level: number;
}

const testPlayer = [
    {
        userName: 'mlg42069',
        experience: 100,
        level: 2
    },
    {
        userName: 'coolkid',
        experience: 300,
        level: 1
    },
]

export default function Result() {
    const { resetQuestion } = UseQuestion();

    const [players, setPlayers] = useState<Player[]>(testPlayer)
    const [winner, setWinner] = useState<string>('Jellybean')
    const [winnerCode, setWinnerCode] = useState<string>('')
    const { currUser } = useUser()
    const params = useParams()

    useEffect(() => {
        const { id } = params;
        socket.emit('resultLobbyCreated', { lobbyID: id, user: currUser })

        socket.on('notifyResult', ({ playersInRoom, winner, winnerCode }) => {
            setPlayers(playersInRoom)
            setWinner(winner)
            setWinnerCode(winnerCode)

            resetQuestion();
        })

        return () => {
            socket.off('notifyResult')
            socket.disconnect()
        }
    }, [])

    return <div>
        <Navbar />
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col items-center space-y-2">
                <MatchStatsMenu winner={winner} />
                <PlayerMenu players={players} />
            </div>
            <div className="flex flex-col w-2/3">
                <h3 className="text-white font-basicFont">{winner} solution</h3>
                <Editor height="300px" theme="vs-dark" defaultLanguage="javascript" options={{
                    minimap: { enabled: false }, lineNumbersMinChars: 2, scrollbar: {
                        vertical: "hidden", // Hide vertical scrollbar
                        horizontal: "hidden", // Hide horizontal scrollbar
                    },
                    readOnly: true,
                }} value={winnerCode} />
            </div>
        </div>
    </div>
}

interface MatchStatsMenuProps {
    winner: string;
}
function MatchStatsMenu({ winner }: MatchStatsMenuProps) {
    return <div className="text-white">
        <p className="font-headerFont">Winner: {winner}</p>
    </div>
}

interface PlayerMenuProps {
    players: Player[];
}

function PlayerMenu({ players }: PlayerMenuProps) {
    return <div className="flex flex-row flex-wrap justify-center space-x-10 my-1">
        {players.map((player, index) => {
            return <IndividualPlayerResult player={player} key={index} />
        })}
    </div>
}

interface IndividualPlayerResultProps {
    player: Player;
}
function IndividualPlayerResult({ player }: IndividualPlayerResultProps) {
    return <div className="flex flex-col text-white items-center text-[14px] font-basicFont">
        <Avatar />
        <p>{player.userName}</p>
        <p>level {player.level}</p>
    </div>
}