
angular.module('settingsControllers', [])

.controller('SettingsCtrl', function($scope, $rootScope, $state, $location, OpenStreetMap, AppSettings) {
  $scope.settings = {
    enableFriends: true,
    showUserPhotos: AppSettings.shouldShowUserPhotos(),
    defaultLanguage: AppSettings.getDefaultLanguage(),
    showWikidataOnMap: AppSettings.shouldShowWikidataOnMap(),
    showWikipediaOnMap: AppSettings.shouldShowWikipediaOnMap(),
    showCommonsOnMap: AppSettings.shouldShowCommonsOnMap(),
    OSMSearchRadius: AppSettings.getOSMSearchRadius()
  };

  console.log($scope.$parent);
  //$scope.$parent.title = "Account";

  $scope.userDetails = {
    OSM: null,
    Wiki: null
  }

  $scope.changeOSMSearchRadius = function() {
    AppSettings.setOSMSearchRadius($scope.settings.OSMSearchRadius);
  }

  $scope.switchShowUserPhotos = function() {
    console.log("in switchShowUserPhotos");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowUserPhotos($scope.settings.showUserPhotos);
    //console.log(AppSettings.shouldShowUserPhotos());
  }

  $scope.switchShowWikidataOnMap = function() {
    console.log("in switchShowWikidataOnMap");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowWikidataOnMap($scope.settings.showWikidataOnMap);
    //console.log(AppSettings.shouldShowUserPhotos());
  }
  $scope.switchShowWikipediaOnMap = function() {
    console.log("in switchShowWikipediaOnMap");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowWikipediaOnMap($scope.settings.showWikipediaOnMap);
    //console.log(AppSettings.shouldShowUserPhotos());
  }
  $scope.switchShowCommonsOnMap = function() {
    console.log("in switchShowCommonsOnMap");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowCommonsOnMap($scope.settings.showCommonsOnMap);
    //console.log(AppSettings.shouldShowUserPhotos());
  }

  $scope.changeDefaultLanguage = function() {
    //console.log($scope.settings.defaultLanguage);
    AppSettings.setDefaultLanguage($scope.settings.defaultLanguage);
  }

  var x2js = new X2JS();

  $scope.authorizeWiki = function() {
    // TODO
  }

  $scope.authorizeOSM = function() {
    OpenStreetMap.getUserDetails(function(details) {});
  }

  $scope.logoutOSM = function() {
    OpenStreetMap.logout();
  }

  $scope.authenticatedOSM = function() {
    return OpenStreetMap.authenticated();
  }

  $scope.getOSMUserDetails = function() {
    OpenStreetMap.getUserDetails(function(details) {
      //console.log(details.getElementsByTagName("osm")[0].innerHTML);
      var jsonObj = x2js.xml_str2json( details.getElementsByTagName("osm")[0].innerHTML );
      console.log(jsonObj);
      $scope.userDetails.OSM = jsonObj;
    });
  }
});
