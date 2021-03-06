'use strict'

var router = require('express').Router();
var UserOrders = require('../../db/models/userOrders');
var OrderDetails = require('../../db/models/orderDetails');
var Product = require('../../db/models/product');
var User = require('../../db/models/product');
var db = require('../../db/_db');

router.use(function (req, res, next) {
    var findOrUpdateUser = function (cart) {
        if (!cart) {
            return UserOrders.findByUser(req.user.id)
        } else {
            return cart.updateUser(req.user.id);
        }
    }

    var createCartOrUpdateSess = function (cart) {
        if (!cart) return UserOrders.createCart(req.user.id);
        else return cart.updateSession(req.sessionID);
    }

    var assignCartId = function (cart) {
        req.cartId = cart.id;
        next();
    }

    if (!req.user) {
        UserOrders.findOrCreate({
            where: {sessionId: req.sessionID, status: 'pending', userId: null}
        }).spread(assignCartId) // findOrCreate returns an array
    } else {
        UserOrders.findByUser(req.user.id)
        .then(findOrUpdateUser)
        .then(createCartOrUpdateSess)
        .then(assignCartId)
    }
})



// OB/SB: cart middleware? e.g. req.cart = ... followed by next()

router.get('/cart', function (req, res, next) {

    OrderDetails.findAll({
        where: {
            userOrderId: req.cartId
        }
    }).then(function(orders){
        res.send(orders)
    })
    .catch(next)

});

 // req.body = {
 //    userId
 //    productId
 //    quantity
 // }

 router.post('/cart/:productId', function (req, res, next) {


    Product.findById(req.params.productId)
    .then(function(product){
        return product.addToOrder(req.body.quantity, req.cartId);
    }).then(function (newOrder) {
        res.send(newOrder);
    }).catch(next);


});

router.put('/cart/updateSessionCart', function(req,res,next){
  UserOrders.findOne({
    where: {
        sessionId: req.session.id,
        status: 'pending'
    }
  }).then(function(cart){
    cart.updateShipping(req.body)
  }).then(function (){  
   res.sendStatus(201)
  }).catch(next)
 
})

router.put('/cart/updateUserCart', function(req,res,next){
  UserOrders.findByUser(req.user.id)
    .then(function(cart){
    cart.updateShipping(req.body)
  }).then(function (){  
   res.sendStatus(201)
  }).catch(next)
 
})


router.delete('/cart/:orderId', function (req, res, next) {
    // product id needs to be sent to front end
    OrderDetails.destroy({
        where: {
            userOrderId: req.cartId,
            id: req.params.orderId
        }
    }).then(function () {
        res.status(204).end();
    }).catch(next);
});



router.put('/cart/:orderDetailId', function (req, res, next) {
    OrderDetails.findById(req.params.orderDetailId)
    .then(function(orderDetail) {
        return orderDetail.update({quantity: req.body.quantity})
    }).then(function (updated) {
        res.send(updated);
    }).catch(next);
});
router.get('/paid', function (req, res, next) {
    
    var dates = [];
    if(req.user) {
    UserOrders.findAll({
     where: {
           userId: req.user.id, 
           status: 'paid'
       }
   })
    .then(function (userOrders) {
     userOrders.forEach(order => dates.push(order.updatedAt))
     return userOrders.map(userOrder => {
         return OrderDetails.findAll({
             where: {userOrderId: userOrder.id}
         })
     });
 }).then(function (itemPromises) {
     return Promise.all(itemPromises);
 }).then(function (paidItemsArr) {
     res.send({paidItems: paidItemsArr, date:dates})
 }).catch(next);
}

else {
    UserOrders.findAll({
     where: {
           sessionId: req.session.id, 
           status: 'paid'
       }
   })
    .then(function (userOrders) {
     userOrders.forEach(order => dates.push(order.updatedAt))
     return userOrders.map(userOrder => {
         return OrderDetails.findAll({
             where: {userOrderId: userOrder.id}
         })
     });
 }).then(function (itemPromises) {
     return Promise.all(itemPromises);
 }).then(function (paidItemsArr) {
     res.send({paidItems: paidItemsArr, date:dates})
 }).catch(next);
}
});

router.get('/fulfilled', function (req, res, next) {
    UserOrders.findAll({
        where: {
            userId: req.user.id, // from session/auth
            status: 'fulfilled'
        }
    }).then(function (userOrders) {
        return userOrders.map(userOrder => {
            return OrderDetails.findAll({
                where: {userOrderId: userOrder.id}
            })
        });
    }).then(function (itemPromises) {
        return Promise.all(itemPromises);
    }).then(function (shippedItemsArr) {
        res.send(shippedItemsArr)
    }).catch(next);
});


router.get('/cart/checkout', function(req, res, next) {
    return UserOrders.findById(req.cartId)
    .then(function(cart){
        return cart.update({status: 'paid'})
    })
    .then(function() {
        if(req.user)
            return UserOrders.createCart(req.user.id);
        else
            return UserOrders.create({sessionId: req.sessionID})
    })
    .then(function() {
        res.status(200);
        res.redirect('/histories')
    })
    .catch(next)
})


module.exports = router;
