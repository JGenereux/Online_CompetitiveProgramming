const router = require('express').Router();
const questionFuncs = require('./questionFuncs')

router.route('/').get(async(req, res) => {

    console.log("Lobby route running successfully")
    return res.json("Lobby route running successfully")
})

//Need to pass in the userCode and question name.
//question name will retrieve the expected function from a json file
//testcases will be retrieved for the question name and put into the expected function and ran
//route should return the outputs and successess. {outputs: [output, success]}

const createTestcaseFunctions = (questionName, testCase) => {
    
}

router.route('/run').post(async(req, res) => {
    const {userCode, questionName, testCases} = req.body;

    for(let i = 0; i < testCases.length; i++) {
        console.log(testCases[i]);
        //create expected function with current testcase
        //add the console.log of the expected function
        //run the code with the pistonapi
        //check if response is equal to the 
    }
    return res.json('ran')
})

module.exports = router;