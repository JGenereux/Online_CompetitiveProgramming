import { AccountCircle } from "@mui/icons-material"
import ProgressBar from "./ProgressBar"
import { useState } from "react"
import { useUser } from "./Contexts/userContext"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useToken } from "./Contexts/tokenContext"

export default function Navbar() {
    const navigate = useNavigate()
    const [openAccount, setOpenAccount] = useState(false)

    const HandleAccount = () => {
        setOpenAccount((account) => !account)
    }

    return <div className="flex flex-row flex-wrap z-50 my-2 md:my-0 static items-center text-white font-customFont">
        <div className="flex flex-row flex-wrap space-x-4 sm:space-x-6 md:space-x-8 ml-4 my-2 sm:my-0 font-basicFont">
            <a onClick={() => navigate('/')} className="text-xs sm:text-sm md:text-lg">Home</a>
            <a onClick={() => navigate('/about')} className="text-xs sm:text-sm md:text-lg">Leaderboards</a>
        </div>

        <div className={openAccount ? "ml-auto w-fit" : "ml-auto w-[45%] sm:w-[25%]"}>
            <div className="flex flex-col sm:my-2 pr-6 w-full">
                {openAccount ?
                    <AcctOptionsDisplay HandleAccount={HandleAccount} />
                    :
                    <div className="flex flex-col w-full">
                        <NormalAcctDisplay HandleAccount={HandleAccount} />
                        <ProgressBar />
                    </div>
                }
            </div>
        </div>
    </div>
}

interface AcctDisplayProps {
    HandleAccount: () => void,
}

function AcctOptionsDisplay({ HandleAccount }: AcctDisplayProps) {
    const navigate = useNavigate();
    const { currUser, logoutUser } = useUser()
    const { GetToken, RemoveToken } = useToken()

    const HandleLogout = async () => {
        try {
            const accessToken = await GetToken('accessToken')
            const refreshToken = await GetToken('refreshToken')

            if (!accessToken || !refreshToken) return

            await axios.delete(`https://codeblitz.up.railway.app/users/logout/${currUser?.userEmail}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "x-refresh-token": refreshToken
                }
            })
            HandleAccount()
            RemoveToken('accessToken')
            RemoveToken('refreshToken')
            logoutUser()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="flex flex-col mr-4 w-full">
            <div className="flex flex-row items-center space-x-1 ml-auto">
                {(currUser && currUser.userName.length > 0) ? <p className="text-xs sm:text-sm md:text-lg font-headerFont"> {currUser.userName}</p > : <p className="text-xs sm:text-sm md:text-lg font-headerFont"> not logged in</p >}
                <AccountCircle sx={{ width: ['18px', '28px'], height: ['18px', '28px'], cursor: 'pointer' }} onClick={HandleAccount} />
            </div>
            <div className="flex flex-col ml-auto text-xs sm:text-sm md:text-md font-basicFont">
                {currUser && currUser.userName.length > 0 ?
                    <div className="flex flex-row flex-wrap space-x-2">
                        <Link to="/settings">Settings</Link>
                        <button onClick={HandleLogout}>Logout</button>
                    </div>
                    : <a onClick={() => navigate('/login')}>Login</a>}
            </div>
        </div>
    )
}

function NormalAcctDisplay({ HandleAccount }: AcctDisplayProps) {
    const { currUser } = useUser()

    return <div className="flex flex-row w-full justify-end space-x-1 font-headerFont items-center">
        {(currUser && currUser.userName.length > 0) ? <p className="text-xs sm:text-sm md:text-lg">{currUser.userName}</p> : <p className="text-xs sm:text-sm md:text-lg"> not logged in</p >}
        <AccountCircle sx={{ width: ['18px', '28px'], height: ['18px', '28px'], cursor: 'pointer' }} onClick={HandleAccount} />
    </div>
}