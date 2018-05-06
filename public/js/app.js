const app = angular.module('MyApp',['ngRoute']);

app.config(function($routeProvider){
    $routeProvider.when('/',{
        templateUrl: 'views/homepage.html',
        controller: 'homePage'
    });
    $routeProvider.when('/user/:token/:name',{
        templateUrl:'views/userview.html',
        controller:'userView'
    })
    $routeProvider.when('/data/:token/:name',{
        templateUrl:'views/dataview.html',
        controller:'dataView'
    })
     $routeProvider.when('/hospital',{
        templateUrl: 'views/hospitalsearch.html',
        controller: 'hospitalSearch'
    });
});

app.controller('homePage',function($scope,$location,$http,$rootScope){
    
    $rootScope.showcontact = function(){
        document.querySelector('#contactus').style.display='block';
    }
    
    $rootScope.closecontact = function(){
        document.querySelector('#contactus').style.display='none';
    }
    
    $rootScope.showabout = function(){
        document.querySelector('#aboutus').style.display = 'block';
    }
    
    $rootScope.closeabout = function(){
        document.querySelector('#aboutus').style.display = 'none';
    }
    
    $rootScope.title = 'Homepage';
     $scope.submitForm = function(){
         console.log($scope.user)
         $http({
             url:'/api/registration',
             method:'POST',
             data:$scope.user
         }).then(function(response){
             console.log(response);
             if(response.data.success === true)
                 {
                     document.querySelector('#congomodal').style.display = "block";
                     $scope.userPage = function(){
                         var name = response.data.name
                         var token = response.data.token;
                        $location.path('/user/'+token+'/'+name); 
                      }
                 }
             else{
                $scope.messageSignup = response.data.message;
             }
             
         },function(response){
             console.log(response);
         })
     }
     $scope.login = function(){
         console.log($scope.account)
        $http({
            url:'/api/login',
            method: 'POST',
            data:$scope.account
        }).then(function(response){
           if(response.data.success === true)
               {
                    console.log(response.data.name)
                    console.log(response.data.token);
                   var name = response.data.name
                    var token = response.data.token;
                    $location.path('/user/'+token+'/'+name); 
               }
            else
                {
                    $scope.messageLogin = response.data.message;
                }
        },function(response){
            console.log(response);
        });
     }
     $rootScope.home = function(){
         console.log('yo')
         $location.path('/');
     }
});

app.controller('userView',function($scope,$http,$routeParams,$location,$rootScope){
    
    $scope.showcontact1 = $scope.showcontact;
    $scope.closecontact1 = $scope.closecontact;
    
    $scope.showabout1 = $scope.showabout;
    $scope.closeabout1 = $scope.closeabout;
    
    $rootScope.title = 'Search Bloodgroup';
    $scope.username = $routeParams.name;
    $scope.home1 = $scope.home; 
    
    $scope.logout = function(){
        $http({
            url:'/api/logout',
            method:'GET',
            params:{
                token:$routeParams.token
            }
        }).then(function(response){
            if(response.data.success === true)
                {
                    console.log(response);
                    $location.path('/');
                }
            else
                {
                    document.querySelector('#expiremodal').style.display = "block";
                    $scope.backPage = function(){
                        $location.path('/');
                    }
                }
            
        },function(response){
            console.log('not done')
        })
    }
    
    $scope.findBlood = function(){
          $rootScope.cm=$scope.user
        console.log($rootScope.cm);
        $http({
            url:'/api/find',
            method:'POST',
            params:{
              token: $routeParams.token 
            },
            data:$rootScope.cm
        }).then(function(response){
            console.log(response.data);
            if(response.data.success == false)
                {
                    document.querySelector('#expiremodal').style.display = "block";
                    $scope.backPage = function(){
                        $location.path('/');
                    }
                }
            else
                {
                    $rootScope.info = response.data.info;
                    $location.path('/data/'+$routeParams.token+'/'+response.data.name)
                }
            
        },function(response){
            console.log('not done');
        })
    }
    
    $scope.hospitalSearch = function(){
        $location.path('/hospital');
    }
});

app.controller('dataView',function($scope,$http,$routeParams,$location,$rootScope){
    
    $scope.showcontact2  = $scope.showcontact;
    $scope.closecontact2 = $scope.closecontact;
    
     $scope.showabout2 = $scope.showabout;
    $scope.closeabout2 = $scope.closeabout;
    
    $rootScope.title = 'Records';
    $scope.username = $routeParams.name
    $scope.home2 = $scope.home;
    console.log($scope.cm);
    var refresh = function(){
        $http({
            url:'/api/find',
            method:'POST',
            params:{
              token: $routeParams.token 
            },
            data:$scope.cm
        }).then(function(response){
//            if(response.data.info.length);
            if(response.data.info.length == 0)
                {
                    document.querySelector('#nodatafound').style.display = 'block';
                    $scope.userPage2 = function(){
                        $location.path('/user/'+$routeParams.token+'/'+$routeParams.name);
                    }
                }
            else
                {
                    var arr = [];
            response.data.info.forEach(function(records){
                arr.push(records);
            })
//            console.log(arr);
             $scope.data = arr;
//            console.log(data)
//            $scope.x = response.data[0].email;
                }
            
        },function(response){
            console.log('not done');
        })
    }
//    var arr = [];
//    console.log($scope.data);
    refresh();
    
//    $scope.x=$scope.info;
//    var refresh = function(){
//        $scope.x=$scope.info[0].email;
//    }
//    $scope.refresh();
    
       $scope.logout = function(){
        $http({
            url:'/api/logout',
            method:'GET',
            params:{
                token:$routeParams.token
            }
        }).then(function(response){
            if(response.data.success === true)
                {
                    console.log(response);
                    $location.path('/');
                }
            else
                {
                    document.querySelector('#expiremodal').style.display = "block";
                    $scope.backPage = function(){
                        $location.path('/');
                    }
                }
            
        },function(response){
            console.log('not done')
        })
    }
});

app.controller('hospitalSearch',function($scope,$http){
    $scope.submitAdd = function(){
        $http({
            url:'https://maps.googleapis.com/maps/api/geocode/json',
            params:{
            address:$scope.address,
            key:'AIzaSyBWcUqKSG6hdO2Tx8tYwBAEB3z4RZmK11A'
            }
        }).then(function(response){
            $scope.location = response.data.results['0'].geometry.location;
             $http({
                 url:'/hospital',
                 method:'POST',
                 data:$scope.location
            }).then(function(response){
//                 console.log(response.data.results);
                 if(response.data.results.length == 0)
                     {
                         console.log('no results');
                     }
                 else
                     {
                         var arr1 = [];
                         response.data.results.forEach(function(hnames){
                             arr1.push(hnames);
                         })
                         $scope.hosrec = arr1;
                         console.log(arr1)
                     }
             },function(response){
                 console.log(response);
             });
        },function(response){
            console.log(response);
        });
    }
    
});

app.directive('myStates',function(){
    return {
        templateUrl:'views/states.html'
    };
    
});