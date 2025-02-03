const Language = require("./Language");

class Python extends Language {
    ConvertArray(array) {

    }

    BuildTestCalls(functionCall, testCase, questionName) {
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
    
    GetTest(funcCall, testCase, datatype) {
        let finalOutput = `${funcCall}\nprint(${testCase})`
        return finalOutput;
    }
}

module.exports = Python;