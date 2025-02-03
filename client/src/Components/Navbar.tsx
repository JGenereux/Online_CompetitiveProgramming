import { AccountCircle } from "@mui/icons-material"
import ProgressBar from "./ProgressBar"
import { useState } from "react"
import { useUser } from "./Contexts/userContext"

export default function Navbar() {
    const [openAccount, setOpenAccount] = useState(false)

    const HandleAccount = () => {
        setOpenAccount((account) => !account)
    }

    return <div className="flex flex-row flex-wrap w-full z-50 static items-center text-white font-customFont">
        <div className="space-x-4 ml-4">
            <a href="/" className="text-sm">Home</a>
            <a href="/about" className="text-sm">Leaderboards</a>
        </div>

        <div className="flex flex-col ml-auto my-2 mr-4">
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
}

interface AcctDisplayProps {
    HandleAccount: () => void,
}

function AcctOptionsDisplay({ HandleAccount }: AcctDisplayProps) {
    const { currUser, logoutUser } = useUser()


    const HandleLogout = () => {
        HandleAccount();
        logoutUser();
    }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row items-center space-x-1">
                {(currUser && currUser.userName.length > 0) ? <p className="text-sm " > {currUser.userName}</p > : <p className="text-sm"> not logged in</p >}
                <AccountCircle sx={{ width: '18px', height: '18px', cursor: 'pointer' }} onClick={HandleAccount} />
            </div>
            <div className="flex flex-col ml-auto text-[12px]">
                {currUser && currUser.userName.length > 0 ? <p>{
                    <button className="ml-auto text-sm" onClick={HandleLogout}>Logout</button>
                    /*put settings and signout here */
                }</p> : <a href="/login">Login</a>}
            </div>
        </div>
    )
}

function NormalAcctDisplay({ HandleAccount }: AcctDisplayProps) {
    const { currUser } = useUser()

    return <div className="flex flex-row items-center space-x-1">
        {(currUser && currUser.userName.length > 0) ? <p className="text-sm ">{currUser.userName}</p> : <p className="text-sm"> not logged in</p >}
        <AccountCircle sx={{ width: '18px', height: '18px', cursor: 'pointer' }} onClick={HandleAccount} />
    </div>
}