angular.module('tutionApp')

        .controller('AttendanceCtrl', function($scope, $ionicModal) {
            console.log('AttendanceCtrl');
            $scope.myDate = null;
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
            
            $scope.playlists = [
                {title: 'Reggae', id: 1},
                {title: 'Chill', id: 2},
                {title: 'Dubstep', id: 3},
                {title: 'Indie', id: 4},
                {title: 'Rap', id: 5},
                {title: 'Cowbell', id: 6}
            ];

            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay'
                },
                defaultDate: '2017-03-12',
                navLinks: true, // can click day/week names to navigate views
                editable: true,
                eventLimit: true, // allow "more" link when too many events
                dayClick: function(date, jsEvent, view) {
                    $scope.AddStudentAttendance();
//                    alert('Clicked on: ' + date.format());
//
//                    alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
//
//                    alert('Current view: ' + view.name);
//
//                    // change the day's background color just for fun
//                    $(this).css('background-color', 'red');

                },
                events: [
                    {
                        title: 'All Day Event',
                        start: '2017-03-01'
                    },
                    {
                        title: 'Long Event',
                        start: '2017-03-07',
                        end: '2017-03-10'
                    },
                    {
                        id: 999,
                        title: 'Repeating Event',
                        start: '2017-03-09T16:00:00'
                    },
                    {
                        id: 999,
                        title: 'Repeating Event',
                        start: '2017-03-16T16:00:00'
                    },
                    {
                        title: 'Conference',
                        start: '2017-03-11',
                        end: '2017-03-13'
                    },
                    {
                        title: 'Meeting',
                        start: '2017-03-12T10:30:00',
                        end: '2017-03-12T12:30:00'
                    },
                    {
                        title: 'Lunch',
                        start: '2017-03-12T12:00:00'
                    },
                    {
                        title: 'Meeting',
                        start: '2017-03-12T14:30:00'
                    },
                    {
                        title: 'Happy Hour',
                        start: '2017-03-12T17:30:00'
                    },
                    {
                        title: 'Dinner',
                        start: '2017-03-12T20:00:00'
                    },
                    {
                        title: 'Birthday Party',
                        start: '2017-03-13T07:00:00'
                    },
                    {
                        title: 'Click for Google',
                        url: 'http://google.com/',
                        start: '2017-03-28'
                    }
                ]
            });
        })

        .controller('MainCtrl', function($scope, $ionicUser) {
            console.log('MainCtrl');
            $scope.userDetails = $ionicUser.details;
        })

        .controller('StudentsCtrl', function($scope, $ionicModal, $ionicDB, $state) {
            console.log('StudentsCtrl');
            $ionicDB.connect();
            $scope.newstudent = {};
            $scope.students = [];
            var students = $ionicDB.collection('students');

            $scope.$emit('showLoader');

            students.fetch().subscribe(function(students) {
                $scope.students = students;
                console.log(students);
                $scope.$emit('hideLoader');
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
                students.store($scope.newstudent);
            };
            
            $scope.closeNewStudent = function() {
                $scope.modal.remove();
            };

            $scope.goToStudentAttendanceView = function(student) {
                // #/app/attendance

                //console.log(student);
                $state.go('app.attendance');
            }

        })
