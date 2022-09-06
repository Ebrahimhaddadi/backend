const express=require("express");
const bodyParser=require("body-parser");

const mongoose=require("mongoose")



const placesRoutes=require("./routes/places-routes");
const usersRoutes=require("./routes/users-routes")
const HttpError=require("./models/HttpError")


const app=express();
app.use(bodyParser.json());


app.use("/api/places",placesRoutes);

app.use("/api/users",usersRoutes)

app.use((req,res,next)=>{
    const error=new HttpError("Could find this route opps!",404);
    throw error
});

app.use((error,req,res,next)=>{
    if(res.headerSant){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message:error.message || "An Unknown error occurred! "})
})





mongoose.connect("mongodb+srv://ebi:YCxwvFoE5wBOM2rx@cluster0.im2jyir.mongodb.net/places?retryWrites=true&w=majority")
    .then(()=>{
        app.listen(5001,()=>{
            console.log("Listen to port 5001")
        })
    })
    .catch((err)=>{
        console.log(err)
    })
