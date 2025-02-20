import { Button } from "@mui/material";
import Navbar from "./Navbar";
import { useEffect } from "react";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

export default function PrivateLobby() {

    const navigate = useNavigate();

    useEffect(() => {
        socket.on('privateCreated', ({ lobbyId }) => {
            navigate(`/privateLobby/${lobbyId}`)
        })
    }, [navigate])

    const createLobby = () => {
        socket.emit('createPrivate')
    }
    return <div>
        <Navbar />
        <div className="flex flex-row justify-center items-center space-x-4 text-black">
            <div className="flex flex-col bg-[#F0FFF0] border-[#666565] border-[1px] shadow-[#666565] shadow-sm rounded-[4px] p-2 items-center space-y-1 w-1/2">
                <p className="text-[12px] font-basicFont">To create a match click the button below to be sent to a private lobby. You can then invite friends from there</p>
                <Button sx={{ color: 'black', padding: '10px' }} onClick={createLobby}>Create Lobby</Button>
            </div>
        </div>
    </div>
}

