// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('tutionApp', ['ionic', 'moment-picker', 'firebase', 'ionic-timepicker'])
        .config(function($stateProvider, $urlRouterProvider, ionicTimePickerProvider) {
            var config = {
                apiKey: "AIzaSyB0jOp9Vo2y9vw0bb3bBSil3OQCB16Uelw",
                authDomain: "timesheet-f9254.firebaseapp.com",
                databaseURL: "https://timesheet-f9254.firebaseio.com",
                projectId: "timesheet-f9254",
                storageBucket: "timesheet-f9254.appspot.com",
                messagingSenderId: "1031789189495"
            };
            var timePickerObj = {
                inputTime: (((new Date()).getHours() * 60 * 60)),
                format: 24,
                step: 15,
                setLabel: 'Set',
                closeLabel: 'Close'
            };
            ionicTimePickerProvider.configTimePicker(timePickerObj);
//            momentPickerProvider.options({
//                hoursFormat:   'HH:[00]',
//                minutesStep:   15,
//                //autoclose: true
//            });
            firebase.initializeApp(config);
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

                    .state('app.main', {
                        url: '/main',
                        views: {
                            'menuContent': {
                                templateUrl: 'templates/main.html',
                                controller: 'MainCtrl'
                            }
                        }
                    });
            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/main');
        });
var app = angular.module('tutionApp');

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
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
});

app.filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

app.controller('MenuCtrl', function($scope, $timeout, $ionicModal, $firebaseAuth, $firebaseArray, $state) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.authObj = $firebaseAuth();
    $scope.loginData = {email: null, password: null};
    $scope.loginError = null;
    console.log('Menu');

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.logout = function() {
        $scope.authObj.$signOut();
        $scope.loginData = {email: null, password: null};
        $scope.loginError = null;
        $scope.login();

    };
    firebase.auth().onAuthStateChanged(function(user) {
        //console.log(user);
        if (!user) {
            // No user is signed in.
            $scope.login();
        } else {
            $scope.userDetails = user;
        }
    });

    $scope.doLogin = function() {
        //console.log('Doing login', $scope.loginData);
        if ($scope.loginData.email === null || $scope.loginData.password === null ||
                $scope.loginData.email === '' || $scope.loginData.password === '') {
            $scope.loginError = 'Please fill the form';
        }
        $scope.authObj.$signInWithEmailAndPassword($scope.loginData.email, $scope.loginData.password).then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $timeout(function() {
                $scope.closeLogin();
            }, 300);
        }).catch(function(error) {
            console.error("Authentication failed:", error);
        });

//        $ionicAuth.login('basic', $scope.loginData).then(function(response) {
//            $timeout(function() {
//                $scope.closeLogin();
//            }, 0);
//        }, function(err) {
//            console.log(err);
//        });
    };
//    $scope.authObj.$createUserWithEmailAndPassword("prasad.sonam86@gmail.com", "Harshit@14")
//            .then(function(firebaseUser) {
//                console.log("User " + firebaseUser.uid + " created successfully!");
//            }).catch(function(error) {
//        console.error("Error: ", error);
//    });
});
app.controller('AppCtrl', function($scope, $ionicLoading) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    //console.log('App', $ionicUser);
    $scope.$on('showLoader', function(e) {
        //$scope.showLoader = true;
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        }).then(function() {
            //console.log("The loading indicator is now displayed");
        });
    });
    $scope.$on('hideLoader', function(e) {
        //$scope.showLoader = false;
        $ionicLoading.hide().then(function() {
            //console.log("The loading indicator is now hidden");
        });
    });

    $scope.hideLoading = function() {

    };
});
