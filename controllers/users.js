
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');







// @desc Get all users
// @route Get api/v1/auth/users
// @access Private/Admin


exports.getUsers = async(req,res,next) => {
    try{
      res.status(200).json(res.advancedResults)
    }catch(error){
      console.log(error)
    }
}


// @desc Get single user
// @route Get api/v1/users/:id
// @access Private/Admin


exports.getUser = async(req,res,next) => {
    try{
      const user = await User.findById(req.params.id)
        res.status(200).json({
            success:true,
            data:user
        })

    }catch(error){
       console.log(error)
    }
}


// @desc Create user
// @route POST api/v1/users
// @access Private/Admin


exports.createUser = async(req,res,next) => {
    try{
      const user = await User.create(req.body);
      res.status(201).json({
          success:true,
          data:user
      })

    }catch(error){
       console.log(error)
    }
}




// @desc Updata user
// @route PUT api/v1/users/:id
// @access Private/Admin


exports.updateUser = async(req,res,next) => {
    try{
      const user = await User.findByIdAndUpdate(req.params.id,req.body,{
          new:true,
          runValidators:true
      })


      res.status(200).json({
          success:true,
          data:user
      })

    }catch(error){
       console.log(error)
    }
}





// @desc Delete user
// @route DELETE api/v1/users/:id
// @access Private/Admin


exports.deleteUser = async(req,res,next) => {
    try{
      await User.findByIdAndDelete(req.params.id)

      res.status(200).json({
          success:true,
          data:{}
      })

    }catch(error){
       console.log(error)
    }
}