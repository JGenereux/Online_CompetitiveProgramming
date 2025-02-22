const router = require('express').Router()
const User = require('../Models/users')
/**
 * Leadboard will display the following
 *  Person - PFP & username
 *  Level
 *  Number of questions solved
 */

router.route('/').get(async(req, res) => {
    try{
        const leaderboard = []
        
        const users = await User.find({})

        users.forEach(user => {
            const userStats = {
                userName: user.userName,
                level: user.level,
                questionsSolved: user.questionsSolved?.length || 0
            }
            leaderboard.push(userStats)
        })

        return res.status(200).json(leaderboard)
    } catch (error) {
        return res.status(500).json('Internal server error')
    }
})

module.exports = router