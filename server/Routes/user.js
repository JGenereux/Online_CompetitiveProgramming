require('dotenv').config()
const router = require('express').Router()
const { default: axios } = require('axios')
const User = require('../Models/users');
const Token = require('../Models/refreshtokens');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken')


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
        
        const accessToken = generateAccessToken({email: email})
        const refreshToken = jwt.sign({email: email}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '24hr'})
        //add refreshToken to db
        //check if user has refreshTokens array
        const hasToken = await Token.findOne({email: email})
        //add user to schema
        if(!hasToken) {
            const userToken = new Token({
                email: email,
                refreshTokens: [refreshToken]
            })
            await userToken.save()
        } else {
            hasToken.refreshTokens = [...hasToken.refreshTokens, refreshToken]
            await hasToken.save()
        }

        //if user does exist return their info
        return res.status(200).json({user: user, accessToken: accessToken, refreshToken: refreshToken})
    } catch(error) {
        console.log('Error logging user info: ', error)
    }
})

router.route('/logout/:email').delete(authenticateToken, async (req,res) => {
    const email = req.params.email
    const refreshToken = req.headers['x-refresh-token']

    try{
        const hasToken = await Token.findOne({email: email})

        if(!hasToken) {
            return res.status(403).json('User doesnt have a refresh token')
        }

        hasToken.refreshTokens = hasToken.refreshTokens.filter((token) => token != refreshToken)
        await hasToken.save()

        res.status(200).json('Successfully logged out user')
    } catch(error){
        res.status(400).json(error)
    }
})

router.route('/createAccount').post(async(req,res) => {
    const {accessToken, userName} = req.body;
    
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
        const userByEmail = await User.findOne({ userEmail: email });
        const userByUsername = await User.findOne({ userName: userName });
        //if user doesn't exist let client know user already has an account
        if (userByEmail) {
            return res.status(203).json("User with this email already exists.");
        }
        
        if (userByUsername) {
            return res.status(203).json("Username is already taken.");
        }   

        const newUser = new User(newUserDefault)
        await newUser.save()

        const jwtAccessToken = generateAccessToken({email: email})
        const refreshToken = jwt.sign({email: email}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1hr'})
        
        //check if user has refreshTokens array
        const hasToken = await Token.findOne({email: email})
        //add user to schema
        if(!hasToken) {
            const userToken = new Token({
                email: email,
                refreshTokens: [refreshToken]
            })
            await userToken.save()
        } else {
            hasToken.refreshTokens = [...hasToken.refreshTokens, refreshToken]
            await hasToken.save()
        }

        return res.status(200).json({user: newUser, accessToken: jwtAccessToken, refreshToken: refreshToken})
    } catch(error) {
        console.log(error)
    }
})

router.route('/retrieveUser').get(authenticateToken, async (req,res) => {
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

router.route('/questions').post(authenticateToken, async (req, res) => {
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

router.route('/delete/:email').delete(authenticateToken, async (req, res) => {
    const userEmail = req.params.email
    
    try{
        const user = await User.findOneAndDelete({userEmail: userEmail})

        if(!user) {
            return res.status(417).json("user doesn't exist")
        }

        await Token.findOneAndDelete({email: userEmail})

        return res.status(200).json("User & tokens successfully removed")
    } catch(error) {
        console.log(error)
    }
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1hr'}) 
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(token == null) return res.status(401).json("Authentication required")

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403) //token invalid
        req.user = user // gives middleware and route access to user
        next() //pass control to next middleware or route
    })
}

router.route('/token').post(async(req, res) => {
    const {refreshToken, email} = req.body
    
    if(refreshToken == null) return res.status(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403)
        const accessToken = generateAccessToken({email: email})
        res.status(200).json({accessToken: accessToken})
    })
})

module.exports = router;