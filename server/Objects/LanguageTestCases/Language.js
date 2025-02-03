class Language {
    /**
     * Testcases are given as funcName(param1, ... , param) 
     * so params need to be converted into variables specific to each language
     */
    GetTest() {
    }
    
    BuildTestCalls(functionCall, testCase, questionName) {}

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
}

module.exports = Language;