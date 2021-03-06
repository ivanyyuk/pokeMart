app.directive('shoppingCart', function(CartFactory, $rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/cart-reveal/cart-reveal.html',
        scope: {
            active: '=',
            addAndRevealCard: '='
        },
        // scope: { setFn: '&' },
        link: function (scope, elem, attr) {
            scope.showCart = 'checkout';
            CartFactory.fetchAllFromCart().then(function (cart) {
                scope.cart = CartFactory.cachedCart;
            });
            $rootScope.$on('updateCart', function (event, cart) {
                scope.cart = cart;
            })
            scope.revealCart = function () {
                scope.showCart = 'checkout checkout--active';
                
            };
            scope.hideCart = function () {
                scope.active = 'inactive';
                scope.showCart = 'checkout';
            }
            scope.total = function() {
                var total = 0;
                if(scope.cart)
                scope.cart.forEach(item => total += (item.price * item.quantity))
                return total;
            } 
            // scope.setFn({theDirFn: scope.updateMap});

        }
    }
})
