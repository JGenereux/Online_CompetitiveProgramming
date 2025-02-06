/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react"
import { Button } from "@mui/material";
import MenuBar from "./MenuBar";
import { socket } from "../socket";
import { redirect, useNavigate, useParams } from "react-router-dom";
import { useUser } from "./Contexts/userContext";
import { UseQuestion } from "./Contexts/questionContext";

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
    const [currLanguage, setCurrLanguage] = useState<string>('javascript')
    const [currLanguageVersion, setCurrLanguageVersion] = useState<string>("18.15.0")
    const [codeResponse, setCodeResponse] = useState<string[]>([])
    const [testCases, setTestCases] = useState<testCase[]>([])
    const [expectedOutputs, setExpectedOutputs] = useState<string[]>([]);

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
        const { id } = params;

        socket.on('playerDisconnected', ({ disconnected }) => {
            if (disconnected) {
                window.alert('One of the users left. The game is now ending!')
                navigate('/', { replace: true })
                resetQuestion();
            }
        })

        socket.on('matchExpired', ({ disconnected, message }) => {
            if (disconnected) {
                window.alert(message)
                navigate('/', { replace: true })
                resetQuestion();
            }
        })

        //navigates the user to the result page to show user's that played
        //and their scores
        socket.on('gameResult', ({ result, message }) => {
            if (result) {
                window.alert(message)
                navigate(`/result/${id}`, { replace: true })
                resetQuestion();
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
        }
    }, [])

    //When the user switches their language ensure they get the appropriate function call
    //switched
    useEffect(() => {
        const updateCalls = async () => {
            try {
                const res = await axios.post('http://localhost:5000/question/update', { currLanguage: currLanguage, question: question })
                setValue(res.data.functionCall)
            } catch (error) {
                console.log(error)
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
            const res = await axios.post(`http://localhost:5000/question/runTest`, runTestInfo)

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

    return <div className="flex flex-row my-5">
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
                    defaultLanguage="javascript"
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
}

/**
 * Component for generating the question for user's
 */
interface QuestionProps {
    question: QuestionInterface,

}

function Question({ question }: QuestionProps) {
    return <div className="w-[40%] md:w-[46%] ml-3 text-white bg-[#1e1e1e] pl-2 py-3 rounded-sm">
        <h3 className="text-lg mb-2 font-headerFont">{question.title}</h3>
        <div className="">
            {(question && question.content.length > 0) && <div className="flex flex-col space-y-2">
                <p className="text-xs md:text-sm whitespace-pre-wrap font-basicFont">{question.content}</p>
            </div>}
        </div>
    </div>
}

interface OutputProps {
    expectedCases: string[];
    codeResponse: string[];
    testCases: testCase[];
    numTestCases: number;
}
/**
 * Returns a div containing the output box for the user's code output
 * @param codeResponse string containing the output of the user's code
 * @returns 
 */
function Output({ expectedCases, codeResponse, testCases, numTestCases }: OutputProps) {
    const [selectedCase, setSelectedCase] = useState<number | null>(1)
    //needs to be changed to match number of testCases
    const tests = Array.from({ length: numTestCases != 0 ? numTestCases : 3 }, (_, i) => i + 1);

    return (
        <div>
            <div className="flex flex-row space-x-4">
                {tests.map((index) => {
                    return <div key={index} className="font-headerFont">
                        {(testCases && testCases[index - 1]) ?
                            <h3 className={testCases[index - 1].passed == true ? `text-green-400 ml-1 text-sm` : `text-red-600 ml-1 text-xs md:text-sm`} onClick={() => setSelectedCase(index)}>Test Case {index}</h3>
                            : <h3 className="text-white ml-1 text-xs md:text-sm" onClick={() => setSelectedCase(index)}>Test Case {index}</h3>}
                    </div>
                })}
            </div>
            <div className="bg-[#1e1e1e] w-full h-[100px] font-basicFont">
                {(selectedCase != null && expectedCases) && <div>
                    {testCases[selectedCase - 1] ? <div>
                        <p className="pl-1 py-1 text-xs md:text-sm text-white">Case {selectedCase} result: {testCases[selectedCase - 1].passed === true ? 'Passed' : 'Failed'}</p>
                        <p className="pl-1 py-1 text-xs md:text-sm text-white">Case {selectedCase} Expected Output: {testCases[selectedCase - 1].expectedOutput}</p>
                        <p className="pl-1 py-1 text-xs md:text-sm text-white">Your output: {codeResponse[selectedCase - 1]}</p>
                    </div> : <div>
                        <p className="pl-1 py-1 text-xs md:text-sm text-white">Expected Output: {expectedCases[selectedCase - 1]}</p>
                    </div>
                    }
                </div>}
            </div>
        </div>
    )
}