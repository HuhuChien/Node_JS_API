const jwt = require('jsonwebtoken');

const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User');

//Protext routes
exports.protect = async(req,res,next) => {
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            console.log(req.headers.authorization)
            //token0 = req.headers.authorization.split(' ')
            token = req.headers.authorization.split(' ')[1]
            console.log(token)
        } 
        /*
        else if(req.cookies.token){
            token = req.cookies.token
        }
        */
       //Make sure token exists
        if(!token){
            return next(new ErrorResponse('Not authorized to access this routewww',401))
        }

        try{
            //verify token
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            console.log(decoded);
            req.userrr = await User.findById(decoded.id)
            console.log(req.userrr)
            next()
        }catch(err){
            return next(new ErrorResponse('Not authorized to access this routettt',401))
        }

    }catch(error){
        return next(new ErrorResponse('Not authorized to access this routeggg',401))
    }
}

//Grant access to specific roles
exports.authorize = (...roles) => {
    console.log(roles)
    return (req,res,next) => {
        if(!roles.includes(req.userrr.role)){
            return next(new ErrorResponse(`User role ${req.userrr.role} is not authorized to access this route`,403))
        }
        next()
    }
}