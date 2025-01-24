import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Components/Home"
import Lobby from "./Components/Lobby"
import Match from "./Components/Match"
import { useEffect, useState } from "react"
import { socket } from "./socket"
import Result from "./Components/Result"
import { UserProvider } from "./Components/Contexts/userContext"
import Login from "./Components/Login"
import SignupForm from "./Components/SignUpForm"
import PrivateLobby from "./Components/PrivateLobby"
import { ProtectedRoute } from "./Components/Contexts/ProtectedRoutes"

interface Test {
  expectedResult: string,
  case: Record<'key2' | 'key3', string>,
}

interface QuestionInterface {
  content: string,
  difficulty: string,
  hints: string[],
  title: string,
  topicTags: string[],
  testCases: Test[]
}


function App() {
  const [question, setQuestion] = useState<QuestionInterface>({
    content: '',
    difficulty: '',
    hints: [],
    title: '',
    topicTags: [],
    testCases: [],
  });
  const [value, setValue] = useState("");

  // Separate useEffect for initial data loading
  useEffect(() => {
    const loadCachedData = () => {
      try {
        const lcQuestion = localStorage.getItem('cachedQuestion');
        const funcCall = localStorage.getItem('cachedFunction');

        if (lcQuestion) {
          const parsedQuestion = JSON.parse(lcQuestion);
          // Only set if we don't already have content
          if (!question.content) {
            setQuestion(parsedQuestion);
          }
        }

        if (funcCall && !value) {
          setValue(funcCall);
        }
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    };

    loadCachedData();
  }, [question, value]); // Run only on mount

  // Separate useEffect for socket events
  useEffect(() => {
    const handleOccuringMatch = ({ lcQuestion, functionCall }: { lcQuestion: string, functionCall: string }) => {
      try {
        const parsedQuestion = JSON.parse(lcQuestion);
        setQuestion(parsedQuestion);
        setValue(functionCall);

        localStorage.setItem("cachedQuestion", lcQuestion);
        localStorage.setItem("cachedFunction", functionCall);
      } catch (error) {
        console.error('Error handling match:', error);
      }
    };


    socket.on('occuringMatch', handleOccuringMatch);

    return () => {
      socket.off('occuringMatch');
    };

  }, [value]); // Include value in dependencies

  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <Lobby isPublic={true} />
              </ProtectedRoute>
            }
          />
          <Route path="/lobby/:id" element={<ProtectedRoute> <Match question={question} setQuestion={setQuestion} value={value} setValue={setValue} /> </ProtectedRoute>} />
          <Route path="/privateLobby" element={<ProtectedRoute> <PrivateLobby /> </ProtectedRoute>} />
          <Route path="/privateLobby/:id" element={<ProtectedRoute> <Lobby isPublic={false} /> </ProtectedRoute>} />
          <Route path="/result/:id" element={<ProtectedRoute> <Result /> </ProtectedRoute>} />
        </Routes>
      </BrowserRouter >
    </UserProvider>
  )
}

export default App
