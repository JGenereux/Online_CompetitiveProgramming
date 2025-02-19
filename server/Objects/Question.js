const { default: axios } = require("axios");
const {ReplaceParams} = require("./LanguageTestCases/c++");
const RunTest = require("./LanguageTestCases/RunTests");

    async function RunTests(question, functionCall, userCode, currLanguage, languageVersion, inPlace) {
        const newLang = new RunTest(`${currLanguage}`)

        const caseCalls = []
        const testCases = question.testCases;
        
        //create function calls for the question using each test case
        testCases.map((currCase) => {
            caseCalls.push(newLang.language.BuildTestCall(functionCall, currCase, inPlace));
        })
        
        let cases = [];

        const RunCases = caseCalls.map((call, index) =>
            new Promise((resolve) => {
                setTimeout(async () => {
                    let currentTest = newLang.language.GetTest(userCode, call.call, call.origCase, call.type, inPlace)
                    try {
                        const res = await axios.post("https://emkc.org/api/v2/piston/execute", {
                            language: currLanguage,
                            version: languageVersion,
                            files: [
                                {
                                    content: currentTest,
                                },
                            ],
                        });
                        const codeOutput = res.data["run"]["output"];
                        
                        const {passed, answerOutput} = newLang.language.IsOutputValid(codeOutput, call.expectedRes, inPlace)
                        
                        const currentCase = {
                            expectedOutput: call.expectedRes,
                            userOutput: answerOutput,
                            passed: passed
                        }
                        cases.push(currentCase)

                        resolve(); // Mark this promise as resolved
                    } catch (error) {
                        console.log(error);
                        resolve(); 
                    }
                }, index * 750);
            })
        );
        
        await Promise.all(RunCases);
        return cases;
    }

module.exports = RunTests;