const {v4} =require("uuid");

const HttpError=require("../models/HttpError")
const {validationResult} = require("express-validator");

let DUMMY_USERS=[
    {
        id:"u1",
        name:"Ebrahim Hadadi",
        email:"test@gmail.com",
        password:"test"
    }
]
const getUsers = (req,res,next) => {
  res.json({users:DUMMY_USERS})
};

const signup = (req,res,next) => {
    const error= validationResult(req);
    if(!error.isEmpty()){

        throw  new HttpError("خطایی رخ داده است یکی از مقادیر به درستی وارد نشده",422)
    }
  const {name,email,password}=req.body;

  const hasUser=DUMMY_USERS.find(u=>u.email===email)
if(hasUser){
    throw new HttpError("Could not create user,email already exists",422)
}

  const createdUser={
      id:v4(),
      name,
      email,
      password
  };
  DUMMY_USERS.push(createdUser);
  res.status(201).json({user:createdUser})
};

const login = (req,res,next) => {
    const error= validationResult(req);
    if(!error.isEmpty()){
        throw  new HttpError("Invalid input passed ,please check your data",422)
    }
  const {email,password}=req.body;
  const indentifiedUser=DUMMY_USERS.find(u=>u.email===email);

  if(!indentifiedUser || indentifiedUser.password !== password){
      throw HttpError("Could not found identify user ,credentials seem to be wrong!",401)
  }

  res.json({message:"Logged in!"})

};


exports.getUsers=getUsers;

exports.signup=signup;

exports.login=login;