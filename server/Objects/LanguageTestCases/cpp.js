const Language = require("./Language");


letters = ['a','b','c', 'd', 'e', 'f']

function  ConvertArray(array, name) {
    const arrayInitializer = `vector<int> ${name} = ` + `{${array.slice(1, -1)}};`
    return arrayInitializer + '\n';
}

function ConvertPrimitiveType(value, name) {
    const valueInit = `int ${name} = ` + `${value};`
    return valueInit + '\n';
}

function ExpectedVariable(datatype, funcCall) {
    return `${datatype} res = ${funcCall};\n`
}

function OutputArray(arr) {
    const s = `string output = "[";\n for(auto& ele : res){\n output += to_string(ele) + ','; \n}\n output.pop_back();\n output += "]";\ncout << output << endl;\n`;
    return s;
}

class Cpp extends Language {
    ConvertArray(array) {
        return `vector<int> A = {${input.slice(1, -1)}}`
    }

    BuildTestCall(functionCall, testCase, inPlace) {
      
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
    
    GetTest(funcCall, testCase, origCase, datatype, inPlace) {
        let newFuncCall = "";
        let j = 0; //counter to denote what param we are currently on 
        
        let output = ""
        let finalOutput = ""
        finalOutput += `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n${funcCall};\n`
        let i = 0;
        const n = testCase.length;
        while(i < n) {
            if(testCase[i] == '(') {
                i++;
                let param = ""
                newFuncCall += '(';
                while(i < n && testCase[i] != ')') {
                    //handle array
                    if(testCase[i] == '[') {
                        param += '[';
                        i++;
                        while(i < n && testCase[i] != ']') {
                            param += testCase[i];
                            i++;
                        }
                        param += ']';
                        const currentLetter = letters[j++];
                        output += ConvertArray(param, currentLetter);
                        newFuncCall += currentLetter + ','
                        param = "";
                        i++;
                        continue;
                    }
    
                    if(testCase[i] == ',') {
                        if(param.length > 0) {
                            const currentLetter = letters[j++];
                            output += ConvertPrimitiveType(param, currentLetter);
                            newFuncCall += currentLetter + ','
                        }
                        param = "";
                        i++;
                        continue;
                    }
                 
                    param += testCase[i];
                    i++;
                }
                const currentLetter = letters[j++];
                if(param.length > 0) {
                output += ConvertPrimitiveType(param, currentLetter);
                newFuncCall += currentLetter + ',';
                }
            }
            if(testCase[i] != ')') {
                newFuncCall += testCase[i]
            }
            i++;
        }
        const finalFuncCall = newFuncCall.slice(0,-1) + ')';
        output += ExpectedVariable(datatype, finalFuncCall);
        if(datatype == "int") {
            output += "cout << res << endl;\n";
        } else if(datatype == "vector<int>") {
            output += OutputArray(ExpectedVariable(datatype, newFuncCall));
        }
        finalOutput += `\nint main() {\n${output}\n return 0;\n}`
        return finalOutput;
    }
}


module.exports = Cpp