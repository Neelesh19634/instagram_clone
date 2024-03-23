const mongoose=require("mongoose");
const plm=require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/intagram");

const userSchema=mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  profile:String,
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
  bio:String,
  stories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "story" 
    }
  ],


})

userSchema.plugin(plm);
module.exports=mongoose.model("user",userSchema);