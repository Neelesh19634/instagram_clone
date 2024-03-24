var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require("./post");
const storyModel = require("./story");
const passport = require('passport');
const localStrategy=require("passport-local");
const upload=require("./multer");
const { userInfo } = require('os');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get("/login",(req,res)=>{
  res.render("login",{err:req.flash("error")});
})
router.get("/profile",isLoggedIn,async (req,res)=>{
  const  user=await userModel.findOne({
    username:req.session.passport.user,
  })
  .populate("post");
 
  res.render("profile",{footer:true,user});
})
router.get("/feed",isLoggedIn,async (req,res)=>{
  const  user=await userModel.findOne({
    username:req.session.passport.user,
  })
  .populate("post");

  let stories = await storyModel.find()
  .populate("user");
  const posts=await postModel.find()
  .populate("user");

  res.render("feed",{footer:true,
    user,
    posts, 
   stories,
    });
})


router.get('/edit',isLoggedIn,async function(req, res, next) {
  const user=await userModel.findOne({
    username:req.session.passport.user,
  })

  res.render('edit',{footer:true,user});
});

router.post("/update",upload.single("image"),async (req,res,next)=>{
  const user=await userModel.findOneAndUpdate({username:req.session.passport.user},{username:req.body.username,name:req.body.name,bio:req.body.bio},{new:true})
  if(req.file){

    user.profile=req.file.filename;
  }
  await user.save();

  res.redirect("/profile");
})


router.get('/upload',isLoggedIn,async function(req, res, next) {
  const user=await userModel.findOne({
    username:req.session.passport.user,
  })
  res.render('upload',{footer:true,user})
});
router.get('/search',isLoggedIn,async function(req, res, next) {
  const user=await userModel.findOne({
    username:req.session.passport.user,
  })
  res.render('search',{footer:true,user});
});

router.get('/likes/post/:id',isLoggedIn,async function(req, res, next) {
  const user=await userModel.findOne({
    username:req.session.passport.user,
  })
  const post=await postModel.findOne({_id:req.params.id});
  
  
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id),1);
  }
  await post.save();
  res.redirect("/feed");
  
});


router.get("/username/:username",isLoggedIn,async function(req, res, next) {
  const regex= new RegExp(`^${req.params.username}`,'i');
  const users=await userModel.find({username: regex});
 res.json(users);
});

router.post("/upload",isLoggedIn,upload.single("image"),async (req,res)=>{
  const user=await userModel.findOne({
    username:req.session.passport.user,
  })
  if(req.body.category === "post"){

    const post=await postModel.create({
      picture:req.file.filename,
      caption:req.body.caption,
      user: user._id,
    })
    user.post.push(post._id);
  }else if(req.body.category === "story"){
    let story = await storyModel.create({
      story: req.file.filename,
      user: user._id,
    });
    user.stories.push(story._id);
  }else{
    res.send("tez mat chalo");
  }

  await user.save();
  res.redirect("/feed");
})

router.post("/register",(req,res)=>{
  var userData=new userModel({
    username:req.body.username,
    email:req.body.email,
    name:req.body.name
  })

  userModel.register(userData,req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
})

router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",

}))

router.get("/logout",(req,res,next)=>{
  req.logout(function(err){
    if(err){
      return next(err);
    }
    res.redirect("/login");
  })
  
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();

  }
  res.redirect("/login");
}

module.exports = router;
