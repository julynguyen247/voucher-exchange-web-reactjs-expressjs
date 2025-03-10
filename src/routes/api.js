const express = require('express');
const {createUser,handleLogin,getUser}=require("../controllers/userController");
const auth = require('../middleware/auth');
const { handleUploadImg,createVoucher } = require('../controllers/voucherController');
const routerAPI = express.Router();
routerAPI.all("*",auth)
routerAPI.get("/",(req,res)=>{
    return res.status(200).json("Hello world")
})
//user
routerAPI.post("/register",createUser);
routerAPI.post ("/login",handleLogin);
routerAPI.get ("/user",getUser)
//voucher
routerAPI.post("/image",handleUploadImg);
routerAPI.post("/voucher",createVoucher)

module.exports = routerAPI; //export default 