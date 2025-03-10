const {
  createUserService,
  loginService,
  getUserService,
  deleteAUserService,updateAUserService,fetchAccountService
} = require("../services/userService");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const data = await createUserService(name, email, password);
  return res.status(200).json({
    result: data,
    message: `${email} đã tồn tại.`,
  });
};
const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService(email, password);
  return res.status(200).json(data);
};
const handleLogout=async(req,res)=>{
  return res.status(200).json({
    message: "Logout",
    data: "Logout success.",
  })
}
const getUser = async (req, res) => {
  let limit=req.query.limit;
  let page=req.query.page;
  let result=null;
  if(limit && page){
    result= await getUserService(limit,page,req.query)
  }else{
    result= await getUserService()
  }
  
  return res.status(200).json(result);
};
const deleteUser = async (req, res) => {
  let id = req.body.id;
  let result = await deleteAUserService(id);
  return res.status(200).json(
    {
        EC: 0,
        data: result
    }
) 
};
const updateUser=async(req,res)=>{
  const {id,name,email,password}=req.body;
  let result = await updateAUserService(id,name,email,password);
  return res.status(200).json(
    {
        EC: 0,
        data: result
    }
  )
}
const handleFetchAccount=async(req,res)=>{
  let result=await fetchAccountService(req.user);
  return res.status(200).json(
    {
        EC: 0,
        data: result
    }
  )
}
module.exports = { createUser, handleLogin, getUser, deleteUser,updateUser,handleLogout,handleFetchAccount };
