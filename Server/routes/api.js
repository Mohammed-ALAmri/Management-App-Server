const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken')
const db = "mongodb+srv://mohammed:Mfa121212@mydb-qq4gp.mongodb.net/test?retryWrites=true&w=majority";
// // mongoose.Promise = global.Promise;

mongoose.connect(db,  { useNewUrlParser: true },  (err) => {
    if (err) throw err;
        console.log(`Successfully connected to database.`);
})

router.get('/', (req, res) => {
    res.send('From API')
})


router.post('/register', (req, res) => {
    let userData = req.body
    User.findOne({phone: userData.phone}, (err, user2) => {
      if (err) {
      console.log(err)    
      } 
      else {
        if(user2){
            res.status(401).send('Invalid phone')
        }
        else{
          let user1 = new User(userData)
          user1.save((err, registeredUser) => {
            if (err) {
              console.log(err)      
            } else {
              let payload = {subject: registeredUser._id}
              let token = jwt.sign(payload, 'secretKey')
              res.status(200).send({token})
            }
          })
        }
      }
    })
  })


  router.post('/login', (req, res) => {
    let userData = req.body
    User.findOne({phone: userData.phone}, (err, user) => {
        if (err) {
        console.log(err)    
        } else {
        if (!user) {
            res.status(401).send('Invalid phone')
        } else 
        if ( user.password !== userData.password) {
            res.status(401).send('Invalid Password')
        } else {
            let payload = {subject: user._id}
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token})
        }
        }
    })
})

function verifyToken(req, res, next) {
  if(!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  let token = req.headers.authorization.split(' ')[1]
  if(token === 'null') {
    return res.status(401).send('Unauthorized request')    
  }
  let payload = jwt.verify(token, 'secretKey')
  if(!payload) {
    return res.status(401).send('Unauthorized request')    
  }
  req.userId = payload.subject
  next()
}

module.exports = router;