import { useEffect, useState } from "react";
import { socket } from '../socket';
import { useNavigate } from "react-router-dom";

export default function Lobby() {
    return (
        <div>
            <WaitingLobby />
        </div>
    )
}

function WaitingLobby() {
    //need to make a global context for all running lobbyID's to be stored in
    const [playerCount, setPlayerCount] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('joinMatch')

        socket.on('roomUpdate', ({ roomName, playersInRoom }) => {
            console.log("You've joined ", roomName)
            setPlayerCount(playersInRoom); // Update the player count state
        });

        socket.on('startMatch', ({ lobbyId }) => {
            navigate(`/lobby/${lobbyId}`)
        });

        return () => {
            socket.off('roomUpdate');
            socket.off('startMatch');
        };
    }, []);

    return (
        <div>
            <div className="flex flex-row ml-2 my-2">
                <h3>Players: </h3>
                <h3>{playerCount}/2</h3>
            </div>
        </div >
    );
}
