angular.module('tutionApp')
        .controller('changePasswordCtrl', function ($scope, ionicToast, $state, localStorageService) {
            console.log('changePasswordCtrl');
            $scope.userDetails = null;
            $scope.user = null;
            var userref = null;
            
            $scope.$on("$ionicView.enter", function (scopes, states) {
                userref = firebase.database().ref('students');
                $scope.isAdmin = false;
                $scope.userDetails = localStorageService.get('userDetails');
                console.log('Change password View Enter', $scope.userDetails);
                
                if ($scope.userDetails === null) {
                    $state.go('app.main');
                }
                $scope.userDetails.password = null;
                $scope.user = $scope.userDetails;
            });
            
            $scope.submitChangePassword = function() {
                if($scope.user.password !== $scope.user.cpassword) {
                    return $scope.changePasswordError = "Password and Confirm Password doesn't match";
                }
                $scope.$emit('showLoader');
                var res = userref.child($scope.userDetails.studentId).update({"password": $scope.user.password});
                console.log(res);
                res.then(function(ret) {
                    $scope.$emit('hideLoader');
                    ionicToast.show('Password Updated Successfully', 'top', true, 2500, 'ionic-success');
                    console.log(ret);
                    $state.go('app.students');
                }, function(err){
                    $scope.$emit('hideLoader');
                    ionicToast.show('Unable to updated password', 'top', true, 2500, 'ionic-error');
                    console.log(err);
                });
            };
        });


