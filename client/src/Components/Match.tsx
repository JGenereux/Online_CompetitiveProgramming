import axios from "axios";
import { useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react"
import { Button } from "@mui/material";
import MenuBar from "./MenuBar";
import { socket } from "../socket";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "./Contexts/userContext";

interface QuestionInterface {
    content: string,
    difficulty: string,
    hints: string[],
    title: string,
    topicTags: string[],
    testCases: string[]
}

interface testCase {
    expectedOutput: string,
    userOutput: string,
    passed: boolean
}

interface MatchProps {
    question: QuestionInterface,
    setQuestion: (question: QuestionInterface) => void,
    value: string,
    setValue: (value: string) => void;
}
export default function Match({ question, setQuestion, value, setValue }: MatchProps) {
    const { currUser, updateUserExp } = useUser()

    const [questionPassed, setQuestionPassed] = useState<boolean>(false);
    const [currLanguage, setCurrLanguage] = useState<string>('javascript')
    const [currLanguageVersion, setCurrLanguageVersion] = useState<string>("18.15.0")
    const [codeResponse, setCodeResponse] = useState<string[]>([])
    const [testCases, setTestCases] = useState<testCase[]>([])

    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        const { id } = params;

        socket.on('playerDisconnected', ({ disconnected }) => {
            if (disconnected) {
                window.alert('One of the users left. The game is now ending!')
                navigate('/', { replace: true })
            }
        })

        socket.on('matchExpired', ({ disconnected, message }) => {
            if (disconnected) {
                window.alert(message)
                navigate('/', { replace: true })
            }
        })

        socket.on('gameResult', ({ result, message }) => {
            if (result) {
                window.alert(message)
                navigate(`/result/${id}`, { replace: true })
            }
        })

        return () => {
            socket.off('playerDisconnected')
            socket.off('matchExpired')
            socket.off('gameResult')
        }
    }, [])

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
                console.log('logged u out')
                return
            }
            console.log(currUser)
            const res = await axios.get(`http://localhost:5000/question/runTest?userCode=${encodeURIComponent(value)}&currLanguage=${currLanguage}&languageVersion=${currLanguageVersion}&lobbyID=${id}&userName=${currUser?.userName}&questionDifficulty=${question.difficulty}`)

            const { testResults, updatedExp, passed } = res.data;

            const caseResults = testResults;
            const responses: string[] = [];

            caseResults.map((result: testCase) => {
                responses.push(result.userOutput);
            })

            if (passed) {
                updateUserExp(updatedExp)
            }

            setTestCases(testResults);
            setQuestionPassed(passed);
            setCodeResponse(responses);
        } catch (error) {
            console.log(error)
        }
    }

    return <div className="flex flex-row my-5">
        <Question question={question} />
        <div className="flex flex-col space-y-5 w-[55%]">
            <MenuBar currLanguage={currLanguage} setCurrLanguage={setCurrLanguage} setCurrLanguageVersion={setCurrLanguageVersion} />
            <Editor height="300px" width="100%" theme="vs-dark" defaultLanguage="javascript" defaultValue="// some comment" value={value} onChange={(value) => setValue(String(value))} />
            <Button sx={{ marginRight: 'auto', height: '10px', fontSize: '12px' }} onClick={RunCode}>Run</Button>
            <Output codeResponse={codeResponse} testCases={testCases} numTestCases={question.testCases.length}></Output>
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
    return <div className="w-2/5 ml-4 my-20">
        {(question && question.content.length > 0) && <div className="text-white">
            <p className="text-[12px] whitespace-pre-wrap">{question.content}</p>
        </div>}
    </div>
}

interface OutputProps {
    codeResponse: string[],
    testCases: testCase[],
    numTestCases: number,
}
/**
 * Returns a div containing the output box for the user's code output
 * @param codeResponse string containing the output of the user's code
 * @returns 
 */
function Output({ codeResponse, testCases, numTestCases }: OutputProps) {
    const [selectedCase, setSelectedCase] = useState<number | null>(1)

    //needs to be changed to match number of testCases
    const tests = Array.from({ length: numTestCases != 0 ? numTestCases : 3 }, (_, i) => i + 1);

    return (
        <div>
            <div className="flex flex-row space-x-4">
                {tests.map((index) => {
                    return <div key={index}>
                        {(testCases && testCases[index - 1]) ?
                            <h3 className={testCases[index - 1].passed == true ? `text-green-400 ml-1 text-sm` : `text-red-600 ml-1 text-sm`} onClick={() => setSelectedCase(index)}>Test Case {index}</h3>
                            : <h3 className="text-white ml-1 text-sm" onClick={() => setSelectedCase(index)}>Test Case {index}</h3>}
                    </div>
                })}
            </div>
            <div className="bg-[#1e1e1e] w-full h-[100px]">
                {selectedCase != null && <div>
                    {testCases[selectedCase - 1] ? <div>
                        <p className="pl-1 py-1 text-xs text-white">Case {selectedCase} result: {testCases[selectedCase - 1].passed === true ? 'Passed' : 'Failed'}</p>
                        <p className="pl-1 py-1 text-xs text-white">Case {selectedCase} Expected Output: {testCases[selectedCase - 1].expectedOutput}</p>
                        <p className="pl-1 py-1 text-xs text-white">Your output: {codeResponse[selectedCase - 1]}</p>
                    </div> : <div></div>
                    }
                </div>}

            </div>
        </div>
    )
}