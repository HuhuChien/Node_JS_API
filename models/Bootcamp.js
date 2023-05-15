const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,'Please add a name'],
        unique:true,
        trim:true,
        maxLength: [50,'Name cannot be more than 50 characters']
    },
    slug:String,
    description: {
        type:String,
        required:[true,'Please add a description'],
        maxLength: [500,'Name cannot be more than 500 characters']
    },
    website:{
        type:String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,'please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type:String,
        maxLength:[20,'Phone number cannot be longer than 20 characters']
    },
    email:{
        type:String,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'please add a valid email'
        ]
    },

    address:{
        type:String,
        required: [true,'please add an address']
    },
    location:{
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
          },
        coordinates: {
            type: [Number],
            index: '2dsphere'//就算不寫這行，好像也不會影響
          },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country:String
    },
    careers: {
        type:[String],
        required: true,
        enum:[
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating:{
        type:Number,
        min:[1,'Rating must be at least 1'],
        max:[10,'Rating must cannot be more than 10']
    },
    averageCost:Number,
    photo:{ 
        type:String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
      },
      jobAssistance: {
        type: Boolean,
        default: false
      },
      jobGuarantee: {
        type: Boolean,
        default: false
      },
      acceptGi: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      user:{   
        //   type:mongoose.Schema.ObjectId,
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', //應該是看models
          required:true,
      }

},
{
    toJSON: {virtuals:true},
    toObject:{virtuals:true}
});

//Create bootcamp slug from the name
BootcampSchema.pre('save',function(next){
    //console.log('slugify ran', this.name);
    this.slug = slugify(this.name,{lower:true})
    //console.log('banana')
    next();
});

//Geocode & create location field
BootcampSchema.pre('save',async function(next){
    
    const loc = await geocoder.geocode(this.address);
    //console.log(loc)
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
    }


    //Do not save address in DB  驗證過了，去POST新的document到DB，如果沒有下面這行，address會在資料裡面
    this.address = undefined;
    next();
});


//Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove',async function(next){
    console.log(`Courses being removed from bootcamp ${this._id}`);
    await this.model('Course').deleteMany({bootcamp: this._id});
    next();
});

//Reserve populate with virtuals，可以去bootcamp controller去populate('coursesf)，使用postman去測試，可以看到一個field叫做coursesf
BootcampSchema.virtual('coursesf',{ //coursesf這是隨便取的，會顯示在document裡面
    ref:'Course',  //應該是看models
    localField: '_id',
    foreignField: 'bootcamp',//the field in Course model
    justOne: false//get array of all courses
})



module.exports = mongoose.model('Bootcamp',BootcampSchema);