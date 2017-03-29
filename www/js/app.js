// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('tutionApp', ['ionic', 'ionic.cloud', 'wingify.timePicker', 'moment-picker'])

        .run(function($ionicPlatform, $ionicAuth) {
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
        })

        .config(function($stateProvider, $urlRouterProvider, $ionicCloudProvider) {

            $ionicCloudProvider.init({
                core: {
                    "app_id": "32c84c7c"
                },
                insights: {
                    enabled: true
                }
            });
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

app.controller('MenuCtrl', function($scope, $timeout, $ionicModal, $ionicAuth) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.loginData = {email:null, password: null};
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
        $ionicAuth.logout();
        $scope.loginData = {email:null, password: null};
        $scope.loginError = null;
        $scope.login();
        
    };
    console.log($ionicAuth.isAuthenticated());
    if (!$ionicAuth.isAuthenticated()) {
        // $ionicUser is not authenticated!
        $scope.login();
    }
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);
        if($scope.loginData.email === null || $scope.loginData.password === null || 
                $scope.loginData.email === '' || $scope.loginData.password === '') {
            $scope.loginError = 'Please fill the form';
        }

        $ionicAuth.login('basic', $scope.loginData).then(function(response) {
            $timeout(function() {
                $scope.closeLogin();
            }, 0);
        }, function(err) {
            console.log(err);
        });
    };
});
app.controller('AppCtrl', function($scope, $ionicUser) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    //console.log('App', $ionicUser);
    $scope.$on('showLoader', function(e){
       $scope.showLoader = true; 
    });
    $scope.$on('hideLoader', function(e){
       $scope.showLoader = false; 
    });
});
