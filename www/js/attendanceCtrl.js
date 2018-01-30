angular.module('tutionApp').controller('AttendanceCtrl', function ($scope, $timeout,
        $ionicModal, $ionicPopup, $state, $ionicHistory, ionicTimePicker,
        localStorageService, APIService, firebaseService, ionicToast, $filter) {
    console.log('AttendanceCtrl');
    Date.prototype.getUnixTime = function () {
        return this.getTime() / 1000 | 0
    };
    $scope.myDate = new Date();
    $scope.format = 'HH:mm';
    var attendance = firebase.database().ref('students');
    $scope.userDetails = null;
    $scope.newStudentAttendance = {};
    $scope.attendanceList = [];
    $scope.selectedDate = null;
    $scope.selectedEpocTime = 0;
    $scope.shownItem = null;
    $scope.totalHoursInSelectedMonth = null;
    $scope.calendarCurrentMonth = -1;
    $scope.selectedPaymentDates = [];
    $scope.editStudent = {};

    $scope.$on("$ionicView.enter", function (scopes, states) {
        $scope.userDetails = localStorageService.get('userDetails');
        if ($scope.userDetails === null) {
            return $state.go('app.main');
        }
        var studentDetails = localStorageService.get('studentDetails');
        $scope.studentDetails = studentDetails;
        $scope.loadStudentAttendance();
    });
    $scope.formats = [
        'HH:mm'
    ];

    $scope.markPaymentDates = function () {
        //console.log($scope.selectedPaymentDates);
        // return true;
        var totalPaymentDates = $scope.selectedPaymentDates.length;
        $scope.selectedPaymentDates.forEach(function (v, i) {
            console.log(v.payment);
            var ref = attendance.child($scope.studentDetails.studentId + '/attendance').child(v.attendanceId);
            // console.log(ref);

            ref.update({
                payment: true
            });
            if (i === (totalPaymentDates - 1)) {
                $scope.closeStudentPayment();
                $scope.loadStudentAttendance();
            }
        });
    };

    $scope.openPaymentModal = function () {
        $scope.dateList = [];
        $scope.payment = {selectedDate: []};

        $scope.attendanceList.forEach(function (v, i) {
            console.log($scope.calendarCurrentMonth, v.date.month);
            if ($scope.calendarCurrentMonth === v.date.month) {
                if (typeof v.payment !== 'undefined' && v.payment === false) {
                    var dtObj = new Date(v.date.year, v.date.month - 1, v.date.day);
                    v.markedAttendanceDate = dtObj;
                    v.attendanceTimestamp = dtObj.getUnixTime();
                    console.log(dtObj.getUnixTime());
                    $scope.dateList.push(v);
                }
            }
        });
        $ionicModal.fromTemplateUrl('templates/student-payment.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.studentPaymentModal = modal;
            $scope.studentPaymentModal.show();
        });
    };

    $scope.updateSelection = function (index, list, item) {
        //console.log(index, list, item);
        $scope.selectedPaymentDates = $filter('filter')(list, {checked: true});
    };

    $scope.closeStudentPayment = function () {
        $scope.studentPaymentModal.remove();
    };

    $scope.editStudentModal = function () {
        $scope.editStudent = $scope.studentDetails;
        $ionicModal.fromTemplateUrl('templates/edit-student.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.editStudentmodal = modal;
            $scope.editStudentmodal.show();
        });
    };

    $scope.closeEditStudent = function () {
        $scope.editStudentmodal.remove();
    };

    $scope.submitEditStudent = function () {
        $scope.editStudentError = null;
        if (
                angular.equals({}, $scope.editStudent) ||
                !$scope.editStudent.name ||
                ($scope.editStudent.name === '') ||
                !$scope.editStudent.parentName ||
                ($scope.editStudent.parentName === '') ||
                !$scope.editStudent.parentEmail ||
                ($scope.editStudent.parentEmail === '') ||
                !$scope.editStudent.contactNo ||
                ($scope.editStudent.contactNo === '') ||
                !$scope.editStudent.gender ||
                ($scope.editStudent.gender === '') ||
                !$scope.editStudent.address ||
                ($scope.editStudent.address === '')
                ) {
            $scope.editStudentError = 'Please fill all the details';
            return;
        }
        if (APIService.isValidEmail($scope.editStudent.parentEmail)) {
            var updatedStudentDetails = JSON.parse(angular.toJson($scope.editStudent));
            delete updatedStudentDetails.attendance;

            attendance.child($scope.studentDetails.studentId).update(updatedStudentDetails).then(function (res) {
                $scope.closeEditStudent();
            });
        } else {
            return $scope.editStudentError = 'Please enter valid email';
        }
    };

    $scope.loadStudentAttendance = function () {
        $scope.$emit('showLoader');
        $scope.attendanceList = [];
        firebaseService.getStudentAttendance($scope.studentDetails.studentId).then(function (response) {
            $scope.$emit('hideLoader');
            $scope.$broadcast('scroll.refreshComplete');
            $scope.attendanceList = response;
            //console.log($scope.attendanceList);
            /*
             $scope.attendanceList.forEach(function (v, i) {
             console.log(v.payment);
             if(typeof v.payment === 'undefined') {
             var ref = attendance.child($scope.studentDetails.studentId + '/attendance').child(v.attendanceId);
             // console.log(ref);

             ref.update({
             payment: false
             });
             }
             });
             /*

             */
            renderCalendar();
        }, function (error) {
            console.log('Error in attendance');
            $scope.$emit('hideLoader');
            $scope.$broadcast('scroll.refreshComplete');
        });
        return;
    };

    $scope.showAttendanceDeleteConfirm = function () {
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
                    onTap: function (e) {
                        $scope.removeStudentAttendance($scope.selectedDate);
                    }
                }
            ]
        });
    };

    $scope.calculateTotalHoursInCurrentMonth = function (selectedMonth) {
        $scope.totalHoursInSelectedMonth = null;
        var totalMins = 0;
        var totalPaidMins = 0;
        $scope.attendanceList.forEach(function (v, i) {
            if (selectedMonth === v.date.month) {
                var startTimeSplitted = v.startTime.split(':');
                var endTimeSplitted = v.endTime.split(':');
                var hours = parseInt(endTimeSplitted[0]) - parseInt(startTimeSplitted[0]);
                var startMin = parseInt(startTimeSplitted[1]);
                var endMin = parseInt(endTimeSplitted[1]);
                if (startMin > endMin) {
                    totalMins += ((hours - 1) * 60) + ((endMin + 60) - startMin);
                    if(v.payment === true) {
                      totalPaidMins += ((hours - 1) * 60) + ((endMin + 60) - startMin);
                    }
                } else {
                    totalMins += (hours * 60) + (endMin - startMin);
                    if(v.payment === true) {
                      totalPaidMins += (hours * 60) + (endMin - startMin);
                    }
                }

                //console.log(hours, startMin, endMin);
            }
        });
        $scope.totalHoursInSelectedMonth = Math.floor(totalMins / 60) + ' Hrs and ' + (totalMins % 60) + ' Mins';
        $scope.totalPaidHoursInSelectedMonth = Math.floor(totalPaidMins / 60) + ' Hrs and ' + (totalPaidMins % 60) + ' Mins';
        //console.log(totalMins / 60, totalMins % 60);
        //moment.duration(totalHours, 'hours');
    };

    $scope.showStartTimePicker = function () {
        var ipObj1 = {
            callback: function (val) {      //Mandatory
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    $scope.selectedEpocTime = val;
                    var selectedTime = new Date(val * 1000);
                    $scope.newStudentAttendance.startTime = ("0" + selectedTime.getUTCHours()).slice(-2) + ':' + ("0" + selectedTime.getUTCMinutes()).slice(-2);
                    $scope.newStudentAttendance.startTimeAmPm = (selectedTime.getUTCHours() >= 12) ? ' PM' : ' AM';
                    //console.log($scope.newStudentAttendance.startTime, 'Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');

                    var selectedEndTime = new Date((val + 60 * 60) * 1000);
                    $scope.newStudentAttendance.endTime = ("0" + selectedEndTime.getUTCHours()).slice(-2) + ':' + ("0" + selectedEndTime.getUTCMinutes()).slice(-2);
                    $scope.newStudentAttendance.endTimeAmPm = (selectedEndTime.getUTCHours() >= 12) ? ' PM' : ' AM';

                }
            }
        };

        ionicTimePicker.openTimePicker(ipObj1);
    };

    $scope.showEndTimePicker = function () {
        var ipObj1 = {
            inputTime: $scope.selectedEpocTime + 60 * 60,
            callback: function (val) {      //Mandatory
                if (typeof (val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000);
                    $scope.newStudentAttendance.endTime = ("0" + selectedTime.getUTCHours()).slice(-2) + ':' + ("0" + selectedTime.getUTCMinutes()).slice(-2);
                    $scope.newStudentAttendance.endTimeAmPm = (selectedTime.getUTCHours() >= 12) ? ' PM' : ' AM';
                    console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                }
            }
        };

        ionicTimePicker.openTimePicker(ipObj1);
    };

    $scope.AddStudentAttendance = function () {
        $scope.newStudentAttendance.startTime = null;
        $scope.newStudentAttendance.startTimeAmPm = null;
        $scope.newStudentAttendance.endTime = null;
        $scope.newStudentAttendance.endTimeAmPm = null;
        $ionicModal.fromTemplateUrl('templates/newAttendance.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.closeNewAttendance = function () {
        $scope.modal.remove();
    };

    $scope.toggleItem = function (item) {
        if ($scope.isItemShown(item)) {
            $scope.shownItem = null;
        } else {
            $scope.shownItem = item;
        }
    };
    $scope.isItemShown = function (item) {
        return $scope.shownItem === item;
    };

    function renderCalendar() {
        $('#calendar').fullCalendar('destroy');
        $('#calendar').fullCalendar({
            header: {
                left: 'prev next',
                center: 'title',
                right: 'today'
            },
            height: 350,
            navLinks: false, // can click day/week names to navigate views
            editable: true,
            showNonCurrentDates: false,
            //eventLimit: true, // allow "more" link when too many events
            dayClick: function (date, jsEvent, view) {
                console.log('day clicked');
                if (typeof $scope.userDetails.studentId !== 'undefined') {
                    return false;
                }
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
            calendarRendered: function (view) {
                $timeout(function () {
                    $scope.calendarCurrentMonth = view.currentDate.month() + 1;
                    $scope.calculateTotalHoursInCurrentMonth(view.currentDate.month() + 1);
                });
            },
            dayRender: function (date, cell) {
                var day = date.get('year') + '-' + (date.get('month') + 1) + '-' + date.get('date');

                $scope.attendanceList.forEach(function (v, i) {
                    var eventDay = v.date.year + '-' + v.date.month + '-' + v.date.day;
                    if (day === eventDay) {
                        cell.addClass('marked'); //cell.css("background-color", "red");
                        if (v.payment === true) {
                            cell.addClass('payment'); //cell.css("background-color", "red");
                        }
                        var a = moment(v.startTime, 'HH:mm');
                        var b = moment(v.endTime, 'HH:mm');
                        var diff = (b.diff(a, 'minutes', true) / 60);
                        cell.html(diff + ' Hrs');
                    }
                });
            },
            events: [
            ]
        });
        $('#calendar').fullCalendar('today');
    }


    $scope.removeStudentAttendance = function (date) {
        var day = date.get('year') + '-' + (date.get('month') + 1) + '-' + date.get('date');
        $scope.attendanceList.forEach(function (v, i) {
            var eventDay = v.date.year + '-' + v.date.month + '-' + v.date.day;
            if (day === eventDay) {
                var ref = attendance.child($scope.studentDetails.studentId + '/attendance').child(v.attendanceId);
                ref.remove(function (res) {
                    ionicToast.show('Attendance Deleted', 'top', false, 2500, 'ionic-success');
                    //console.log("removed record with id ", res);
                    $scope.loadStudentAttendance();
                });
            }
        });
    };

    $scope.removeStudentConfirm = function () {
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
                    onTap: function (e) {
                        $scope.removeStudent();
                    }
                }
            ]
        });
    };


    $scope.removeStudent = function () {
        var student = firebase.database().ref('students');
        var ref = student.child($scope.studentDetails.studentId);
        ref.remove(function (res) {
            //console.log("removed student with id ", res);
            ionicToast.show('Student Deleted', 'top', false, 2500, 'ionic-success');
            sessionStorage.removeItem('studentDetails');
            $ionicHistory.nextViewOptions({
                historyRoot: true
            });
            $state.go('app.students');
        });
    }

    $scope.AddNewStudentAttendance = function () {

        var attendanceObj = {
            studentId: $scope.studentDetails.studentId,
            date: {
                year: $scope.selectedDate.year(),
                month: $scope.selectedDate.month() + 1,
                day: $scope.selectedDate.date()
            },
            startTime: $scope.newStudentAttendance.startTime,
            endTime: $scope.newStudentAttendance.endTime,
            payment: false
        }
        var isDuplicate = false;
        $scope.attendanceList.forEach(function (v, i) {
             if(angular.equals(v.date, attendanceObj.date)) {
                 isDuplicate = true;
             }
        });
        if(isDuplicate === true) {
            return ionicToast.show('Attendance already exist, Delete the existing', 'top', false, 5000, 'ionic-error');
        }
        attendance.child($scope.studentDetails.studentId + '/attendance').push(attendanceObj).then(function (ref) {
            var id = ref.key;
            ionicToast.show('Attendance Added', 'top', true, 2500, 'ionic-success');
            //console.log("added record with id " + id);
            $scope.closeNewAttendance();
            $scope.loadStudentAttendance();
        });
    };
});
