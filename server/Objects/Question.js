const { default: axios } = require("axios");
const {ReplaceParams} = require("./LanguageTestCases/c++");
const RunTest = require("./LanguageTestCases/RunTests");

    function BuildTestCalls(functionCall, testCase, questionName) {
      
        const currFuncCall = functionCall;
        const n = currFuncCall.length;

        let finalCall = "";
        //remove 'keywords' or return types from part of functionCall to make it a 'callable' function
        let i = 0;
        let type = ''
        while(currFuncCall[i] != ' ') {
            type += currFuncCall[i]
            i++;
        }

        i++;
        while(i < n) {
            //start getting params
            if(currFuncCall[i] == '('){
               finalCall += '(';
               let param = ""
               i++;
               while(i < n && currFuncCall[i] != ')') {
                if(currFuncCall[i] == ',') {
                    finalCall += testCase[`${param}`]
                    finalCall += ','
                    param = ""
                } else if(currFuncCall[i] == ' ') {
                    param = ""
                } else {
                    param += currFuncCall[i]
                }
                i++;
               }
               if(param.length > 0) {
                finalCall += testCase[`${param}`]
               }
               finalCall += ')'
               break;
            }
            finalCall += currFuncCall[i];
            i++;
        }
        return {call: finalCall, expectedRes: testCase['expectedResult'], type: type};  
    }

    function IsOutputValid(codeOutput, expectedResult) {
        let passed = true;
        
        const numericCodeResponse = codeOutput.replace(/\D/g, '');  // Remove non-numeric characters
        const numericExpectedOutput = expectedResult.replace(/\D/g, '');  // Remove non-numeric characters

        // If numeric values don't match in length, it's a failure
        if (numericCodeResponse.length !== numericExpectedOutput.length) {
            passed = false;
        } else {
            // Compare the numeric characters one by one
            for (let j = 0; j < numericExpectedOutput.length; j++) {
                if (numericCodeResponse[j] !== numericExpectedOutput[j]) {                        
                    passed = false;
                    break;
                }
            }
        }
        return passed;
        }
    
    async function RunTests(question, functionCall, userCode, currLanguage, languageVersion) {
        const newLang = new RunTest(`${currLanguage}`)

        const caseCalls = []
        const testCases = question.testCases;

        //create function calls for the question using each test case
        testCases.map((currCase) => {
            caseCalls.push(newLang.language.BuildTestCalls(functionCall, currCase));
        })

        let cases = [];

        const RunCases = caseCalls.map((call, index) =>
            new Promise((resolve) => {
                setTimeout(async () => {
                    let currentTest = newLang.language.GetTest(userCode, call.call, call.type)
                    console.log(currentTest)
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
                       
                        if (newLang.language.IsOutputValid(codeOutput, call.expectedRes)) {
                            const currentCase = {
                                expectedOutput: call.expectedRes,
                                userOutput: codeOutput,
                                passed: true
                            }
                            cases.push(currentCase)
                        } else {
                            const currentCase = {
                                expectedOutput: call.expectedRes,
                                userOutput: codeOutput,
                                passed: false
                            }
                            cases.push(currentCase)
                        }
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