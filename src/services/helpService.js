const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { create, findByPk  } = require('../dataAcessObject/appDao')
const Token = require('../models/Token')

const generateToken = async(email, names)=> {

    const tokenKey = jwt.sign({ email }, process.env.JWT_SECRET)

    try {
        const token = new Token({
            ...{
                owner: email,
                token: tokenKey,
                names
            }
        }).dataValues

        return await create( token, 'token')
    } catch (error) {
        throw new Error(error.message)
    }
}


const generateUUID = (length)=>{
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;

    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

const isExistUser = async(email)=>{
    try {
        if(!email){
            throw new Error("you must provide email")
        }

        let user = await findByPk(email, 'user')

        return user ? true: false
    } catch (error) {
        throw new Error(error.message)
    }
}

const findByCredentials = async(email, password)=>{
    if(!email, !password){
        throw new Error("you must provide email and passwod")
    }

    try {
        let user = await findByPk(email, 'user')

        if(!user){
            throw new Error('email not found')
        }
    
        const { dataValues ,_previousDataValues } = user

        user = _previousDataValues
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            throw new Error("wrong pasword")
        }
        
        return user
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    generateToken,
    generateUUID,
    isExistUser,
    findByCredentials,
} 