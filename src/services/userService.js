const User = require("../models/user")
const createUserService = async (name, email, password) => {
    let result =await User.create({
        name,email,password
    });
    return result;
}
module.exports= {createUserService}