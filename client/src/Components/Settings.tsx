import { AccountCircle } from '@mui/icons-material'
import { ReactNode, useEffect, useState } from 'react'
import { useUser } from './Contexts/userContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useToken } from './Contexts/tokenContext'
import { socket } from '../socket'

export default function Settings() {
    useEffect(() => {
        if (socket.connected) {
            socket.disconnect()
        }
    }, [])
    return <div>
        <Navbar />
        <div className="flex h-[27rem] text-black md:h-72 my-1 justify-center">
            <Dashboard />
        </div>
    </div>
}

interface Question {
    name: string,
    difficulty: string,
    topicTags: string[],
}

function Dashboard() {
    const [dashboardOption, setDashboardOption] = useState<string>("account")

    const setOption = (option: string) => {
        setDashboardOption(option)
    }

    return <div className="w-[90%] md:w-[80%] h-full bg-[#f8f8f8] border-[#666565] border-[2px] shadow-[#666565] shadow-sm">

        <div className="flex flex-row h-full">
            {/* div for side navigation bar */}
            <div className="w-fit md:w-[18%] h-full md:h-full border-r-2 border-black shadow-[#121212] shadow-md">
                <SettingIcon type="account" setOption={setOption}> <AccountCircle /> </SettingIcon>
                <SettingIcon type="solved" setOption={setOption}></SettingIcon>
            </div>
            {/* div for displaying specific settings page*/}
            {dashboardOption && <DisplayDashboardOption status={dashboardOption} />}
        </div>

    </div>
}


interface dashboardOptionProps {
    status: string
}

function DisplayDashboardOption({ status }: dashboardOptionProps) {
    const [questions, setQuestions] = useState<Question[]>([])
    const { currUser } = useUser()
    const { GetToken } = useToken()

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const accessToken = await GetToken('accessToken')

                if (!currUser || !accessToken) return

                const res = await axios.post('https://codeblitz.up.railway.app/users/questions', { questionsSolved: currUser?.questionsSolved }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })
                const { questionsData } = res.data
                setQuestions(questionsData)
            } catch (error) {
                console.log(error)
            }
        }
        fetchQuestions()
    }, [currUser])

    if (status === "account") {
        return <AccountPage questions={questions} />
    } else if (status === "solved") {
        return <QuestionDashboard questions={questions} />
    }
}

interface AccountPageProps {
    questions: Question[];
}

function AccountPage({ questions }: AccountPageProps) {
    return (
        <div className="flex flex-col w-full h-full md:justify-center items-center">
            <h3 className="self-start ml-3 my-1 font-headerFont text-lg">CodeBlitz Settings</h3>
            <div className="flex flex-col w-[90%] h-fit md:h-20 border-black border-[1px] rounded-md">
                <Account />
            </div>
            {/* displays recent questions solved */}
            <div className="flex flex-col w-full h-40 items-center my-2">
                <RecentQuestions questions={questions} />
            </div>
        </div>);
}

function Account() {
    const [deleteSelected, setDeleteSelected] = useState(false)
    const { currUser, logoutUser } = useUser()
    const { accessToken } = useToken()

    const navigate = useNavigate()

    const deleteAccount = async () => {
        if (!accessToken || !currUser) return

        try {
            const res = await axios.delete(`https://codeblitz.up.railway.app/users/delete/${currUser?.userEmail}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            if (res.status === 200) {
                logoutUser()
                navigate('/', { replace: true })
            }
        } catch (error) {
            console.log(error)
        }
    }

    return <div className="flex flex-row flex-wrap text-xs ml-4 md:ml-6 my-4 md:my-auto font-customFont">
        <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row flex-wrap sm:space-x-8">
                <p>User: {currUser?.userName}</p>
                <p>XP: {currUser?.experience}</p>
                <p>Lvl: {currUser?.level}</p>
            </div>
            <AccountCircle sx={{ height: [48, 44, 44, 44, 44], width: [30, 42, 42, 42, 42], margin: '0px' }} />
        </div>
        <div className="flex flex-col self-end ml-auto mr-4 text-[10px]">
            <p className="self-end">{currUser?.userEmail}</p>
            {deleteSelected ? <>
                <button className="border-[1px] border-black rounded-[0.125rem] w-fit pr-1 pl-1 self-end" onClick={() => setDeleteSelected((select) => !select)}>Go Back</button>
                <button className="border-[1px] border-black rounded-[0.125rem] w-fit pr-1 pl-1 self-end" onClick={deleteAccount}>Delete</button>
            </> : <>
                <button className="border-[1px] border-black rounded-[0.125rem] w-fit pr-1 pl-1 self-end" onClick={() => setDeleteSelected((select) => !select)}>Delete Account</button>
            </>}
        </div>
    </div>
}

function RecentQuestions({ questions }: AccountPageProps) {
    const questionsHead = questions.slice(0, 4)
    return <div className="flex flex-col w-[90%] h-full mb-4">
        <p className="font-headerFont text-lg">Recently solved</p>
        <div className="h-6 w-full flex flex-row border-black border-[1px] rounded-tr-md rounded-tl-md border-b-0 text-center items-center  pl-2 text-xs md:text-sm font-customFont">
            <p className="border-black border-r-[1px] pr-1 md:pr-2 w-1/4 md:w-1/3">Name</p>
            <p className="border-black border-r-[1px] pl-1 pr-1 md:pl-2 md:pr-2 w-2/4 md:w-1/3">Difficulty</p>
            <p className="pl-1 pr-1 md:pl-2 md:pr-2 w-1/4 md:w-1/3">Topic</p>
        </div>
        <div className="flex flex-col w-full h-full border-black border-[1px] rounded-bl-md rounded-br-md">
            <div className="flex flex-col h-full w-full font-basicFont ">
                {(questionsHead && questionsHead.length > 0) ? questionsHead.map(({ name, difficulty, topicTags }, index) => {
                    return <Question question={{ name, difficulty, topicTags }} page="account" key={index} />
                }) : <DisplayNoneSolved page="account" />}
            </div>

        </div>
    </div>
}

interface QuestionProps {
    question: Question,
    page: string,
}

function Question({ question, page }: QuestionProps) {
    //only show first 16 character of question name
    const questionName = question.name.slice(0, 7).padEnd(7, '\u00A0')
    const difficulty = question.difficulty.padEnd(7, '\u00A0')

    return <div className={page === 'account' ? "flex flex-row flex-wrap h-2/4 md:h-1/4 w-full items-center"
        : "flex flex-row flex-wrap h-fit md:h-1/6 w-full  items-center"}>
        <div className="flex flex-col sm:flex-row w-full ml-2 md:ml-0 text-[12px] sm:text-[14px] ">
            <p className="md:ml-2 md:w-1/3">{questionName}..</p>
            <p className="md:mx-auto md:w-1/3">{difficulty}</p>
            {question.topicTags?.length > 0 && <p className="md:ml-auto md:w-1/3">{question.topicTags[0].slice(0, 9).padEnd(9, '\u00A0')}</p>}
        </div>
    </div>
}

interface SettingProps {
    type: string,
    setOption: (option: string) => void,
    children?: ReactNode;
}

function SettingIcon({ type, setOption, children }: SettingProps) {
    const capitilizedType = type.charAt(0).toUpperCase() + type.slice(1);

    return <div className="flex flex-col h-1/5 cursor-pointer w-full border-b-2 border-black  justify-center items-center font-basicFont text-sm md:text-md pl-2 pr-2 md:pl-0 md:pr-0">
        {children}
        <p onClick={() => setOption(type)}>{capitilizedType}</p>
    </div>
}


interface Question {
    name: string,
    difficulty: string,
    topicTags: string[],
}

interface QuestionDashProps {
    questions: Question[]
}
function QuestionDashboard({ questions }: QuestionDashProps) {
    const questionsHead = questions.slice(0, 6)

    return <div className="flex flex-col w-full h-full justify-center items-center">
        < h3 className="self-start ml-4 my-2 font-headerFont text-lg" > CodeBlitz Stats</h3 >

        <div className="h-6 w-[90%] flex flex-row border-black border-[1px] border-b-0 rounded-tr-md rounded-tl-md text-center items-center text-sm font-customFont">
            <p className="border-black border-r-[1px]  pr-1 md:pr-2 w-1/4 md:w-1/3">Name</p>
            <p className="border-black border-r-[1px] pl-1 pr-1 md:pl-2 md:pr-2 w-2/4 md:w-1/3">Difficulty</p>
            <p className="pl-1 pr-1 md:pl-2 md:pr-2 w-1/4 md:w-1/3">Topic</p>
        </div>
        <div className="flex flex-col w-[90%] h-[80%] border-black border-[1px] mb-4 font-basicFont rounded-bl-md rounded-br-md">
            {(questionsHead && questionsHead.length > 0) ? questionsHead.map(({ name, difficulty, topicTags }, index) => {
                return <Question question={{ name, difficulty, topicTags }} page="solved" key={index} />
            }) : <DisplayNoneSolved page="solved" />}
        </div>
    </div >
}

interface NoneSolvedProps {
    page: string
}

function DisplayNoneSolved({ page }: NoneSolvedProps) {
    return <div className={page === "account" ? "flex flex-row flex-wrap h-fit md:h-1/4 w-full border-black border-b-[1px] items-center" : "flex flex-row flex-wrap h-fit md:h-1/6 w-full border-black border-b-[1px] items-center"}>
        <div className="flex flex-row flex-wrap  mx-auto text-xs">
            <p>No questions solved</p>
        </div>
    </div>
}