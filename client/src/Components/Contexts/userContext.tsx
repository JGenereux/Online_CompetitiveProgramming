/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useState } from "react";

interface User {
  userEmail: string;
  userName: string;
  questionsSolved: string[];
  experience: number;
  level: number;
}

interface UserContextType {
  currUser: User | null;
  loginUser: (userInfo: User) => void;
  updateUserExp: (experience: number) => void;
}

const defaultUser: User = {
  userEmail: "",
  userName: "",
  questionsSolved: [],
  experience: 0,
  level: 0,
};

// Define and export context
export const UserContext = createContext<UserContextType>({
  currUser: defaultUser,
  loginUser: () => {
    throw new Error("loginUser function must be used within UserProvider");
  },
  updateUserExp: () => {
    throw new Error("updateUserExp function must be used within UserProvider");
  }
});


interface UserProviderProps {
  children: ReactNode;
}

// Define and export provider
export const UserProvider = ({ children }: UserProviderProps) => {
  const [currUser, setUser] = useState<User>(defaultUser);

  const loginUser = (userInfo: User) => {
    setUser(userInfo)
  }

  const updateUserExp = (experience: number) => {
    setUser({
      ...currUser,
      experience: currUser.experience + experience
    })
  }

  return (
    <UserContext.Provider value={{ currUser, loginUser, updateUserExp }}>
      {children}
    </UserContext.Provider >

  )
};

export const useUser = () => useContext(UserContext)