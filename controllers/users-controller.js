

const HttpError = require("../models/HttpError")
const {validationResult} = require("express-validator");
const User = require("./../models/user")

//
const getUsers =async (req, res, next) => {
    let users;
  try {
      users=await User.find({},"-password");
  }catch (e) {
        const err=new HttpError("Fetching users failed try again later",500);
        return next(err)
  }
  res.json({users:users.map((user)=>user.toObject({getters:true}))})
};

const signup = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {

        const error = new HttpError("خطایی رخ داده است یکی از مقادیر به درستی وارد نشده", 422);
        return next(error)
    }
    const {name, email, password} = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (e) {
        const error = new HttpError("Signing up is failed, please try again", 500);
        return next(error)
    }
    if (existingUser) {
        const error = new HttpError("User exists already,please login insted.", 422);
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: "https://picsum.photos/200/300",
        password,
        places:[]
    })
    try {
        await createdUser.save();

    } catch (e) {
        const error = new HttpError("Signing up failed,please try again.", 500)
        return next(error);
    }
    res.status(201).json({user: createdUser.toObject({getters: true})})
};

const login = async (req, res, next) => {
    const {email, password} = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (e) {
        const error = new HttpError("Login is failed, please try again", 500);
        return next(error)
    }

    if (!existingUser || existingUser.password !==password){
        const err=new HttpError("Invalid credentials, could not log you in.",401);
        return next(err)
    }

    res.json({message: "Logged in!"})

};


exports.getUsers = getUsers;

exports.signup = signup;

exports.login = login;