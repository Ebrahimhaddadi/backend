const HttpError = require("../models/HttpError");
const {v4} = require("uuid")
const {validationResult} = require("express-validator")
const getCoordsForAddress = require("../util/location")
const axios = require("axios");
const Place = require("../models/place")
const User=require("../models/user")
const mongoose=require("mongoose")

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId)

    } catch (e) {
        const error = new HttpError("Something went wrong,could find a place.", 500);
        next(error)
    }
    if (!place) {
        const error = new HttpError("Could not find a place for the provided id", 404)
        return next(error)
    }
    res.json({place: place.toObject({getters: true})})
}


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let uesrWithPlaces;
    try {
        uesrWithPlaces = await User.findById(userId).populate("places")

    } catch (e) {
        const error = new HttpError("Fetching places failed, please try again ", 500);
        return next(error)

    }
    if (!uesrWithPlaces || uesrWithPlaces.places.length === 0) {
        return  new HttpError("Could not find user for the id", 404)
    }
    res.json({places: uesrWithPlaces.places.map((place) => place.toObject({getters: true}))})
};
const createPlace = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {

        return next(new HttpError("Invalid input passed ,please check your data", 422));
    }
    const {title, description, address, creator} = req.body;
    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: "https://picsum.photos/200/300",
        creator
    })
    let user;
    try {
      user=await User.findById(creator)
    }catch (e) {
        const err=new HttpError("Creating place Failed, please try again",500);
        return next(err)
    }
    if(!user){
        const err=new HttpError("Could not find user for provided id",404);
        return next(err)
    }
    console.log(user)
    try {
        // await createdPlace.save();
        const sess=await mongoose.startSession()
        sess.startTransaction();
        await createdPlace.save({session:sess});
        user.places.push(createdPlace);
        await  user.save({session:sess});
        await  sess.commitTransaction()

    } catch (e) {
        const error = new HttpError("Creating place failed,please try again.", 500)
        return next(error);
    }

    res.status(201).json({place:createdPlace})
};

const updatePlace = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        throw  new HttpError("مقادیر وارد شده صحیح نیست لطفا دوباره سعی کنید", 422)
    }
    const {title, description} = req.body;
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId)
    } catch (e) {
        const error = new HttpError("Something went wrong could not update place  ", 500);
        return next(error)
    }
    place.title = title;
    place.description = description;
try{
    await place.save()

}catch (e) {
    const error = new HttpError("Something went wrong could not update place  ", 500);
    return next(error)
}
    res.status(200).json({place: place.toObject({getters:true})})

};

const deletePlace =async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
       place= await Place.findById(placeId).populate("creator")
    }catch (e) {
        const error=new HttpError("Something went wrong could not delete place  ",500);
        return next(error);
    }
    if (!place){
        const err=new HttpError("Could not find place this id.",404);
        return next(err)
    }

    try {
      const sess=await mongoose.startSession();
      sess.startTransaction()
        await place.remove({session:sess});
      place.creator.places.pull(place);
      await place.creator.save({session:sess});
      await sess.commitTransaction();
    }catch (e) {
        const error=new HttpError("Something went wrong could not delete place  ",500);
        return next(error);
    }
    res.status(200).json({message: "deleted place"})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;