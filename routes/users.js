const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//Bring in models
let User = require('../models/user');

// Registering Users
router.get('/register',function(req,res){
  res.render('register');
});
// register process
router.post('/register',function(req,res){
  const name = req.body.name ;
  const email = req.body.email ;
  const username = req.body.username ;
  const password = req.body.password ;
  const password2 = req.body.password2 ;

  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','Name is required').isEmail();
  req.checkBody('username','Username is required').notEmpty();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('password2','Password is not matching').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors : errors,

    });
    console.log(errors)
  }else {
    var newUser = new User({
      name : name,
      email: email,
      password:password,
      username:username
    })
  }
  bcrypt.genSalt(10,function(err,salt){
    bcrypt.hash(newUser.password ,salt ,function(err,hash){
      if(err){
        console.log(err);
      }else{
        newUser.password = hash ;
        newUser.save(function(err){
          if(err) {console.log(err);
          return;}else{
            req.flash('success','You are now registered.');
            res.redirect('/users/login');
          }

        });
      }
    })
  })

});
// login form
router.get('/login',function(req,res){
  res.render('login');
});

// login process
router.post('/login',function(req,res,next){
 passport.authenticate('local',{
   successRedirect : '/',
   failureRedirect :'/users/login',
   failureFlash : true,
 })(req,res,next);
});
// Logout
router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','Logged Out');
  res.redirect('/users/login');
});




module.exports = router ;
