const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User');



// @desc Register user
// @route POST /api/v1/auth/register
// @access Public


exports.register = async(req,res,next) => {
    try{
        const {name,email,password,role} = req.body

        //Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        console.log(user);


        sendTokenResponse(user,200,res)
    }catch(error){
        console.log(error.message)
    }
}





// @desc Login user
// @route POST /api/v1/auth/login
// @access Public

exports.login = async(req,res,next) => {
    try{
        const {email,password} = req.body
        console.log(email,password)
       //Validate email & password

       if(!email || !password){
           return next(new ErrorResponse('Please provide an email and password',400))
       }


       //check for user
       const user = await User.findOne({
           email:email,
       }).select('+password')


       
       console.log(user)
       console.log('com')
       if(!user){
        return next(new ErrorResponse('Invalid credentials1',401))
       }


       //Check if password matches
       const isMatch = await user.matchPassword(password);

       if(!isMatch){
        return next(new ErrorResponse('Invalid credentials2',401))
       }

       sendTokenResponse(user,200,res)

       

      
    }catch(error){
        console.log('error')
        console.log(error.message)
    }
}

 

// @desc Get current logged in user
// @route Get /api/v1/auth/me
// @access Private

exports.getMe = async(req,res,next) => {
    try{
        console.log('apple')
        console.log(req)
        console.log(req.userrr.id)
        console.log(req.userrr._id)
        const user = await User.findById(req.userrr._id)
        console.log(user)
        res.status(200).json({
            success:true,
            data: user
        })
    }catch(error){
        console.log(error)
    }
}



// @desc Update user details
// @route PUT /api/v1/auth/updatedetails
// @access Private

exports.updateDetails = async(req,res,next) => {
    try{
        const fieldsToUpdate = {
            name:req.body.name,
            email:req.body.email
        }
        const user = await User.findByIdAndUpdate(req.userrr.id,fieldsToUpdate,{
            new:true,
            runValidators:true
        });
        res.status(200).json({
            success:true,
            data: user
        })
    }catch(error){
        console.log(error)
    }
}





// @desc Update password
// @route PUT /api/v1/auth/updatepassword
// @access Private

exports.updatePassword = async(req,res,next) => {
    try{
        console.log(req.userrr.id)
        const user = await User.findById(req.userrr.id).select('+password')
        console.log(user);
        if(!(await user.matchPassword(req.body.currentPassword))){
            return next(new ErrorResponse('currentPassword is incorrect',404));
        }

        user.password = req.body.newPassword;
        await user.save()



        sendTokenResponse(user,200,res);
    }catch(error){
        console.log(error)
    }
}















// @desc Forget password
// @route POST /api/v1/auth/forgotpassword
// @access Public

exports.forgotPassword = async(req,res,next) => {
    try{
        const user = await User.findOne({email:req.body.email})
        if(!user){
            return next(new ErrorResponse('There is no user with that email',404))
        }

        //Get reset token
        const resetToken = user.getResetPassWordToken();
        console.log(`1${resetToken}`)
        console.log(`2${user}`)//沒有password，因該是因為Schema的select:false
        await user.save({validateBeforeSave:false})//加了這行，才能把resetPasswordExpire、resetPasswordToken寫到DB， 因為這兩個property是到const resetToken這行才產生的，validateBeforeSave:false因為不用再做一次validate
        //await user.save();寫成這樣也可以，預設是要做validate，做了也沒差
        
      



        try{
            //create reset url
            const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
            const message = `You are receiving this email because you has requested the reset of a password. Please make a PUT request to: \n ${resetUrl}`;
            await sendEmail({
                email:user.email,
                subject: 'Password reset token',
                message
            })

            await res.status(200).json({success:true,data: 'Email sent'})
        }catch(error){
            console.log(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({validateBeforeSave:false});
            return next(new ErrorResponse('Email could not be sent',500))
        }
      
/*
        res.status(200).json({
            success:true,
            data: user
        })
*/
    }catch(error){
        console.log('car')
        console.log(error)
    }
}


// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  public

exports.resetPassword = async(req,res,next) => {
    try{
        //Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
        console.log('abc')
        console.log(resetPasswordToken)
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()}
        });
        console.log(user);
        if(!user){
            return next(new ErrorResponse('Invalid token',400));
        }
        //Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        sendTokenResponse(user,200,res)


    }catch(error){
        console.log(error.message)
    }
}



//Get token from model, create cookie and send response
const sendTokenResponse = (user,statusCode,res) => {
    //Create token
    const token = user.getSignedJwtToken();
    console.log(token)
    const options= {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*1000*60),
        httpOnly:true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        token
    })
}

