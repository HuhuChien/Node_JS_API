const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');



//兩個route寫在一起
// @desc Get courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:boootcampId/courses
// @access Public
exports.getCourses = async(req,res,next) => {
    try{
        let query;

        if(req.params.bootcampId){
            query = Course.find({bootcamp:req.params.bootcampId})
        } else {

            query = Course.find().populate('bootcamp')
            //query = Course.find()
            //console.log(query)
        }

        const courses = await query;
        console.log(courses);

        if(courses.length === 0){
             return res.status(400).json({success:false,error: `Bootcamp not found with id of ${req.params.bootcampId}`})
        } else {
            return res.status(200).json({
                success:true,
                count: courses.length,
                data:courses
            })
        }
     
    }catch(error){
        res.status(400).json({success:false,error: `Bootcamp all not found with id of ${req.params.bootcampId}`})
    }
}


// @desc Get single course
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = async(req,res,next) => {
    try{
        
       const course = await Course.findById(req.params.id).populate({
           path:'bootcamp',
           select: 'name description'
       })
        
       //const course = await Course.findById(req.params.id)
      
       if(!course){
           return next(new ErrorResponse(`No course with id of ${req.params.id}`,404))

       } else {
        return res.status(200).json({
            success:true,
            data:course
        })
       }

    }catch(error){
        res.status(400).json({success:false,error: `Bootcamp not found with id of ${req.params.id}`})
    }
}







// @desc Add course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access private
exports.addCourse = async(req,res,next) => {
    try{
     req.body.bootcamp = req.params.bootcampId;
     console.log('desk')
     console.log(req.userrr)
     req.body.user = req.userrr.id;
     const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(new ErrorResponse(`no bootcamp with the id of ${req.params.bootcampId}`,404))
    }

     //Make sure user is bootcamp owner
     console.log(bootcamp)
     if(bootcamp.user.toString() !== req.userrr._id.toString() && req.userrr.role !== 'admin'){
         return next(new ErrorResponse(`User ${req.userrr.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,401))
     }
    
    const course = await Course.create(req.body)

    res.status(200).json({
        success:true,
        data: course
    })
    }catch(error){
        res.status(400).json({success:false,error: `Bootcamp not found with id of ${req.params.bootcampId}`})
    }
}



// @desc Update course
// @route PUT /api/v1/courses/:id
// @access private
exports.updateCourse = async(req,res,next) => {
    try{
  
     let course = await Course.findById(req.params.id)

    if(!course){
        return next(new ErrorResponse(`no course with the id of ${req.params.id}`,404))
    }
    



    //Make sure user is course owner

    if(course.user.toString() !== req.userrr._id.toString() && req.userrr.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.userrr.id} is not authorized to update course ${course._id}`,401))
    }




    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    })


    res.status(200).json({
        success:true,
        data: course
    })
    }catch(error){
        res.status(400).json({success:false,error: `Bootcamp not found with id of ${req.params.id}`})
    }
}





// @desc Delete course
// @route DELETE /api/v1/courses/:id
// @access private
exports.deleteCourse = async(req,res,next) => {
    try{
  
     const course = await Course.findById(req.params.id)

    if(!course){
        return next(new ErrorResponse(`no bootcamp with the id of ${req.params.id}`,404))
    }
    

    //Make sure user is course owner

    if(course.user.toString() !== req.userrr._id.toString() && req.userrr.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.userrr.id} is not authorized to delete course ${course._id}`,401))
    }


    await course.remove()//不使用findByIdandDelete，因為要配合remove middleware

    res.status(200).json({
        success:true,
        data: {}
    })
    }catch(error){
        res.status(400).json({success:false,error: `Bootcamp not found with id of ${req.params.id}`})
    }
}


