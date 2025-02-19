class Language {
    
    GetTest(funcCall, testCase, origCase, datatype, inPlace) {}
    
    BuildTestCall(functionCall, testCase, inPlace) {}

    IsOutputValid(codeOutput, expectedResult, inPlace) {
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