(function() {
    'use strict';

    angular.module('iotKitUI',['ngToast'])

    .config(['ngToastProvider', function(ngToast) {
        ngToast.configure({
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
    }])

    .controller('kitSetupController', ['$scope', '$http', '$q', 'ngToast', 
        function($scope, $http, $q, ngToast){
            
            $scope.setup = {};
            $scope.setup.email = "";
            $scope.setup.wifiName = "";
            $scope.setup.wifiPassword = "";

            if(navigator.onLine){
                $scope.studioLink = "http://tql.atomiton.com";
                $scope.websiteLink = "http://atomiton.com";
                $scope.anchorStyle = "color:#fff; cursor:pointer;";
            } else {
                $scope.studioLink = "";
                $scope.websiteLink = "";
                $scope.anchorStyle = "color:grey; cursor: not-allowed;";
            }

            $scope.resetSetupObj = function(){
                $scope.setup.wifiName = "";
                $scope.setup.wifiPassword = "";
            };

            $scope.SSIDToDelete = "";

            $scope.setSSIDToDelete = function(SSID){
                $scope.SSIDToDelete = SSID;
            };

            $scope.engineManagerURL = window.location.protocol + "//" + window.location.hostname + ""+ (window.location.port != "" ? ":" + window.location.port : ":8080") +  "/fid-TQLEngineManager";

            $scope.SSIDList = [];
            $scope.projectEndPoint = "";

             $scope.getProjectEndpoint = function(){
                var deferred = $q.defer();
                
                var data = '<Query>'+
                                '<Find as="$none:Project:$none" format="version,current">'+
                                    '<Project as="var.Project">'+
                                        '<projName eq="IoTKitSetup"/>'+
                                    '</Project>'+
                                    '<ProjectEndPoints >'+
                                        '<projectSysId  eq="var.Project.SysId" />'+
                                    '</ProjectEndPoints>'+
                                '</Find>'+
                            '</Query>';
                $http.post($scope.engineManagerURL, data)
                .then(
                    function(response){
                        var x2js = new X2JS();
                        var jsonObj = x2js.xml_str2json( '<data>'+response.data+'</data>' );
                        angular.forEach(jsonObj.data.Project, function(value, key){
                            if(value.endPointName._Value=="TQLQueryInterface"){
                                $scope.projectEndPoint = value.endPointURL._Value;
                            }
                        });
                        console.log($scope.projectEndPoint);
                        deferred.resolve();
                    },
                    function(error){
                        deferred.reject();
                    }
                );
                return deferred.promise;
            };

            $scope.getSSIDList = function(){
                $scope.getProjectEndpoint().then(function(){
                    var data = '<WifiList></WifiList>';
                    // execute wifi setup query
                    $http.post($scope.projectEndPoint, data)
                   .then(function(response){
                        var x2js = new X2JS();
                        var jsonObj = x2js.xml_str2json( '<data>'+response.data+'</data>' );
                        console.log(jsonObj.data);
                        if(angular.isDefined(jsonObj.data.Output.SSID) && jsonObj.data.Output.SSID!="" && jsonObj.data.Output.SSID.indexOf("#-#") > -1){
                            $scope.SSIDList = jsonObj.data.Output.SSID.split("#-#");    
                        } else if(angular.isDefined(jsonObj.data.Output.SSID) && jsonObj.data.Output.SSID!="" && jsonObj.data.Output.SSID.indexOf("#-#") == -1){
                            $scope.SSIDList.push(jsonObj.data.Output.SSID);
                        }

                        
                        $scope.email = jsonObj.data.Output.Email;
                        $scope.setup.email = $scope.email;
                   }, 
                   function(error){
                     console.log(error);
                   });
                });
            };

            $scope.getSSIDList();

            $scope.saveStatus = "";
            $scope.saveNewNetwork = function(){

                $scope.getProjectEndpoint().then(function(){
                    var data = '<Query>'+
                                    '<DeleteAll>'+
                                        '<SSIDEntryModel>'+
                                            '<entryID ne="" />'+
                                        '</SSIDEntryModel>'+
                                    '</DeleteAll>'+
                                    '<Create>'+
                                        '<SSIDEntryModel>'+
                                            '<EmailID>'+$scope.setup.email+'</EmailID>'+
                                            '<WifiSSID>'+$scope.setup.wifiName+'</WifiSSID>'+
                                            '<WifiPassword>'+$scope.setup.wifiPassword+'</WifiPassword>'+
                                        '</SSIDEntryModel>'+
                                    '</Create>'+
                                '</Query>';
                    // execute wifi setup query
                    $http.post($scope.projectEndPoint, data)
                   .then(function(response){
                        var x2js = new X2JS();
                        var jsonObj = x2js.xml_str2json( '<data>'+response.data+'</data>' );
                        console.log(jsonObj.data);
                        if(jsonObj.data.Create._Status=="Success"){
                            ngToast.create({
                              className: 'success',
                              content: 'Network '+ $scope.setup.wifiName + ' created.',
                              dismissButton: true
                            });
                            $scope.setupForm.$setPristine();
                            $scope.resetSetupObj();
                            $scope.getSSIDList();
                        } else {
                            ngToast.create({
                              className: 'warning',
                              content: 'Error while creating network - '+ $scope.setup.wifiName + '.',
                              dismissButton: true
                            });
                        }
                   }, 
                   function(error){
                     console.log(error);
                   });
                });

                
            };

            $scope.deleteStatus = "";
            $scope.deleteNetwork = function(){
                $scope.getProjectEndpoint().then(function(){
                    var data = '<Query>'+
                                    '<DeleteAll>'+
                                        '<SSIDDeleteModel>'+
                                            '<deleteID ne="" />'+
                                        '</SSIDDeleteModel>'+
                                    '</DeleteAll>'+
                                    '<Create>'+
                                        '<SSIDDeleteModel>'+
                                            '<WifiSSID>'+$scope.SSIDToDelete+'</WifiSSID>'+
                                        '</SSIDDeleteModel>'+
                                    '</Create>'+
                                '</Query>';
                    // execute wifi setup query
                    $http.post($scope.projectEndPoint, data)
                   .then(function(response){
                        var x2js = new X2JS();
                        var jsonObj = x2js.xml_str2json( '<data>'+response.data+'</data>' );
                        console.log(jsonObj.data);
                        if(jsonObj.data.Create._Status=="Success"){
                            ngToast.create({
                              className: 'success',
                              content: 'Network '+ $scope.SSIDToDelete + ' deleted.',
                              dismissButton: true
                            });
                            var index = $scope.SSIDList.indexOf($scope.SSIDToDelete);
                            $scope.SSIDList.splice(index, 1);
                            $scope.getSSIDList();
                        } else {
                            ngToast.create({
                              className: 'warning',
                              content: 'Error while deleteing network - '+ $scope.SSIDToDelete + '.',
                              dismissButton: true
                            });
                        }
                   }, 
                   function(error){
                     console.log(error);
                   });
                });

                
            };

            $scope.rebootPI = function(){
                
                
                $scope.getProjectEndpoint().then(function(){
                    // execute query
                    var data = '<PiReboot></PiReboot>';
                    // execute wifi setup query
                    $http.post($scope.projectEndPoint, data)
                   .then(
                       function(response){
                         var x2js = new X2JS();
                        var jsonObj = x2js.xml_str2json( '<data>'+response.data+'</data>' );
                        console.log(jsonObj.data);
                        // $scope.message = jsonObj.data.Output;
                        ngToast.create({
                          className: 'success',
                          content: 'Rebooting the PI ... Please visit TQL Studio after few minutes.',
                          dismissButton: true
                        });

                       }, 
                       function(error){
                         console.log(error);
                       }
                    );
                    $scope.setupForm.$setPristine();
                    $scope.resetSetupObj();
                    $scope.getSSIDList();

                    $scope.resetSetupObj();                    
                });
                
            };
        }
    ]);
})();