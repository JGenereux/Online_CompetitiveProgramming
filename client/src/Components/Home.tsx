import { Button } from "@mui/material"
import Navbar from "./Navbar"
import earthIcon from '../assets/Images/earth.png'
import lockIcon from '../assets/Images/secure-lock.png'

document.body.style.backgroundColor = "#121212"

export default function Home() {
    return <div className="flex flex-col text-white">
        <Navbar></Navbar>
        <div className="flex flex-col ml-6 md:ml-12 my-4 w-[80%] space-y-1">
            <h3 className="font-headerFont text-3xl md:text-5xl">CodeBlitz</h3>
            <p className="text-sm font-basicFont ml-[0.4rem]">Make interview prep more exciting by competing in coding matches against other developers</p>
        </div>
        <div className="flex h-64 justify-center items-center">
            <JoinMatch />
        </div>
    </div>
}

function JoinMatch() {
    return <div className="flex flex-row w-[65%] md:w-[50%] h-fit justify-center items-center space-x-6 text-white">
        <div className="flex flex-col bg-[#1F1B24] space-y-1 w-[100%] h-full md:w-[40%] rounded-[4px] p-2 items-center text-center text-xs md:text-sm">
            <p className="font-basicFont">Play against anyone</p>
            <img src={earthIcon} className="w-[96%] md:w-[80%]"></img>
            <Button href="/lobby" sx={{ color: 'white', padding: '10px', fontSize: ['12px', '14px'] }}>Random Match</Button>
        </div>
        <div className="flex flex-col space-y-1 bg-[#1F1B24]  w-[100%] md:w-[40%] h-full rounded-[4px] p-2 items-center text-center text-xs md:text-sm">
            <p className="font-basicFont">Play against friends</p>
            <img src={lockIcon} className="w-[100%] md:w-[80%]"></img>
            <Button href="/privateLobby" sx={{ color: 'white', padding: '10px', fontSize: ['12px', '14px'] }}>Private Match </Button>
        </div>
    </div >
}
