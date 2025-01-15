// UserProvider.tsx
import { ReactNode, useState } from "react";
import { UserContext } from "./userContext"; // Import context

interface User {
  userEmail: string;
  userName: string;
  questionsSolved: string[];
  experience: number;
}

interface UserProviderProps {
  children: ReactNode;
}

// Define and export provider
export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>({
    userEmail: "",
    userName: "",
    questionsSolved: [],
    experience: 0.0,
  });
  return (
  
  )
};