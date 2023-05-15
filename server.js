const path = require('path');
const express = require('express');
require('dotenv').config();
//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const cookieParser = require('cookie-parser')
const app = express();
const morgan = require('morgan');
const colors = require('colors')
const fileupload = require('express-fileupload')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000


//const logger = require('./middleware/logger')
//app.use(logger);


//Dev logging middleware
if(process.env.Node_ENV === 'development'){
    app.use(morgan('dev'))

}







//1
//body parser
app.use(express.json())
//Cookie parser
app.use(cookieParser())
//File uploading
app.use(fileupload())
//Set static folder
app.use(express.static(path.join(__dirname, '/public')));
console.log(path.join(__dirname, '/public'))


//2
//Mount routers
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses);
app.use('/api/v1/auth',auth);
app.use('/api/v1/users',users);
app.use('/api/v1/reviews',reviews);


//3
//app.use(errorHandler);




app.listen(PORT,() => {
    console.log(`server is running on ${PORT}`.blue.bold);
    connectDB(process.env.MONGO_URI);
})
