// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('tutionApp', ['ionic', 'moment-picker', 'firebase', 'ionic-timepicker', 'LocalStorageModule', 'ionic-toast'])
        .config(function ($stateProvider, $urlRouterProvider, ionicTimePickerProvider, localStorageServiceProvider) {
            var config = {
                apiKey: "AIzaSyB0jOp9Vo2y9vw0bb3bBSil3OQCB16Uelw",
                authDomain: "timesheet-f9254.firebaseapp.com",
                databaseURL: "https://timesheet-f9254.firebaseio.com",
                projectId: "timesheet-f9254",
                storageBucket: "timesheet-f9254.appspot.com",
                messagingSenderId: "1031789189495"
            };
            firebase.initializeApp(config);
            
            localStorageServiceProvider.setPrefix('tutionApp').setNotify(true, true);

            var timePickerObj = {
                inputTime: (((new Date()).getHours() * 60 * 60)),
                format: 12,
                step: 15,
                setLabel: 'Set',
                closeLabel: 'Close'
            };
            ionicTimePickerProvider.configTimePicker(timePickerObj);

            $stateProvider

                    .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'MenuCtrl'
                    })

                    .state('app.students', {
                        url: '/students',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/students.html',
                                controller: 'StudentsCtrl'
                            }
                        }
                    })
                    .state('app.attendance', {
                        url: '/attendance',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/attendance.html',
                                controller: 'AttendanceCtrl'
                            }
                        }
                    })
                    .state('app.changepassword', {
                        url: '/changepassword',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/change-password.html',
                                controller: 'changePasswordCtrl'
                            }
                        }
                    })
                    .state('app.main', {
                        url: '/main',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/main.html',
                                controller: 'MainCtrl'
                            }
                        },
                        resolve: {
                            isOnline: function($q, APIService, $rootScope) {
                                $rootScope.$emit('showLoader');
                                console.log('Main resolve');
                                return APIService.isOnline('?action=isOnline').then(function(res){
                                    $rootScope.isAppOnline = true;
                                    $rootScope.$emit('hideLoader');
                                }, function(err){
                                    $rootScope.isAppOnline = false;
                                    $rootScope.$emit('hideLoader');
                                });
                            }
                        }
                    });
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/main');
        });
var app = angular.module('tutionApp');

app.run(function ($ionicPlatform, $rootScope) {
    $rootScope.isAppOnline = false;
    $ionicPlatform.ready(function () {
        (navigator.splashscreen) ? navigator.splashscreen.hide() : null;
        $ionicPlatform.registerBackButtonAction(function (event) {
            event.preventDefault();
        }, 100);
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
    //console.log('Run Block', $rootScope.isAppOnline);
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function (snap) {
        if (snap.val() === true) {
            //console.log("connected");
            $rootScope.isAppOnline = true;
        } else {
            //console.log("not connected");
            $rootScope.isAppOnline = false;
        }
    });
    
});

app.filter('capitalize', function () {
    return function (input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
});

app.controller('MenuCtrl', function ($scope, $timeout, $ionicModal, $firebaseAuth, APIService,
        localStorageService, $state, $ionicHistory, ionicToast) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.authObj = $firebaseAuth();
    $scope.loginData = {email: null, password: null, loginType: 'parent'};
    $scope.data = {resetemail: null};
    $scope.loginError = null;
    $scope.userDetails = null;
    //console.log('MenuCtrl Loaded');

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.loginData = {email: null, password: null, loginType: 'parent'};
        $scope.loginModal.remove().then(function (res) {
            if ($('.modal-backdrop.active').length > 0) {
                $(document.body).removeClass('modal-open');
                $('.modal-backdrop.active').remove();
            }
        });
    };

    $scope.closeResetPassword = function () {
        $scope.resetModal.remove();
    };

    $scope.resetPassword = function () {
        $scope.resetPasswordError = null;
        $scope.resetPasswordSuccess = null;
        
        $ionicModal.fromTemplateUrl('templates/reset-password.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.resetModal = modal;
            $scope.resetModal.show();
        });
    };

    $scope.submitResetPassword = function () {
        $scope.resetPasswordError = null;
        $scope.resetPasswordSuccess = null;
        
        if (!$scope.data.resetemail) {
            $timeout(function () {
                $scope.resetPasswordError = 'Please enter your registered email';
            });
        } else {
            
            APIService.post('?action=resetPassword', $scope.data).then(
            function(response){
                if(response.status === true) {
                    $timeout(function () {
                        //$scope.resetPasswordSuccess = 'We have sent reset mail, Please check your mailbox';
                        ionicToast.show('We have sent reset mail, Please check your mailbox', 'top', true, 2500, 'ionic-success');
                        $scope.closeResetPassword();
                    });
                }
            }, 
            function(error){
                console.log('Reset password error');
                $timeout(function () {
                    $scope.resetPasswordError = null;
                    $scope.resetPasswordSuccess = null;
                    $scope.resetPasswordError = 'Unable to reset password, Please try later.';
                    ionicToast.show('Unable to reset password, Please try later.', 'top', true, 2500, 'ionic-error');
                });
            });
            /*
            firebase.auth().sendPasswordResetEmail($scope.data.resetemail).then(function (res) {
                // Email sent.
                console.log(res);
                $timeout(function () {
                    $scope.resetPasswordError = 'We have sent reset mail, Please check your mailbox';
                });
            }, function (error) {
                // An error happened.
                $timeout(function () {
                    console.log(error);
                    $scope.resetPasswordError = 'Reset password failed';
                });
            });
            */
        }
    };
    // Open the login modal
    $scope.login = function () {
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope,
            animation: 'slide-in-down',
            focusFirstInput: true
        }).then(function (modal) {
            //console.log($scope.loginData);
            $scope.loginModal = modal;
            $scope.loginModal.show();
        });
    };
    
    $scope.$on('modal.removed', function(res) {
    // Execute action
        if($scope.userDetails !== null) {
            $ionicHistory.nextViewOptions({
                historyRoot: true
            });
            $state.go('app.students');
        }
        //$state.go('app.students');
    });

    $scope.logout = function () {
        //localStorageService.remove('userDetails');
        localStorageService.clearAll();
        $scope.loginData = {email: null, password: null, loginType: 'parent'};
        $scope.loginError = null;
        $scope.authObj.$signOut();
        $state.go('app.main');
        $scope.login();

    };
    firebase.auth().onAuthStateChanged(function (user) {
        var userDetail = localStorageService.get('userDetails');
        //console.log('onAuthStateChanged', userDetail, user);
        
        if (!user && userDetail === null) {
            // No user is signed in.
            $scope.login();
            //localStorageService.remove('userDetails');
        } else {
            if (user) {
                $scope.userDetails = user;
                localStorageService.set('userDetails', $scope.userDetails);
            } else {
                $scope.userDetails = userDetail;
            }
            $ionicHistory.nextViewOptions({
                historyRoot: true
            });
            $state.go('app.students');
        }
    });

    $scope.$on('login', function () {
        $scope.login();
    });

    $scope.doLogin = function () {
        //console.log('Doing login', $scope.loginData);
        if ($scope.loginData.email === null || $scope.loginData.password === null ||
                $scope.loginData.email === '' || $scope.loginData.password === '') {
            return $scope.loginError = 'Please enter the valid credentials';
        }
        if ($scope.loginData.loginType === 'parent') {
            $scope.$emit('showLoader');
            var data = {
                username: $scope.loginData.email,
                password: $scope.loginData.password
            };
            APIService.post('?action=validateLogin', data).then(
                    function (response) {
                        $scope.$emit('hideLoader');
                        $scope.userDetails = response.userDetails;
                        localStorageService.set('userDetails', response.userDetails);
                        $timeout(function () {
                            $scope.closeLogin();
                        }, 300);
                    },
                    function (error) {
                        $scope.$emit('hideLoader');
                        //console.log(error);
                        $scope.loginError = 'Authentication failed';
                    });
            return;
        } else {
            $scope.$emit('showLoader');
            $scope.authObj.$signInWithEmailAndPassword($scope.loginData.email, $scope.loginData.password).then(function (firebaseUser) {
                //console.log("Signed in as:", firebaseUser.uid);
                $scope.$emit('hideLoader');
                $timeout(function () {
                    $scope.closeLogin();
                }, 300);
            }, function () {
                $scope.$emit('hideLoader');
                $scope.loginError = 'Invalid Credentials';
            }).catch(function (error) {
                $scope.$emit('hideLoader');
                $scope.loginError = 'Authentication failed';
            });
        }
    };
//    $scope.authObj.$createUserWithEmailAndPassword("xxx@xx.com", "xxxx")
//            .then(function(firebaseUser) {
//                console.log("User " + firebaseUser.uid + " created successfully!");
//            }).catch(function(error) {
//        console.error("Error: ", error);
//    });
});
app.controller('AppCtrl', function ($scope, $ionicLoading) {
    $scope.$on('showLoader', function (e) {
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        }).then(function () {
            //console.log("The loading indicator is now displayed");
        });
    });
    $scope.$on('hideLoader', function (e) {
        $ionicLoading.hide().then(function () {
            //console.log("The loading indicator is now hidden");
        });
    });
});
