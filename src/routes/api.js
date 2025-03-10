const express = require('express');
const {createUser,handleLogin,getUser,deleteUser,updateUser,handleLogout,handleFetchAccount}=require("../controllers/userController");
const auth = require('../middleware/auth');
const { handleUploadImg,createVoucher,getVoucher,deleteVoucher} = require('../controllers/voucherController');
const routerAPI = express.Router();
routerAPI.all("*",auth)
routerAPI.get("/",(req,res)=>{
    return res.status(200).json("Hello world")
})
//user
routerAPI.post("/register",createUser);
routerAPI.post ("/login",handleLogin);
routerAPI.post ("/logout",handleLogout);
routerAPI.get ("/account",handleFetchAccount);
//admin
routerAPI.post ("/user",createUser)
routerAPI.get ("/user",getUser)
routerAPI.delete("/user",deleteUser)
routerAPI.put("/user",updateUser)
//voucher
routerAPI.post("/image",handleUploadImg);
routerAPI.post("/voucher",createVoucher);
routerAPI.get("/voucher",getVoucher);
routerAPI.delete("/voucher",deleteVoucher);
module.exports = routerAPI; //export default 