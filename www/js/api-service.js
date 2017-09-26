angular.module('tutionApp').factory('APIService', function ($http, $timeout, $q) {
    var basePath = 'https://us-central1-timesheet-f9254.cloudfunctions.net/httpAction';

    function makeRequest(verb, uri, data) {
        var defer = $q.defer();
        verb = verb.toLowerCase();

        //start with the uri
        var httpArgs = [basePath + uri];
        if (verb.match(/post|put/)) {
            httpArgs.push(data);
        }

        $http[verb].apply(null, httpArgs)
                .success(function (data, status) {
                    defer.resolve(data);
                    // update angular's scopes
                    // $rootScope.$$phase || $rootScope.$apply();
                })
                .error(function (data, status) {
                    defer.reject('HTTP Error: ' + status);
                });

        return defer.promise;
    }
    
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    return {
        get: function (uri) {
            return makeRequest('get', uri);
        }
        , post: function (uri, data) {
            return makeRequest('post', uri, data);
        }
        , put: function (uri, data) {
            return makeRequest('put', uri, data);
        }
        , delete: function (uri) {
            return makeRequest('delete', uri);
        }
        , isValidEmail : function(email) {
            return validateEmail(email);
        }
        , isOnline : function(uri) {
            return makeRequest('get', uri);
        }
        
        
    };
});