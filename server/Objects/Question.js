const { default: axios } = require("axios");

class Question {
    #question;
    #functionCall;

    constructor() {
        this.#question = null;
        this.#functionCall = null;
    }

    SetQuestion(question) {
        this.#question = question;
    }

    SetFunctionCall(functionCall) {
        this.#functionCall = functionCall;
    }

    Print() {
        console.log(this.#question, this.#functionCall)
    }

    BuildTestCalls(testCase) {
      
        const currFuncCall = this.#functionCall;
        const n = currFuncCall.length;

        let finalCall = "";
        //don't include function keyword in final string so start after function
        let i = 9; 
        let j = 0;
        while(i < n) {
            //start getting params
            if(currFuncCall[i] == '('){
                finalCall += '('
                i += 1; //skip past (
                let param = "";
                while(i < n && currFuncCall[i] != ')') {
                    //if , reached then param will hold the current parameter's name
                    //use the param then to retrieve the testcase param from testcase
                    if(currFuncCall[i] == ',') {
                        //finalCall += testCases[j++][`${param}`]
                        finalCall += testCase[`${param}`]
                        finalCall += ','
                        param = "";
                        i++;
                        continue;
                    }

                    if(currFuncCall[i] != ' ') {
                        param += currFuncCall[i];
                    }
                    i++;
                }
                if(param.length > 0) {
                    finalCall += testCase[`${param}`];
                }
                //add ) to end
                finalCall += currFuncCall[i];
                break; //don't need to add {} we want to call this function
            }

            finalCall += currFuncCall[i];
            i++;
        }
        return {call: finalCall, expectedRes: testCase['expectedResult']};  
    }

    IsOutputValid(codeOutput, expectedResult) {
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
    
    //boolean method to run tests when given the user's output
    async RunTests(userCode, currLanguage, languageVersion) {
        const caseCalls = []
        const testCases = this.#question.testCases;

        //create function calls for the question using each test case
        testCases.map((currCase) => {
            caseCalls.push(this.BuildTestCalls(currCase));
        })

        let cases = [];

        const RunCases = caseCalls.map((call, index) =>
            new Promise((resolve) => {
                setTimeout(async () => {
                    let currentTest = userCode + "\n\n" + `console.log(${call.call})`;
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
                       
                        if (this.IsOutputValid(codeOutput, call.expectedRes)) {
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
}

module.exports = Question;