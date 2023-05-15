const mongoose = require('mongoose');
const colors = require('colors');

/* 沒有效果
const connectDB = async(url) => {
  try {
    await mongoose.connect(url,
      { useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:false,
        useCreateIndex:true},
        () => {
          console.log('done');
        }
    )
  } catch(error){
    console.log(error);
  }
 



    
};
 */

const connectDB = async(URL) => {
  await mongoose.connect(URL, 
    err => {
        if(err) {
          console.log((err.message + '(Database)').red);
        } else {
          console.log(`connected to MongoDB`.cyan)
        }
        
    });
  
}


module.exports = connectDB;

