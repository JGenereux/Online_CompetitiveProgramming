import { Button } from "@mui/material"
import Navbar from "./Navbar"
import { socket } from "../socket.ts"
import { useEffect } from "react"
import { useUser } from "./Contexts/userContext.tsx"

document.body.style.backgroundColor = "#1e293b"


export default function Home() {
    const { currUser } = useUser()

    useEffect(() => {
        console.log(currUser)
    }, [currUser])
    return <div className="h-screen">
        <Navbar></Navbar>
        <JoinMatch />
    </div>
}

function JoinMatch() {

    //on component mount connect user socket
    useEffect(() => {
        socket.on('connect', () => {
            console.log("Connected to WebSocket", socket.id);
        });

        return () => {
            socket.off('connect')
        }
    }, [])

    //Connect player to socket 
    return <div className="flex flex-row justify-center items-center h-screen">
        <Button href="/lobby">Join Match</Button>
    </div>
}

//Whenever a player starts a match a socket needs to create a seperate game
//and once the game is ready the player will get routed to the link
//If a player has started a match have the websocket route them to a game that is already open
