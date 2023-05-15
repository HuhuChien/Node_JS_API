const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { JsonWebTokenError } = require('jsonwebtoken');
const jwt = require('jsonwebtoken')


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email:{
        type:String,
        required:[true, 'Please add an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'please add a valid email'
        ]
    },
    role:{
        type:String,
        enum:['user','publisher'],
        default: 'user'
    },
    password: {
        type:String,
        required: [true, 'Please add a password'],
        minlength:6,
        select:false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type:Date,
        default: Date.now 

    }
});


//Encrypt password using bcrypt

UserSchema.pre('save', async function(next){
    console.log(this.password)//forgotPassword時顯示undefined， 因該是因為Schema的select:false
    
    if(!this.isModified('password')){
        next() //意思應該是跳到下個middleware，不執行這個function剩餘內容，會顯示tv1，可能因為前面的if沒有做await，因為不知道怎麼做await
    }
    
    console.log('tv1')
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password,salt)
    console.log('tv2')
    next()//可以不用寫這行
});





//Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    });
}


//Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword){
    console.log('gla')
    console.log(enteredPassword)
    console.log(this.password)
    return await bcrypt.compare(enteredPassword, this.password);
}

//Generate and hash password token
UserSchema.methods.getResetPassWordToken = function(){
    //Generate token
    const resetToken = crypto.randomBytes(20).toString('hex')
    //console.log(resetToken)
    //Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;

}




module.exports = mongoose.model('User',UserSchema);