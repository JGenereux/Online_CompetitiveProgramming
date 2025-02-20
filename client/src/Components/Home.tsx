import { Button } from "@mui/material"
import Navbar from "./Navbar"
import earthIcon from '../assets/Images/earth.png'
import lockIcon from '../assets/Images/secure-lock.png'
import { useNavigate } from "react-router-dom"
import { socket } from "../socket"
import { useEffect } from "react"

document.body.style.backgroundColor = "#121212"

export default function Home() {
    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }
    }, [])
    return <div className="flex flex-col text-white">
        <Navbar></Navbar>
        <div className="flex flex-col ml-6 md:ml-12 w-[80%] h-fit space-y-[8px]">
            <h3 className="font-headerFont text-3xl md:text-5xl">CodeBlitz</h3>
            <p className="text-sm md:text-md font-basicFont ml-[0.5rem] md:ml-[1.5rem]">Prepare for Real-World Interviews by Competing in Online Matches versus Developers and Friends!</p>
        </div>
        <div className="flex h-full justify-center my-3">
            <JoinMatch />
        </div>
    </div>
}

function JoinMatch() {
    const navigate = useNavigate()

    return <div className="flex flex-row w-[65%] md:w-[40%] h-fit justify-center items-center space-x-6">
        <div className="flex flex-col bg-white text-black bg-opacity-90 space-y-1 w-40 h-full rounded-[4px] p-2 items-center text-center text-xs md:text-sm">
            <p className="font-basicFont">Play against anyone</p>
            <img src={earthIcon} className="w-[96%] md:w-[80%]"></img>
            <Button onClick={() => navigate('/lobby')} sx={{ color: 'black', padding: ['3px', '5px'], fontSize: ['12px'], fontFamily: 'headerFont', border: 'solid black', borderWidth: '1.2px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.25)' }}>Join Match</Button>
        </div>
        <div className="flex flex-col space-y-1 bg-white text-black bg-opacity-90 w-40 h-full rounded-[4px] p-2 items-center text-center text-xs md:text-sm">
            <p className="font-basicFont">Play against friends</p>
            <img src={lockIcon} className="w-[100%] md:w-[80%]"></img>
            <Button onClick={() => navigate('/privateLobby')} sx={{ color: 'black', padding: ['3px', '5px'], fontSize: ['12px'], fontFamily: 'headerFont', border: 'solid black', borderWidth: '1.2px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.25)' }}>Start Match </Button>
        </div>
    </div >
}
