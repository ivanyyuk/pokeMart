 app.controller('CartCtrl', function($scope, $log, cartContent, CartFactory){
 	$scope.cartContent=cartContent;

 	$scope.remove= function(orderId) {
 		CartFactory.removeFromCart(orderId)
 		.then(function(newCart){
 			$scope.cartContent = newCart;
 		}).catch($log)
 	}

 	$scope.changeQuantity= function (cartId, quantity, addOrSubtract) {
        CartFactory.changeQuantity(cartId, quantity, addOrSubtract);
        $scope.cartContent = CartFactory.cachedCart;
    };

  $scope.checkout = CartFactory.checkout;

  $scope.total = function() {
    var total = 0;
    cartContent.forEach(cart => total += (cart.price * cart.quantity))

    return total;  
  }
 })

 