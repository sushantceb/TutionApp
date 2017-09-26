angular.module('tutionApp').factory('firebaseService', function (localStorageService, $q, $rootScope) {
    var studentRef = firebase.database().ref('students');
    
    function getStudentList(studentId) {
        var list = [];
        var defer = $q.defer();
        if ($rootScope.isAppOnline) {
            if(typeof studentId === 'undefined') {
                studentRef.once('value', function(snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        childData.studentId = childKey;
                        list.push(childData);
                    });
                    localStorageService.set('studentList', list);
                    defer.resolve(list);
                });
            } else {
                studentRef.orderByKey().equalTo(studentId).once('value', function(snapshot) {
                    snapshot.forEach(function (childSnapshot) {
                        
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        childData.studentId = childKey;
                        list.push(childData);
                    });
                    localStorageService.set('studentList', list);
                    defer.resolve(list);
                });
            }
        } else {
            defer.resolve(localStorageService.get('studentList'));
        }
        return defer.promise;
    }
    
    function getStudentAttendance(studentId) {
        var defer = $q.defer();
        var list = [];
        if ($rootScope.isAppOnline) {
            studentRef.child(studentId + '/attendance').once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    childData.attendanceId = childKey;
                    list.push(childData);
                });
                localStorageService.set('studentAttendance-'+studentId, list);
                defer.resolve(list);
            });
        } else {
            var data = localStorageService.get('studentAttendance-'+studentId);
            if(data !== null) {
                defer.resolve(data);
            } else {
                defer.resolve([]);
            }
        }
        return defer.promise;
    }
    
    return {
        getStudentList: getStudentList,
        getStudentAttendance: getStudentAttendance
    };
});

