angular.module('tutionApp').controller('StudentsCtrl', function ($scope, $ionicModal, $state,
        $timeout, $ionicHistory, $firebaseAuth, localStorageService, APIService, ionicToast, 
        firebaseService) {
    console.log('StudentsCtrl');
    $scope.newstudent = {};
    $scope.newStudentError = null;
    $scope.isAdmin = false;
    var authObj = $firebaseAuth();
    var userDetails = null;
    var students = firebase.database().ref('students');
    
    $scope.$on("$ionicView.enter", function (scopes, states) {
        $scope.isAdmin = false;
        
        userDetails = localStorageService.get('userDetails');
        //console.log('Student View Enter', userDetails);
        $scope.students = [];
        if (userDetails === null) {
            $state.go('app.main');
        } else {
            //console.log(typeof userDetails.studentId,typeof userDetails.studentId === 'undefined');
            if (typeof userDetails.studentId === 'undefined') {
                //console.log('Making admin');
                $scope.isAdmin = true;
            }
            $scope.loadAllStudents();
        }
    });
    
    
    $scope.loadAllStudents = function () {
        $scope.$emit('showLoader');
        $scope.students = [];
        var student_id; 
        
        if (!$scope.isAdmin) {
            student_id = userDetails.studentId;
        }
        //console.log('Student loadall is admin', $scope.isAdmin, student_id, userDetails.studentId);
        firebaseService.getStudentList(student_id).then(function(response){
            //console.log('getStudentList response', response);
            $scope.students = response;
            $scope.$emit('hideLoader');
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.AddStudentModal = function () {
        $ionicModal.fromTemplateUrl('templates/newStudent.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.$on('$destroy', function () {
        if($scope.modal) {
            $scope.modal.remove();
        }
    });


    $scope.AddNewStudent = function () {
        if (
                angular.equals({}, $scope.newstudent) ||
                !$scope.newstudent.name ||
                ($scope.newstudent.name === '') ||
                !$scope.newstudent.parentName ||
                ($scope.newstudent.parentName === '') ||
                !$scope.newstudent.parentEmail ||
                ($scope.newstudent.parentEmail === '') ||
                !$scope.newstudent.contactNo ||
                ($scope.newstudent.contactNo === '') ||
                !$scope.newstudent.gender ||
                ($scope.newstudent.gender === '') ||
                !$scope.newstudent.address ||
                ($scope.newstudent.address === '')
                ) {
            $scope.newStudentError = 'Please fill all the details';
            return;
        }
        if (!APIService.isValidEmail($scope.newstudent.parentEmail)) {
            return $scope.newStudentError = 'Please enter valid email';
        }
        $scope.newstudent.password = $scope.newstudent.contactNo;
        // Start using the collection
        students.push($scope.newstudent).then(function (ref) {
            var id = ref.key;
            console.log("added record with id " + id);
//            $scope.authObj.$createUserWithEmailAndPassword($scope.newstudent.parentEmail, $scope.newstudent.contactNo)
//                    .then(function (firebaseUser) {
//                        console.log("User " + firebaseUser.uid + " created successfully!");
//                    }).catch(function (error) {
//                console.error("Error: ", error);
//            });
            ionicToast.show('Added New Student', 'top', false, 2500, 'ionic-success');
            $scope.newStudentError = null;
            $scope.closeNewStudent();
            $scope.loadAllStudents();
        });
    };
    $scope.closeNewStudent = function () {
        $scope.newStudentError = null;
        $scope.newstudent = {};
        $scope.modal.remove();
    };
    $scope.goToStudentAttendanceView = function (student) {
        //sessionStorage.setItem('studentDetails', JSON.stringify(student));
        localStorageService.set('studentDetails', student);
        $ionicHistory.nextViewOptions({
            historyRoot: true
        });
        $state.go('app.attendance');
    };
});