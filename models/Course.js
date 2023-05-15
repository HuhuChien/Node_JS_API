const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required: [true, 'Please add a course title']
    },
    description:{
        type:String,
        required:[true,'Please add a description']
    },
    weeks:{
        type:String,
        required:[true,'Please add number of weeks']
    },    
    tuition:{
    type:Number,
    required:[true,'Please add a tuition cost']
    },
    minimumSkill:{
        type:String,
        required:[true,'Please add a minimum skill'],
        enum:['beginner','intermediate','advanced']
    },
    scholarshipAvailable:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    bootcamp:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bootcamp', //應該是看models
        required:true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //應該是看models
        required:true,
    }
});


//Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId){
    //console.log('calculating avg cost...'.blue)
    const obj = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {$avg:'$tuition'}
            }
        }
    ]);
    //console.log(obj)
    //先找Bootcamp model，會有一個field叫做averageCost
    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId,{
            averageCost: Math.ceil(obj[0].averageCost / 10) *10
        })
    } catch(err){
        console.error(err)
    }
}

//model 可以call static method，這跟一般的method不一樣(例如 User model的getSignedJwtToken)
//Call getAverageCost after save
CourseSchema.post('save',function(){
    this.constructor.getAverageCost(this.bootcamp)
});

//model 可以call static method，這跟一般的method不一樣(例如 User model的getSignedJwtToken)
//Call getAverageCost before remove
CourseSchema.pre('remove',function(){
    this.constructor.getAverageCost(this.bootcamp)
});





module.exports = mongoose.model('Course',CourseSchema)