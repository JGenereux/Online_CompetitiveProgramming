import { AccountCircle } from "@mui/icons-material"
import ProgressBar from "./ProgressBar"
import { useState } from "react"
import { useUser } from "./Contexts/userContext"
import { Link } from "react-router-dom"
import axios from "axios"
import { useToken } from "./Contexts/tokenContext"

export default function Navbar() {
    const [openAccount, setOpenAccount] = useState(false)

    const HandleAccount = () => {
        setOpenAccount((account) => !account)
    }

    return <div className="flex flex-row flex-wrap z-50 static items-center text-white font-customFont">
        <div className="space-x-4 ml-4 my-2 sm:my-0">
            <a href="/" className="text-xs sm:text-sm">Home</a>
            <a href="/about" className="text-xs sm:text-sm">Leaderboards</a>
        </div>

        <div className="ml-auto">
            <div className="flex flex-col sm:my-2 mr-4 w-full">
                {openAccount ? <>
                    <AcctOptionsDisplay HandleAccount={HandleAccount} />
                </> :
                    <>
                        <NormalAcctDisplay HandleAccount={HandleAccount} />
                        <ProgressBar />
                    </>
                }
            </div>
        </div>
    </div>
}

interface AcctDisplayProps {
    HandleAccount: () => void,
}

function AcctOptionsDisplay({ HandleAccount }: AcctDisplayProps) {
    const { currUser, logoutUser } = useUser()
    const { GetToken, RemoveToken } = useToken()

    const HandleLogout = async () => {
        try {
            const accessToken = await GetToken('accessToken')
            const refreshToken = await GetToken('refreshToken')

            if (!accessToken || !refreshToken) return

            await axios.delete(`http://localhost:5000/users/logout/${currUser?.userEmail}`, {
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
        <div className="flex flex-col mr-4">
            <div className="flex flex-row items-center space-x-1 ml-auto">
                {(currUser && currUser.userName.length > 0) ? <p className="text-xs sm:text-sm"> {currUser.userName}</p > : <p className="text-xs sm:text-sm"> not logged in</p >}
                <AccountCircle sx={{ width: '18px', height: '18px', cursor: 'pointer' }} onClick={HandleAccount} />
            </div>
            <div className="flex flex-col ml-auto text-xs sm:text-sm">
                {currUser && currUser.userName.length > 0 ?
                    <div className="flex flex-row flex-wrap space-x-2">
                        <Link to="/settings">Settings</Link>
                        <button onClick={HandleLogout}>Logout</button>
                    </div>
                    : <a href="/login">Login</a>}
            </div>
        </div>
    )
}

function NormalAcctDisplay({ HandleAccount }: AcctDisplayProps) {
    const { currUser } = useUser()

    return <div className="flex flex-row items-center space-x-1">
        {(currUser && currUser.userName.length > 0) ? <p className="text-xs sm:text-sm">{currUser.userName}</p> : <p className="text-xs sm:text-sm"> not logged in</p >}
        <AccountCircle sx={{ width: '18px', height: '18px', cursor: 'pointer' }} onClick={HandleAccount} />
    </div>
}