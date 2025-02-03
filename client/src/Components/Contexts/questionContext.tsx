import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { socket } from "../../socket";

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

interface QuestionContextType {
    question: QuestionInterface;
    setQuestion: (question: QuestionInterface) => void;
    value: string;
    setValue: (value: string) => void;
    resetQuestion: () => void;
}

const defaultQuestion: QuestionInterface = {
    content: '',
    difficulty: '',
    hints: [],
    title: '',
    topicTags: [],
    testCases: [],
}

export const QuestionContext = createContext<QuestionContextType>({
    question: defaultQuestion,
    setQuestion: () => {
        throw new Error("setQuestion func must be used within QuestionProvider")
    },
    value: "",
    setValue: () => {
        throw new Error("setValue func must be used within QuestionProvider")
    },
    resetQuestion: () => {
        throw new Error("resetQuestion func must be used within QuestionProvider")
    }
})

interface QuestionProviderProps {
    children: ReactNode;
}

export const QuestionProvider = ({ children }: QuestionProviderProps) => {
    const [question, setQuestion] = useState<QuestionInterface>(() => {
        const lcQuestion = sessionStorage.getItem('cachedQuestion');
        return lcQuestion ? JSON.parse(lcQuestion) : defaultQuestion;
    });
    const [value, setValue] = useState(() => {
        const funcCall = sessionStorage.getItem('cachedFunction');
        return funcCall ? funcCall : '';
    });

    const resetQuestion = () => {
        sessionStorage.removeItem('cachedQuestion');
        sessionStorage.removeItem('cachedFunction');
        setQuestion(defaultQuestion);
        setValue("");
    }

    useEffect(() => {
        const loadCachedData = () => {
            try {
                const lcQuestion = sessionStorage.getItem('cachedQuestion');
                const funcCall = sessionStorage.getItem('cachedFunction');

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
    }, [value, question.content]);

    useEffect(() => {
        const handleOccuringMatch = ({ lcQuestion, functionCall }: { lcQuestion: string, functionCall: string }) => {
            try {
                const parsedQuestion = JSON.parse(lcQuestion);
                setQuestion(parsedQuestion);
                setValue(functionCall);

                sessionStorage.setItem("cachedQuestion", lcQuestion);
                sessionStorage.setItem("cachedFunction", functionCall);
            } catch (error) {
                console.error('Error handling match:', error);
            }
        };

        socket.on('occuringMatch', handleOccuringMatch);

        return () => {
            socket.off('occuringMatch');
        };

    }, []);

    return (
        <QuestionContext.Provider value={{ question, setQuestion, resetQuestion, value, setValue }}>
            {children}
        </QuestionContext.Provider>
    )
}

export const UseQuestion = () => useContext(QuestionContext)



