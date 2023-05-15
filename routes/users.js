const express = require('express')
const User = require('../models/User')
const router = express.Router({mergeParams:true})
//const router = express.Router()   要再搞懂與前一行的差別
const {protect,authorize} = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const {getUsers,getUser,createUser,updateUser,deleteUser} = require('../controllers/users')



router.use(protect)//下面所有route，都會用到protect這個middleware，// 在每一個請求被處理之前都會執行的 middleware
router.use(authorize('admin'))//下面所有route，都會用到authorize這個middleware


router.get('/',advancedResults(User), getUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

