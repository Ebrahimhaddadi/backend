const HttpError = require("../models/HttpError");
const {v4}=require("uuid")
const {validationResult}=require("express-validator")
const getCoordsForAddress=require("../util/location")
const axios = require("axios");

let DUMMY_PLACES=[
    {
        id:"p1",
        title:"Empire State Building",
        description:"One Of the most famous sky scrapers in the world!",
        location:{
            lat:51,
            lng:31,
        },
        address:"Tehran city of iran ",
        creator:"u1"

    }
]
console.log(DUMMY_PLACES)

const getPlaceById=(req,res,next)=>{
    const placeId=req.params.pid;
    const place=DUMMY_PLACES.find(p=>{
        return p.id===placeId
    })
    if(!place){
        throw new HttpError("Could not find a place for the provided id",404)
    }
    res.json({place})
}


const getPlacesByUserId=(req,res,next)=>{
    const userId=req.params.uid;
    console.log(userId)
    console.log(userId)
    const places=DUMMY_PLACES.filter(p=>{
        return p.creator===userId
    });
    if(!places || places.length===0){
        throw new HttpError("Could not find user for the id",404)
    }
    res.json({places})
};
const createPlace=async (req,res,next)=>{
   const error= validationResult(req);
   if(!error.isEmpty()){

       return next(new HttpError("Invalid input passed ,please check your data",422));
   }
const {title,description,address,creator}=req.body;
    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }
const createdPlace={
    id:v4(),
    title,
    description,
    location:coordinates,
    address,
    creator
};
DUMMY_PLACES.push(createdPlace);

res.status(201).json({place:createdPlace})
};

const updatePlace=(req,res,next)=>{
    const error= validationResult(req);
    if(!error.isEmpty()){
        throw  new HttpError("مقادیر وارد شده صحیح نیست لطفا دوباره سعی کنید",422)
    }
    const {title,description}=req.body;
    const placeId=req.params.pid;

    const updatedPlace={...DUMMY_PLACES.find(p=>p.id===placeId)};
    const placeIndex=DUMMY_PLACES.findIndex(p=>p.id===placeId)
    updatedPlace.title=title;
    updatedPlace.description=description;
    DUMMY_PLACES[placeIndex]=updatedPlace;
    res.status(200).json({place:updatedPlace})

};

const deletePlace=(req,res,next)=>{
const placeId=req.params.pid;
if(!DUMMY_PLACES.find(p=>p.id===placeId)){
    throw new HttpError("Could not find a place for that id ",404)
}
DUMMY_PLACES=DUMMY_PLACES.filter(p=>p.id !==placeId);
res.status(200).json({message:"deleted place"})
}

exports.getPlaceById=getPlaceById
exports.getPlacesByUserId=getPlacesByUserId;
exports.createPlace=createPlace;
exports.updatePlace=updatePlace;
exports.deletePlace=deletePlace;