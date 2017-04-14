angular.module('tutionApp').controller('StudentsCtrl', function($scope, $ionicModal, $state,
  $timeout, $ionicHistory) {
  console.log('StudentsCtrl');
  $scope.newstudent = {};
  $scope.newStudentError = null;
  var students = firebase.database().ref('students');
  $scope.students = [];
  
  $scope.loadAllStudents = function() {
    $scope.$emit('showLoader');
    $scope.students = [];
    students.once('value', function(snapshot) {
      $timeout(function() {
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
          var childData = childSnapshot.val();
          childData.studentId = childKey;
          $scope.students.push(childData);
          $scope.$emit('hideLoader');
        });
        $scope.$broadcast('scroll.refreshComplete');
      });
    });
  }

  $scope.AddStudentModal = function() {
    $ionicModal.fromTemplateUrl('templates/newStudent.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };
  
  $scope.AddNewStudent = function() {
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

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Start using the collection
    students.push($scope.newstudent).then(function(ref) {
      var id = ref.key;
      //console.log("added record with id " + id);
      $scope.newStudentError = null;
      $scope.closeNewStudent();
      $scope.loadAllStudents();
    });
  };
  $scope.closeNewStudent = function() {
    $scope.newStudentError = null;
    $scope.newstudent = {};
    $scope.modal.remove();
  };
  $scope.goToStudentAttendanceView = function(student) {
    sessionStorage.setItem('studentDetails', JSON.stringify(student));
    $ionicHistory.nextViewOptions({
      historyRoot: true
    });
    $state.go('app.attendance');
  };

  $scope.$on("$ionicView.enter", function(scopes, states) {
    sessionStorage.removeItem('studentDetails');
    $scope.loadAllStudents();
  });
  

});