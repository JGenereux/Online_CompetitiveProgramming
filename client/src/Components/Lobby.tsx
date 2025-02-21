import { useEffect, useState } from "react";
import { socket } from '../socket';
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import copyIcon from '../assets/Images/copyIcon.png'

interface LobbyProps {
    isPublic: boolean;
}
export default function Lobby({ isPublic }: LobbyProps) {
    return (
        <div>
            <Navbar />
            <WaitingLobby isPublic={isPublic} />
        </div>
    )
}

function WaitingLobby({ isPublic }: LobbyProps) {
    //need to make a global context for all running lobbyID's to be stored in
    const [playerCount, setPlayerCount] = useState(0);
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }
        socket.emit('joinMatch')

        socket.on('roomUpdate', ({ playersInRoom }) => {
            setPlayerCount(playersInRoom); // Update the player count state
        });

        socket.on('startMatch', ({ lobbyId }) => {
            navigate(`/lobby/${lobbyId}`)
        });

        return () => {
            socket.off('roomUpdate');
            socket.off('startMatch');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const copyLink = async () => {
        try {
            const { id } = params;
            const link = `https://codeblitzxyz.vercel.app/lobby${id}`
            await navigator.clipboard.writeText(link);
            alert('link copied to clipboard')
        } catch (err) {
            alert('Failed to copy the link: ' + err);
        }
    }

    return (
        <div className="flex flex-col items-center font-basicFont justify-center my-4 text-white">
            <div className="flex flex-row  text-xl">
                <h3>Players: </h3>
                <h3>{playerCount}/2</h3>
            </div>
            {!isPublic && <div className="flex flex-row text-lg">
                <p>Invite friends</p>
                <img src={copyIcon} className="h-8 cursor-pointer" onClick={copyLink}></img>
            </div>}
        </div >
    );
}
