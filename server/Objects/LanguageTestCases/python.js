const Language = require("./Language");

class Python extends Language {
    ConvertArray(array) {

    }

    isPrimitive(value) {
        if(String(value).includes('[') || String(value).includes(']')) {
            return false
        }

        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
            return true; 
        } 

        return false
    }

    isArray(value) {
        if(String(value).includes('[') && String(value).includes(']')) {
            return true
        }
        return false
    }

    initializeValue(key, value) {
        let varInitialization = `${key} = ${value}`
        return varInitialization
    }
    
    CreateParams(testCase, functionCall) {
        let funcName = ""
        let whiteSpaceFound = false
        
        for(let i = 0; i < functionCall.length; i++) {
            if(functionCall[i] == "(") break
            if(functionCall[i] == " ") {
                whiteSpaceFound = true
                continue
            }

            if(whiteSpaceFound) {
                funcName += functionCall[i]
            }
        }
        funcName += '('

        //for each param create variable
        // return a string that defines all variables
        let variables = ""
        for(let key in testCase) {
            if(key == "expectedResult") continue
            let value = testCase[`${key}`]
            funcName += `${key},`
            if(this.isPrimitive(value) || this.isArray(value)) {
                const currVar = this.initializeValue(key, value)
                variables += `${currVar}\n`
            } 
        }

        funcName = funcName.slice(0, -1)

        funcName += ')'
        return {variables, funcName}
    }

    IsOutputValid(codeOutput, expectedResult, inPlace) {
      
        if (inPlace) {   
            let currResult = "";
            let i = 0;
            
            while (i < codeOutput.length) {
                if (codeOutput[i] == "[") {
                    currResult += codeOutput[i];
                    i++; // Move past "["
    
                    while (i < codeOutput.length && codeOutput[i] != "]") {
                        if (codeOutput[i] != " ") {
                            currResult += codeOutput[i];
                        }
                        i++; 
                    }
    
                    if (i < codeOutput.length && codeOutput[i] == "]") {
                        currResult += codeOutput[i];
                        i++; // Move past "]"
                    }

                    if (String(currResult) === String(expectedResult)) {
                        return {passed: true, answerOutput: currResult};
                    }
    
                    currResult = "";
                    continue;
                }
    
                if (codeOutput[i] == " ") {
                    if (String(currResult) === String(expectedResult)) {
                        return {passed: true, answerOutput: currResult}
                    }
                    currResult = "";
                    i++;
                    continue;
                }
    
                currResult += codeOutput[i];
                i++;
            }
        } 

        //if the output is expected be returned
        const valuesEqual = this.compareOutput(codeOutput, expectedResult)
        return {passed: valuesEqual, answerOutput: codeOutput};
    }

    compareOutput(codeOutput, expectedResult) {
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

    BuildTestCall(functionCall, testCase, inPlace) {
        const currFuncCall = functionCall;
        const n = currFuncCall.length;

        let finalCall = "";
        
        let i = 0;
        let type = ''
        while(currFuncCall[i] != ' ') {
            type += currFuncCall[i]
            i++;
        }

        const {variables, funcName} = this.CreateParams(testCase, functionCall)
        finalCall += `${variables}finalRes = ${funcName}`
        return {call: finalCall, origCase: testCase, expectedRes: testCase['expectedResult'], type: type};  
    }
    
    GetTest(funcCall, testCase, origCase, datatype, inPlace) {
        // if operations are done in place check params
        let finalOutput =`${funcCall}\n`
        finalOutput += `\n${testCase}\n`
        
        //If in place check every variable for the answer
        if(inPlace) {
            const printStatements = this.createVarPrintStatements(origCase)
            finalOutput += printStatements
        } else {
            finalOutput += "print(finalRes)"
        }

        return finalOutput
    }

    createVarPrintStatements(origCase) {
        let printStatements = ""
        for(let key in origCase) {
            if(key === "expectedResult") continue
            printStatements += `print(${key})\n`
        }

        return printStatements
    }
}

module.exports = Python;