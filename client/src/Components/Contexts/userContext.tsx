/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
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
  updateUser: () => void;
  logoutUser: () => void;
}

const defaultUser: User = {
  userEmail: "",
  userName: "",
  questionsSolved: [],
  experience: 0,
  level: 0,
};

export const UserContext = createContext<UserContextType>({
  currUser: defaultUser,
  loginUser: () => {
    throw new Error("loginUser function must be used within UserProvider");
  },
  updateUser: () => {
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
    const storedUser = sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : defaultUser;
  });

  useEffect(() => {
    if (currUser.userEmail) {
      sessionStorage.setItem('user', JSON.stringify(currUser));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [currUser]);

  const loginUser = (userInfo: User) => {
    setUser(userInfo)
  }

  const updateUser = async () => {
    if (!currUser) return;

    try {
      const res = await axios.get(`http://localhost:5000/users/retrieveUser?email=${currUser.userEmail}`)
      console.log(res);
      const { experience, level, userEmail, userName, questionsSolved } = res.data;
      setUser({
        userName: userName,
        userEmail: userEmail,
        experience: experience,
        level: level,
        questionsSolved: questionsSolved,
      })
    } catch (error) {
      console.log(error)
    }
  }

  const logoutUser = () => {
    if (!currUser) return;
    sessionStorage.removeItem('user');
    setUser(defaultUser)
  }

  return (
    <UserContext.Provider value={{ currUser, loginUser, updateUser, logoutUser }}>
      {children}
    </UserContext.Provider >

  )
};

export const useUser = () => useContext(UserContext)