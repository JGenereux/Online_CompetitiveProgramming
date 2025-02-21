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
        <div className="flex flex-col ml-10 md:ml-12 w-[80%] h-fit space-y-[8px]">
            <h3 className="font-headerFont text-4xl md:text-6xl lg:text-7xl">CodeBlitz</h3>
            <p className="text-md md:text-xl lg:text-2xl font-basicFont ml-[0.5rem] md:ml-[1.5rem]">Prepare for Real-World Interviews by Competing in Online Matches versus Developers and Friends!</p>
        </div>
        <div className="flex justify-center md:h-72 lg:h-[24rem] my-3">
            <JoinMatch />
        </div>
    </div>
}

function JoinMatch() {
    const navigate = useNavigate()

    return <div className="flex flex-row w-[65%] md:w-[45%] lg:md:w-[40%] justify-center items-center space-x-6">
        <div className="flex flex-col bg-white text-black bg-opacity-90 w-40 md:w-1/2 h-full rounded-xl py-4 items-center lg:justify-center text-center ">
            <p className="font-basicFont text-xs md:text-sm lg:text-lg lg:mb-4">Play against anyone</p>
            <div className="flex flex-col items-center">
                <img src={earthIcon} className="w-full md:w-36 lg:w-60 lg:mb-1.5"></img>
                <Button onClick={() => navigate('/lobby')} sx={{ color: 'black', padding: ['3px', '5px'], fontSize: ['12px', '18px'], fontFamily: 'headerFont', border: 'solid black', borderWidth: '1.2px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.25)' }}>Join Match</Button>
            </div>
        </div>
        <div className="flex flex-col bg-white text-black bg-opacity-90 w-40 md:w-1/2 h-full rounded-xl py-4 items-center lg:justify-center text-center">
            <p className="font-basicFont text-xs md:text-sm lg:text-lg lg:mb-4">Play against friends</p>
            <div className="flex flex-col items-center justify-center">
                <img src={lockIcon} className="w-full md:w-36 lg:w-60 lg:mb-1"></img>
                <Button onClick={() => navigate('/privateLobby')} sx={{ color: 'black', padding: ['3px', '5px'], fontSize: ['12px', '18px'], fontFamily: 'headerFont', border: 'solid black', borderWidth: '1.2px', boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.25)' }}>Start Match </Button>
            </div>
        </div>
    </div >
}
