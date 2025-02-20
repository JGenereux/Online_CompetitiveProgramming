/* eslint-disable @typescript-eslint/no-unused-vars */

import axios from "axios";
import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react"
import { Button } from "@mui/material";
import MenuBar from "./MenuBar";
import { socket } from "../socket";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "./Contexts/userContext";
import { UseQuestion } from "./Contexts/questionContext";
import Navbar from "./Navbar";

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
    testCases: Test[],
}

interface testCase {
    expectedOutput: string,
    userOutput: string,
    passed: boolean
}

export default function Match() {
    const { question, value, resetQuestion, setValue } = UseQuestion()
    const { currUser, updateUser } = useUser()

    const [questionPassed, setQuestionPassed] = useState<boolean>(false);
    const [currLanguage, setCurrLanguage] = useState<string>('python')
    const [currLanguageVersion, setCurrLanguageVersion] = useState<string>("3.10.0")
    const [codeResponse, setCodeResponse] = useState<string[]>([])
    const [testCases, setTestCases] = useState<testCase[]>([])
    const [expectedOutputs, setExpectedOutputs] = useState<string[]>([]);

    const [disconnected, setDisconnected] = useState<boolean>(false)

    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        //if the question didn't load (means error or user just entered a random id) and redirects back home
        if (!question || question.content.length == 0) {
            window.alert('Must start a game through the options on the home screen')
            navigate('/', { replace: true })
            resetQuestion();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }
        const { id } = params;

        socket.on('playerDisconnected', ({ disconnected }) => {
            if (disconnected) {
                window.alert('One of the users left. The game is now ending!')
                resetQuestion()
                navigate('/', { replace: true })
            }
        })

        socket.on('matchExpired', ({ disconnected }) => {
            if (disconnected) {
                window.alert('One of the users left. The game is now ending!')
                resetQuestion()
                navigate('/', { replace: true })
            }
        })

        //navigates the user to the result page to show user's that played
        //and their scores
        socket.on('gameResult', ({ result, message }) => {
            if (result) {
                window.alert(message)
                resetQuestion()
                navigate(`/result/${id}`, { replace: true })
            }
        })

        if (!expectedOutputs || expectedOutputs.length == 0) {
            question.testCases.forEach((question) => {
                setExpectedOutputs((outputs) => [...outputs, question.expectedResult])
            })
        }

        return () => {
            socket.off('playerDisconnected')
            socket.off('matchExpired')
            socket.off('gameResult')
            socket.disconnect()
        }
    }, [])

    //When the user switches their language ensure they get the appropriate function call
    //switched
    useEffect(() => {
        if (!question || question.content.length == 0) return
        const updateCalls = async () => {
            try {
                const res = await axios.post('https://codeblitz.up.railway.app/question/update', { currLanguage: currLanguage, question: question })
                console.log(res.data)
                setValue(res.data.functionCall)
            } catch (error) {
                //navigate('/', {replace: true})
                console.log(` failed fetching new function call: ${error}`)
            }
        }
        updateCalls()
    }, [currLanguage, question])


    //Pass userName & questionDifficulty into get request
    /** backend 
     *     -fetch how much xp the question was worth and add to user
     *     -send client updatedUser
     *  client
     *      -updates user with response from backend
     */
    const RunCode = async () => {
        try {
            const { id } = params;
            if (!currUser) {
                return
            }

            const runTestInfo = {
                userCode: value,
                currLanguage: currLanguage,
                languageVersion: currLanguageVersion,
                lobbyID: id,
                userName: currUser.userName,
                question: question
            }
            const res = await axios.post(`https://codeblitz.up.railway.app/question/runTest`, runTestInfo)

            const { testsPassed, passed } = res.data;

            const caseResults = testsPassed;
            const responses: string[] = [];

            caseResults.map((result: testCase) => {
                responses.push(result.userOutput);
            })

            if (passed) {
                updateUser();
            }

            setTestCases(testsPassed);
            setQuestionPassed(passed);
            setCodeResponse(responses);
        } catch (error) {
            console.log(error)
        }
    }

    return <div className="flex flex-col">
        <Navbar />
        {/* If a player has left the match show the player */}
        {disconnected && <div>
            <p>Other player left, sending you back to home</p>
        </div>}
        <div className="flex flex-row my-2 md:my-0">
            <Question question={question} />
            <div className="flex flex-col space-y-5 w-[50%] ml-auto mr-2">
                <div className="flex flex-col">
                    <div className="flex flex-row bg-[#1e1e1e] w-fit items-center">
                        <MenuBar currLanguage={currLanguage} setCurrLanguage={setCurrLanguage} setCurrLanguageVersion={setCurrLanguageVersion} />
                        <Button sx={{ height: '26px', fontSize: '12px', color: 'white' }} onClick={RunCode}>Run</Button>
                    </div>
                    <Editor
                        height="300px"
                        width="100%"
                        theme="vs-dark"
                        defaultLanguage="python"
                        language={currLanguage}
                        defaultValue="// some comment"
                        options={{
                            minimap: { enabled: false }, // Disable minimap
                            lineNumbers: "off", // Hide line numbers
                            glyphMargin: true, // Remove glyph margin
                            folding: false, // Remove folding controls
                            lineDecorationsWidth: 0, // Reduce extra spacing
                            lineNumbersMinChars: 0, // Minimize leftover space
                            scrollbar: {
                                vertical: "hidden",
                                horizontal: "hidden",
                            },
                            fontSize: 12,
                            lineHeight: 18,
                        }}
                        value={value}
                        onChange={(value) => setValue(String(value))}
                    />
                </div>
                <Output expectedCases={expectedOutputs} codeResponse={codeResponse} testCases={testCases} numTestCases={question.testCases.length}></Output>
            </div>
        </div>
    </div>
}

/**
 * Component for generating the question for user's
 */
interface QuestionProps {
    question: QuestionInterface,

}

function Question({ question }: QuestionProps) {
    return <div className="w-[40%] md:w-[46%] ml-3 text-white bg-[#1e1e1e] pl-2 py-1 rounded-sm">
        <div className="flex flex-row items-center mb-2 font-headerFont">
            <h3 className="text-lg">{question.title}</h3>
            <Difficulty difficulty={question.difficulty} />
        </div>
        <div className="">
            {(question && question.content.length > 0) && <div className="flex flex-col space-y-2">
                <p className="text-xs md:text-sm whitespace-pre-wrap font-customFont">{question.content}</p>
            </div>}
        </div>
    </div>
}

interface DifficultyProps {
    difficulty: string,
}

function Difficulty({ difficulty }: DifficultyProps) {
    const textColor = difficulty === "Easy"
        ? "text-green-500"
        : difficulty === "Medium"
            ? "text-yellow-500"
            : "text-red-500";

    return (
        <div className={`ml-auto mr-8 text-sm px-3 py-0.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] shadow-sm transition-all duration-200 hover:bg-[#222222] hover:border-[#393939] ${textColor}`}>
            {difficulty}
        </div>
    );
}




interface OutputProps {
    expectedCases: string[];
    codeResponse: string[];
    testCases: testCase[];
    numTestCases: number;
}
/**
 * Returns the output box for the user's code output
 * @param codeResponse string containing the output of the user's code
 * @returns 
 */
function Output({ expectedCases, codeResponse, testCases, numTestCases }: OutputProps) {
    const [selectedCase, setSelectedCase] = useState<number | null>(1)
    //needs to be changed to match number of testCases
    const tests = Array.from({ length: numTestCases != 0 ? numTestCases : 3 }, (_, i) => i + 1);

    return (
        <div className="bg-[#1e1e1e]">
            <div className="flex flex-row space-x-4 border-[#666565] border-b-[1.5px]">
                {tests.map((index) => {
                    return <div key={index} className="font-headerFont">
                        {(testCases && testCases[index - 1]) ?
                            <h3 className={testCases[index - 1].passed == true ? `text-green-400 ml-1 cursor-pointer` : `text-red-600 ml-1 cursor-pointer`} onClick={() => setSelectedCase(index)}>Test Case {index}</h3>
                            : <h3 className="text-white ml-1 cursor-pointer" onClick={() => setSelectedCase(index)}>Test Case {index}</h3>}
                    </div>
                })}
            </div>
            <div className="bg-[#1e1e1e] w-full h-[100px] font-basicFont">
                {(selectedCase != null && expectedCases) && <div>
                    {testCases[selectedCase - 1] ? <div>
                        <p className="pl-1 py-1 text-xs  text-white">Case {selectedCase} result: {testCases[selectedCase - 1].passed === true ? 'Passed' : 'Failed'}</p>
                        <p className="pl-1 py-1 text-xs  text-white">Case {selectedCase} Expected Output: {testCases[selectedCase - 1].expectedOutput}</p>
                        {codeResponse[selectedCase - 1] && <p className="pl-1 py-1 text-xs  text-white">Your output: {codeResponse[selectedCase - 1].slice(0, 100)}</p>}
                    </div> : <div>
                        <p className="pl-1 py-1 text-xs  text-white">Expected Output: {expectedCases[selectedCase - 1]}</p>
                    </div>
                    }
                </div>}
            </div>
        </div>
    )
}