const Language = require("./Language");


letters = ['a','b','c', 'd', 'e', 'f']

function  ConvertArray(array, name) {
    const arrayInitializer = `let ${name} = ` + `${array};`
    return arrayInitializer + '\n';
}

function ConvertPrimitiveType(value, name) {
    const valueInit = `let ${name} = ` + `${value};`
    return valueInit + '\n';
}

function ExpectedVariable(funcCall) {
    return `let res = ${funcCall};\n`
}

function OutputArray(arr) {
    const s = `console.log(${arr})`;
    return s;
}

function ConvertArray(array) {
    return `const A = ${array}\n`
}


class Javascript extends Language {
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
        let finalOutput = `${funcCall}\nconsole.log(${testCase})`
        return finalOutput;
    }
}

module.exports = Javascript;