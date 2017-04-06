angular.module('tutionApp').controller('AttendanceCtrl', function($scope, $timeout,
        $ionicModal, $ionicPopup, $state, $ionicHistory, ionicTimePicker) {
    console.log('AttendanceCtrl');
    $scope.myDate = new Date();
    $scope.format = 'HH:mm';
    var attendance = firebase.database().ref('attendance');
    $scope.newStudentAttendance = {};
    $scope.attendanceList = [];
    $scope.selectedDate = null;

    $scope.$on("$ionicView.enter", function(scopes, states) {
        var studentDetails = JSON.parse(sessionStorage.getItem('studentDetails'));
        $scope.studentDetails = studentDetails;
        $scope.loadStudentAttendance();
    });
    $scope.formats = [
        'HH:mm'
    ];

    $scope.loadStudentAttendance = function() {
        $scope.$emit('showLoader');
        $scope.attendanceList = [];
        attendance.orderByChild("studentId").equalTo($scope.studentDetails.studentId).once('value', function(snapshot) {
            $timeout(function() {
                snapshot.forEach(function(childSnapshot) {
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    childData.attendanceId = childKey;
                    $scope.attendanceList.push(childData);
                });
                $scope.$emit('hideLoader');
                $scope.$broadcast('scroll.refreshComplete');
                console.log($scope.attendanceList);
                renderCalendar();
            });
        });
    }

    $scope.showAttendanceDeleteConfirm = function() {
        $ionicPopup.show({
            title: 'Attendance Delete',
            template: 'Are you sure you want to delete?',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    type: 'button-dark'
                },
                {
                    text: '<b>Delete</b>',
                    type: 'button-assertive',
                    onTap: function(e) {
                        $scope.removeStudentAttendance($scope.selectedDate);
                    }
                }
            ]
        });
    };

    $scope.showStartTimePicker = function() {
        var ipObj1 = {
            callback: function(val) {      //Mandatory
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000);
                    $scope.newStudentAttendance.startTime = ("0" + selectedTime.getUTCHours()).slice(-2) + ':' + ("0" + selectedTime.getUTCMinutes()).slice(-2);
                    $scope.newStudentAttendance.startTimeAmPm = (selectedTime.getUTCHours() >= 12 ) ? ' PM' : ' AM';
                    console.log($scope.newStudentAttendance.startTime, 'Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                }
            }
        };

        ionicTimePicker.openTimePicker(ipObj1);
    }
    
    $scope.showEndTimePicker = function() {
        var ipObj1 = {
            callback: function(val) {      //Mandatory
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000);
                    $scope.newStudentAttendance.endTime = ("0" + selectedTime.getUTCHours()).slice(-2) + ':' + ("0" + selectedTime.getUTCMinutes()).slice(-2);
                    $scope.newStudentAttendance.endTimeAmPm = (selectedTime.getUTCHours() >= 12 ) ? ' PM' : ' AM';
                    console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                }
            }
        };

        ionicTimePicker.openTimePicker(ipObj1);
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
    };

    function renderCalendar() {
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,basicWeek,basicDay'
            },
            navLinks: true, // can click day/week names to navigate views
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            dayClick: function(date, jsEvent, view) {
                $scope.selectedDate = date;
                if ($(this).hasClass('marked')) {
                    $scope.showAttendanceDeleteConfirm();
                } else {
                    $scope.AddStudentAttendance();
                }
                //alert('Clicked on: ' + date.format());
                //alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
                //alert('Current view: ' + view.name);
                //change the day's background color just for fun
                //$(this).css('background-color', 'red');
            },
            dayRender: function(date, cell) {
                var day = date.get('year') + '-' + (date.get('month') + 1) + '-' + date.get('date');
                $scope.attendanceList.forEach(function(v, i) {
                    var eventDay = v.date.year + '-' + v.date.month + '-' + v.date.day;
                    if (day === eventDay) {
                        cell.addClass('marked'); //cell.css("background-color", "red");
                    }
                });
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
                ref.remove(function(res) {
                    //console.log("removed record with id ", res);
                    $scope.loadStudentAttendance();
                });
            }
        });
    };

    $scope.removeStudentConfirm = function() {
        $ionicPopup.show({
            title: 'Alert',
            template: 'Are you sure you want to delete?',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    type: 'button-dark'
                },
                {
                    text: '<b>Delete</b>',
                    type: 'button-assertive',
                    onTap: function(e) {
                        $scope.removeStudent();
                    }
                }
            ]
        });
    };


    $scope.removeStudent = function() {
        var student = firebase.database().ref('students');
        var ref = student.child($scope.studentDetails.studentId);
        ref.remove(function(res) {
            //console.log("removed student with id ", res);
            sessionStorage.removeItem('studentDetails');
            $ionicHistory.nextViewOptions({
                historyRoot: true
            });
            $state.go('app.students');
        });
    }

    $scope.AddNewStudentAttendance = function() {

        var attendanceObj = {
            studentId: $scope.studentDetails.studentId,
            date: {
                year: $scope.selectedDate.year(),
                month: $scope.selectedDate.month() + 1,
                day: $scope.selectedDate.date()
            },
            startTime: $scope.newStudentAttendance.startTime,
            endTime: $scope.newStudentAttendance.endTime
        }

        attendance.push(attendanceObj).then(function(ref) {
            var id = ref.key;
            //console.log("added record with id " + id);
            $scope.closeNewAttendance();
            $scope.loadStudentAttendance();
        });
    };
});