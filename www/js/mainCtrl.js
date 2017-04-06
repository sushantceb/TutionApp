angular.module('tutionApp')
        .controller('MainCtrl', function($scope, $timeout, $state, $ionicHistory) {
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
            firebase.auth().onAuthStateChanged(function(userres) {
                if (userres) {
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    });
                    $state.go('app.students');
                    return;
                    //User is signed in.
                    var userDetails = {
                        name: userres.displayName,
                        email: userres.email
                    };
                }
            });
        })


