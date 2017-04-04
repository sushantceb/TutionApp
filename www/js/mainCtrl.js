angular.module('tutionApp')
  .controller('MainCtrl', function($scope, $timeout) {
    console.log('MainCtrl');
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        //User is signed in.
        var userDetails = {
          name: user.displayName,
          email: user.email
        }
        $timeout(function() {
          $scope.userDetails = userDetails;
        })
      }
    });
  })


