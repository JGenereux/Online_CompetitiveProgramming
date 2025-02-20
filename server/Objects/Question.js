const { default: axios } = require("axios");
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
                        
                        let {passed, answerOutput} = newLang.language.IsOutputValid(codeOutput, call.expectedRes, inPlace)
                        if(!passed){
                            answerOutput = formatError(functionCall, codeOutput)
                            if(!answerOutput || answerOutput.length == 0) {
                                answerOutput = "Tests failed"
                            }
                        }

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

    function formatError(functionCall, errorOutput) {
        const positions = [...errorOutput.matchAll(/line/g)].map(m => m.index);
       
        if(!positions || positions.length == 0) return ""
        
        let errors = ""
        const len = errorOutput.length
        let position = positions[0]
        let i = 0
        while(i < positions.length) {
            //finalRes variable declared on backend will have issue if function has issues 
            if(errorOutput.slice(position, position + 22).includes('in <module>')) {
                position = positions[++i]
                continue
            }
            
            // brings position to be at the start of the error
            while(position < errorOutput.length && errorOutput[position] != '\n') {
                position++
            }

            let error = ""
            while(position < errorOutput.length && (!errorOutput.slice(position, position + 16).includes('Error') || 
                !errorOutput.slice(position, position + 3).includes('File'))){
                error += errorOutput[position]
                position++
            }

            errors += `${error}\n`
            position = positions[i++]
        }

        return errors
    }

module.exports = RunTests;