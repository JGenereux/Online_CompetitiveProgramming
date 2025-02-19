const router = require('express').Router()
const { default: axios } = require('axios')
const User = require('../Models/users')
const fs = require('fs').promises;

router.route('/').get(async (req, res) => {
    return res.json('User API is running')
})

//returns the user's email based off their access token to retrieve their acc from db
const getOAuthInfo = async (access_token) => {
    try {
        const res = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: 'application/json'
            }
        })
        return res.data;
    } catch (error) {
        console.log(error)
    }
}

router.route('/login').post(async (req,res) => {
    //Get user's email
    const {accessToken} = req.body;
    if(!accessToken) {
        return res.status(404).json('Access token not provided');
    }

    //use accessToken from oauth to retrieve user's email
    const {email} = await getOAuthInfo(accessToken);

    try{
        const user = await User.findOne({userEmail: email})
        //if user doesn't exist let client know user doesn't have an account
        if(user === null) {
            return res.status(417).json("User doesn't exist. Signup or try again.")
        }
        //if user does exist return their info
        return res.status(200).json(user)
    } catch(error) {
        console.log('Error logging user info: ', error)
    }
})

router.route('/createAccount').post(async(req,res) => {
    const {accessToken, userName} = req.body;
    
    console.log(userName)
    if(!accessToken) {
        return res.status(404).json('Access token not provided');
    }

    //use accessToken from oauth to retrieve user's email
    const {email} = await getOAuthInfo(accessToken);
   
    //create user's account with given email, username, and default entries 
    const newUserDefault = {
        userEmail: email,
        userName: userName,
        questionsSolved: [],
        experience: 0.0,
        level: 0,
    }

    try{
        //check if user already exists so there isn't duplicates in DB
        const user = await User.findOne({userEmail: email})
        //if user doesn't exist let client know user already has an account
        if(user != null) {
            return res.status(417).json("User account already exists.")
        }    

        const newUser = new User(newUserDefault)
        await newUser.save()

        return res.status(200).json(newUser)
    } catch(error) {
        console.log(error)
    }
})

router.route('/retrieveUser').get(async (req,res) => {
    const {email} = req.query;

    try{
        const user = await User.findOne({userEmail: email})

        if(user === null) {
            return res.status(417).json("User doesn't exist")
        }

        return res.status(200).json(user)
        //if user doesn't exist add to DB 
    }catch(error) {
        console.log('Error retrieving user from db: ', error)
    }
})

router.route('/questions').post(async (req, res) => {
    const { questionsSolved } = req.body;

    try {
        const questions = await Promise.all(
            questionsSolved.map(async (question) => {
                const questionFileName = question.toLowerCase().split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                try {
                    const data = await fs.readFile(`./Questions/${questionFileName}.txt`, 'utf8');
                    const { difficulty, topicTags } = JSON.parse(data); 

                    return {
                        name: questionFileName,
                        difficulty,
                        topicTags,
                    };
                } catch (err) {
                    console.error(`Error reading file for ${questionFileName}:`, err);
                    return null; // Skip errored files
                }
            })
        );

        // Filter out any failed reads (null values)
        return res.status(200).json({ questionsData: questions.filter(q => q !== null) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.route('/updateUser').post(async (req, res) => {
    const {email, questionSolved} = req.body;

    try{
        const user = await User.findOneAndUpdate({userEmail: email}, 
            { $push: {questionsSolved: questionSolved} },
            {new: true}
        )

        if(user === null) {
            return res.status(417).json("User doesnt' exist")
        }

        return res.status(202).json("Successfully updated user")
    }catch(error) {
        console.log('Error updating user: ', error)
    }
})

router.route('/delete/:email').delete(async (req, res) => {
    const userEmail = req.params.email

    try{
        const user = await User.findOneAndDelete({userEmail: userEmail})

        if(!user) {
            return res.status(417).json("user doesn't exist")
        }

        return res.status(200).json("User successfully removed")
    } catch(error) {
        console.log(error)
    }
})

module.exports = router;