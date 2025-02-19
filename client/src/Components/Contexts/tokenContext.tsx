import axios from "axios";
import { createContext, ReactNode, useContext, useState } from "react";
import { useUser } from "./userContext";

interface TokenContextType {
    accessToken: string,
    refreshToken: string,
    SetToken: (type: string, token: string) => void
    RemoveToken: (type: string) => void
    GetToken: (type: string) => Promise<string | null>
}

export const TokenContext = createContext<TokenContextType>({
    accessToken: '',
    refreshToken: '',
    SetToken: () => {
        throw new Error("SetToken function must be used within TokenProvider");
    },
    RemoveToken: () => {
        throw new Error("RemoveToken function must be used within TokenProvider");
    },
    GetToken: () => {
        throw new Error("GetToken function must be used within TokenProvider");
    }
})

interface TokenProviderProps {
    children: ReactNode;
}

export const TokenProvider = ({ children }: TokenProviderProps) => {
    const [accessToken, setAccessToken] = useState(() => {
        const storedAccessToken = sessionStorage.getItem('accessToken')
        return storedAccessToken ? storedAccessToken : ""
    })
    const [refreshToken, setRefreshToken] = useState(() => {
        const storedRefreshToken = sessionStorage.getItem('refreshToken')
        return storedRefreshToken ? storedRefreshToken : ""
    })

    const { currUser } = useUser()


    async function GetToken(type: string): Promise<string | null> {
        if (refreshToken == null || refreshToken.length == 0) {
            window.location.replace('/login');
            return null
        }

        if (type == 'accessToken') {
            try {
                if (accessToken == null) {
                    const res = await axios.post('http://localhost:5000/users/token', { refreshToken: refreshToken, email: currUser?.userEmail })
                    SetToken('accessToken', res.data.accessToken)
                    return res.data.accessToken
                }
            } catch (error) {
                console.log(error)
                return null
            }

            if (accessToken.length == 0) return null

            return sessionStorage.getItem('accessToken')
        } else if (type == 'refreshToken') {
            return sessionStorage.getItem('refreshToken')
        }

        return null
    }

    function SetToken(type: string, token: string) {
        if (type == 'accessToken') {
            setAccessToken(token)
            sessionStorage.setItem('accessToken', token)
        } else if (type == 'refreshToken') {
            setRefreshToken(token)
            sessionStorage.setItem('refreshToken', token)
        }
    }

    function RemoveToken(type: string) {
        if (type == 'accessToken') {
            sessionStorage.removeItem('accessToken')
            setAccessToken('')
        } else if (type == 'refreshToken') {
            sessionStorage.removeItem('refreshToken')
            setRefreshToken('')
        }
    }

    return <TokenContext.Provider value={{ accessToken, refreshToken, SetToken, RemoveToken, GetToken }}>
        {children}
    </TokenContext.Provider>
}

export const useToken = () => useContext(TokenContext)