/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

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
  logoutUser: () => void;
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
  },
  logoutUser: () => {
    throw new Error("logoutUser function must be used within UserProvider")
  }
});


interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [currUser, setUser] = useState<User>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : defaultUser;
  });

  //used to store and update user in localStorage
  useEffect(() => {
    if (currUser !== defaultUser) {
      localStorage.setItem('user', JSON.stringify(currUser))
    } else {
      localStorage.removeItem('user')
    }
  }, [currUser])

  const loginUser = (userInfo: User) => {
    setUser(userInfo)
  }

  const updateUserExp = (experience: number) => {
    setUser({
      ...currUser,
      experience: currUser.experience + experience
    })
  }

  const logoutUser = () => {
    setUser(defaultUser)
    localStorage.removeItem('user')
  }

  return (
    <UserContext.Provider value={{ currUser, loginUser, updateUserExp, logoutUser }}>
      {children}
    </UserContext.Provider >

  )
};

export const useUser = () => useContext(UserContext)