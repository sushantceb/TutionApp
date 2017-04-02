angular.module('tutionApp')

        .controller('AttendanceCtrl', function($scope, $timeout, $ionicModal) {
            console.log('AttendanceCtrl');
            $scope.myDate = new Date();
            $scope.format = 'HH:mm';
            var attendance = firebase.database().ref('attendance');
            $scope.newStudentAttendance = {};
            $scope.attendanceList = [];
            $scope.selectedDate = null;
            var studentDetails = JSON.parse(sessionStorage.getItem('studentDetails'));
            $scope.formats = [
                'HH:mm'
            ];
            $scope.$emit('showLoader');
            attendance.orderByChild("studentId").equalTo(studentDetails.studentId).once('value', function(snapshot) {
                console.log(snapshot.key);
                snapshot.forEach(function(childSnapshot) {
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        //childData.attendanceId = childKey;
                        //$scope.attendanceList.push(childData);
                        console.log(childKey, childData);

                    });
            });
            attendance.once('value', function(snapshot) {
                console.log(snapshot);
                $timeout(function() {
                    snapshot.forEach(function(childSnapshot) {
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        childData.attendanceId = childKey;
                        $scope.attendanceList.push(childData);

                    });
                    $scope.$emit('hideLoader');
                    console.log($scope.attendanceList);
                    renderCalendar();
                });

            });

            $scope.removeQuotes = function(data) {
                if (typeof data === 'undefined') {
                    return '';
                }
                return data.toDate();
            }
            $scope.AddStudentAttendance = function() {
                $ionicModal.fromTemplateUrl('templates/newAttendance.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.modal = modal;
                    $scope.modal.show();
                });
            };

            $scope.closeNewAttendance = function() {
                $scope.modal.remove();
            }

            function renderCalendar() {
                $('#calendar').fullCalendar({
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month,basicWeek,basicDay'
                    },
                    //defaultDate: 'today',
                    navLinks: true, // can click day/week names to navigate views
                    editable: true,
                    eventLimit: true, // allow "more" link when too many events
                    dayClick: function(date, jsEvent, view) {
                        $scope.selectedDate = date;
                        if ($(this).hasClass('marked')) {
                            $scope.removeStudentAttendance(date);
                        } else {
                            $scope.AddStudentAttendance();
                        }
                        //
//                    alert('Clicked on: ' + date.format());
//
//                    alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
//
//                    alert('Current view: ' + view.name);
//
//                    // change the day's background color just for fun
//                    $(this).css('background-color', 'red');

                    },
                    dayRender: function(date, cell) {
                        //console.log(date.toDate());
                        var day = date.get('year') + '-' + (date.get('month') + 1) + '-' + date.get('date');
                        $scope.attendanceList.forEach(function(v, i) {
                            var eventDay = v.date.year + '-' + v.date.month + '-' + v.date.day;
                            //console.log(eventDay, day);
                            if (day === eventDay) {
                                //console.log(cell.addClass('marked'));
                                cell.addClass('marked');
                                //background-color: #11c1f3;
                                //cell.css("background-color", "red");
                            }
                        });

                        //cell.css("background-color", "red");
                    },
                    events: [
                    ]
                });
                $('#calendar').fullCalendar('today');
            }

            $scope.removeStudentAttendance = function(date) {
                var day = date.get('year') + '-' + (date.get('month') + 1) + '-' + date.get('date');
                $scope.attendanceList.forEach(function(v, i) {
                    var eventDay = v.date.year + '-' + v.date.month + '-' + v.date.day;
                    if (day === eventDay) {
                        var ref = attendance.child(v.attendanceId);
                        console.log(v.attendanceId, ref.remove());

                        ref.remove(function(res) {
                            //var id = ref.key;
                            console.log("removed record with id ", res);
                        });
                    }
                });
            }

            $scope.AddNewStudentAttendance = function() {

                var attendanceObj = {
                    studentId: studentDetails.studentId,
                    date: {
                        year: $scope.selectedDate.year(),
                        month: $scope.selectedDate.month() + 1,
                        day: $scope.selectedDate.date()
                    },
                    startTime: $scope.newStudentAttendance.startTime.stringDate,
                    endTime: $scope.newStudentAttendance.endTime.stringDate
                }

                attendance.push(attendanceObj).then(function(ref) {
                    var id = ref.key;
                    console.log("added record with id " + id);
                    $scope.closeNewAttendance();
                });
            }
        })

        .controller('MainCtrl', function($scope, $timeout) {
            console.log('MainCtrl');
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    //User is signed in.
                    var userDetails = {
                        name: user.displayName,
                        email: user.email
                    }
                    $timeout(function() {
                        $scope.userDetails = userDetails;
                    })
                }
            });
        })

        .controller('StudentsCtrl', function($scope, $ionicModal, $state, $timeout) {
            console.log('StudentsCtrl');
            $scope.newstudent = {};
            var students = firebase.database().ref('students');
            //console.log(students, firebase.database().ref());
            $scope.students = [];

            $scope.$emit('showLoader');
            students.once('value', function(snapshot) {
                console.log(snapshot);
                $timeout(function() {
                    snapshot.forEach(function(childSnapshot) {
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        childData.studentId = childKey;
                        $scope.students.push(childData);
                        $scope.$emit('hideLoader');
                    });
                    console.log($scope.students);
                });

            });
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
                })
            };

            $scope.closeNewStudent = function() {
                $scope.modal.remove();
            };

            $scope.goToStudentAttendanceView = function(student) {
                sessionStorage.setItem('studentDetails', JSON.stringify(student));
                $state.go('app.attendance');
            }

        })
