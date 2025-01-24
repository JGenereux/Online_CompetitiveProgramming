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
        //emit to createPrivate event which will return the lobbyID
    }
    return <div>
        <Navbar />
        <div className="flex flex-row justify-center items-center text-white space-x-4">
            <div className="flex flex-col bg-[#1F1B24] rounded-[4px] p-2 items-center space-y-1 w-1/2">
                <p className="text-[12px] font-basicFont">To create a match click the button below to be sent to a private lobby. You can then invite friends from there</p>
                <Button sx={{ color: 'white', padding: '10px' }} onClick={createLobby}>Create Lobby</Button>
            </div>
        </div>
    </div>
}

