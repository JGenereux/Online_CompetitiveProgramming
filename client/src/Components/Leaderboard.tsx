import axios from "axios"
import { useEffect, useState } from "react"
import Navbar from "./Navbar"
import { AccountCircle } from "@mui/icons-material"

interface PlayerStats {
    userName: string,
    level: number,
    questionsSolved: number,
}

export default function Leaderboard() {

    return <div>
        <Navbar />
        <h3 className="text-white font-headerFont text-4xl md:text-[2.75rem] lg:text-[3.5rem] ml-4 md:ml-6 lg:ml-8 md:py-1">Leaderboard</h3>
        <div className="h-[80vh]">
            <Main />
        </div>
    </div>
}

function Main() {
    const [leaderboard, setLeadboard] = useState<PlayerStats[]>([])

    const [isDesktop, setDesktop] = useState(window.innerWidth > 767) // 768 is when viewport size is < md

    const handleResize = () => {
        setDesktop(window.innerWidth > 767)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        async function getLeaderboard() {
            try {
                const res = await axios.get('http://localhost:5000/leaderboard/')
                if (res.data) {
                    const arr: PlayerStats[] = res.data
                    const sortedArr = arr.sort((a, b) => b.level - a.level)
                    setLeadboard(sortedArr)
                }
            } catch (error) {
                console.log('Error fetching leaderboard from server', error)
            }
        }
        getLeaderboard()
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return <div className="flex flex-col h-full w-[90%] md:w-[80%] ml-4 sm:ml-6 md:ml-12 lg:ml-20">
        {leaderboard[0] && <NumberOne user={leaderboard[0]} />}
        <div className="flex flex-col h-full overflow-y-scroll my-2 md:my-6">
            <div className="flex flex-row w-full text-white text-sm sm:text-lg md:text-xl lg:text-3xl font-customFont">
                <p className="w-1/3 text-center">User</p>
                <p className="w-1/3 text-center">Level</p>
                {isDesktop ? <p className="w-1/3 text-center">Questions Solved</p> : <p className="w-1/3 text-center">Solved</p>}
            </div>
            <Stats leaderboard={leaderboard} />
        </div>
    </div>
}

interface StatsProps {
    leaderboard: PlayerStats[]
}

function Stats({ leaderboard }: StatsProps) {
    const [isDesktop, setDesktop] = useState(window.innerWidth > 767) // 768 is when viewport size is < md

    const handleResize = () => {
        setDesktop(window.innerWidth > 767)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener("resize", handleResize)
    })

    return <div className="h-[6%] lg:h-[5%]">
        {leaderboard?.map((playerStat, index) => (
            <div key={index} className="text-white h-full flex flex-row xs:text-md sm:text-lg md:text-xl lg:text-3xl font-basicFont space-x-4 border-white border-b-2 items-center">
                <div className="flex flex-row w-1/3 items-center justify-center">
                    <p className="w-1/3 ml-1 md:ml-3">#{index + 1}</p>
                    <div className="flex flex-row w-2/3 space-x-1 md:space-x-2 items-center">
                        {isDesktop ? <>
                            <AccountCircle sx={{ height: ['20px', '24px', '34px', '34px'], width: ['20px', '24px', '34px', '34px'] }} />
                            <p>{playerStat.userName}</p>
                        </> : <p>{playerStat.userName.slice(0, 5)}..</p>}
                    </div>
                </div>
                <p className="w-1/3 text-center">{playerStat.level}</p>
                <p className="w-1/3 text-center">{playerStat.questionsSolved}</p>
            </div>
        ))}
    </div>
}

interface NumberOneProps {
    user: PlayerStats
}

function NumberOne({ user }: NumberOneProps) {

    const [isDesktop, setDesktop] = useState(window.innerWidth > 767) // 768 is when viewport size is < md

    const handleResize = () => {
        setDesktop(window.innerWidth > 767)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return window.removeEventListener('resize', handleResize)
    }, [])
    return <div className="flex flex-col w-full h-fit my-6 text-white pl-4 pr-6 border-2 rounded-xl border-[#666565] shadow-[#666565] shadow-sm">
        <div className="flex flex-col">
            <h3 className="font-headerFont xs:text-lg sm:text-xl md:text-3xl lg:text-4xl">Current #1</h3>
            <AccountCircle sx={{ width: ['44px', '60px', '64px', '84px'], height: ['44px', '60px', '64px', '84px'], marginLeft: ['0px', '20px'] }} />
        </div>
        <div className="flex flex-row space-x-4 md:ml-4 md:my-1 font-customFont text-[12px] sm:text-md md:text-xl lg:text-3xl ">
            <p>User: {user.userName}</p>
            <p>Level: {user.level}</p>
            {isDesktop ? <p>Questions Solved: {user.questionsSolved}</p> : <p>Solved: {user.questionsSolved}</p>}
        </div>
    </div>
}