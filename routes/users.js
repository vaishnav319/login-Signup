const express = require("express")
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport')
//User model:
const User = require('../models/User');

//login page
router.get('/login',(req,res)=>res.render("login"))

//Resgister page
router.get('/register',(req,res)=>res.render("register"))

//Register Handle
router.post('/register',(req,res) =>{
  const{name,email,password,password2}=req.body;
  let errors=[]

  //check required fields
  if(!name || !email || !password || !password2){
    errors.push({msg:'Please fill in all fields'})
  }

  //check passwords match:
  if(password!==password2){
    errors.push({msg:'Passwords do not match'})
  }

  //check pass length:
  if(password.length<6){
    errors.push({msg:'Password should be atleast six characters'});
  }


  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
        //Hash Password:
        bcrypt.genSalt(10,(err,salt)=>
          bcrypt.hash(newUser.password,salt, (err, hash) =>{
            if(err) throw err;
            //Set password to hash
            newUser.password = hash;
            //Save User
            newUser.save()
            .then(user=>
            {
              req.flash('success_msg','You are now registered and can log in')
              res.redirect('/users/login');
            })
            .catch(err => console.log(err));

        }))
        }
      });
  }

})

//Login handle:
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
successRedirect:'/dashboard',
failureRedirect:'/users/login',
failureFlash:true})(req,res,next)
})


//Logout Handle:
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg','You are logged out')
  res.redirect('/users/login')
})









module.exports = router;
