'use strict'

var router = require('express').Router();
var User = require('../../db/models/user');

router.get('/', function (req, res, next) {
  //check user priviledge

  //if user isAdmin then return all users
  User.findAll()
  .then(function (usersArray){
    res.send(usersArray)
  }).catch(next)
});

router.get('/:id', function(req, res, next){
  User.findOne({
    where: {
      id: req.params.id
    }
  }).then(function(user){
    res.send(user)
  })
})

router.post('/', function(req,res,next){
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(function(userOrNull){
    if (userOrNull){
      res.send('Error, email exists already')
    } else{
      User.create(req.body)
      .then(function(user) {
        res.send(user)
      })
    }
  })
})

module.exports = router;