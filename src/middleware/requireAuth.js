const jwt = require('jsonwebtoken')
const { findByPk } = require('../dataAcessObject/appDao')

const requireAuth = (req, res, next)=>{

    const { authorization } = req.headers

    try {
        if(!authorization){
            throw new Error('authorization token is null')
        }

        const token = authorization.replace('Bearer ', "");

        jwt.verify(token, process.env.JWT_SECRET, async(error, payload)=>{

            try {
                if(error){
                    throw new Error("authorization token is invalid")
                }
   
                

                const tokenData = await findByPk(token, "token")

                if(!tokenData){
                    throw new Error("authorization token expired please signin again")
                }

                const { owner } = tokenData.dataValues
    
                const user = await findByPk(owner, 'user')
    
                if(!user){
                    throw new Error('wrong token')
                }
    
                const { _previousDataValues } = user
                req.user = _previousDataValues
                req.user.token = token                
                next()
            } catch (error) {
                res.status(401).json({ error: { statusCode: 401, status: "failed", message: error.message} })
            }
        })

    } catch (error) {
        res.status(401).json({ error: { statusCode: 401, status: "failed", message: error.message} })
    }
}

module.exports = { requireAuth }