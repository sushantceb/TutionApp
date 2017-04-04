angular.module('tutionApp').controller('StudentsCtrl', function($scope, $ionicModal, $state, $timeout) {
  console.log('StudentsCtrl');
  $scope.newstudent = {};
  var students = firebase.database().ref('students');
  $scope.students = [];
  $scope.$emit('showLoader');
  $scope.loadAllStudents = function() {
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
    console.log($scope.newstudent);
    // Start using the collection
    students.push($scope.newstudent).then(function(ref) {
      var id = ref.key;
      console.log("added record with id " + id);
      $scope.closeNewStudent();
      $scope.loadAllStudents();
    });
  };
  $scope.closeNewStudent = function() {
    $scope.modal.remove();
  };
  $scope.goToStudentAttendanceView = function(student) {
    sessionStorage.setItem('studentDetails', JSON.stringify(student));
    $state.go('app.attendance');
  };
  
  $scope.loadAllStudents();

});