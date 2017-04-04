angular.module('tutionApp')
  .controller('MainCtrl', function($scope, $timeout, $state) {
    console.log('MainCtrl');
//    firebase.auth().onAuthStateChanged(function(user) {
//      if (user) {
//        $state.go('app.students');
//        return;
//        //User is signed in.
//        var userDetails = {
//          name: user.displayName,
//          email: user.email
//        }
//        $timeout(function() {
//          $scope.userDetails = userDetails;
//        });
//      }
//    });
  })


