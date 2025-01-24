import { Navigate } from "react-router-dom"
import { useUser } from "./userContext"
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { currUser } = useUser()


    if (!currUser || !currUser.userEmail) {
        return <Navigate to="/login" replace={true} />
    }

    return children
}