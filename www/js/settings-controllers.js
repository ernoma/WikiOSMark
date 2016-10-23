
angular.module('settingsControllers', [])

.controller('SettingsCtrl', function($scope, $rootScope, $state, $location, OpenStreetMap, AppSettings) {
  $scope.settings = {
    enableFriends: true,
    showUserPhotos: AppSettings.shouldShowUserPhotos(),
    defaultLanguage: AppSettings.getDefaultLanguage(),
    showWikidataOnMap: AppSettings.shouldShowWikidataOnMap(),
    showWikipediaOnMap: AppSettings.shouldShowWikipediaOnMap(),
    showCommonsOnMap: AppSettings.shouldShowCommonsOnMap(),
    OSMSearchRadius: AppSettings.getOSMSearchRadius(),
    flickrPhotoMaxCount: AppSettings.getFlickrPhotoMaxCount(),
    mapillaryPhotoMaxCount: AppSettings.getMapillaryPhotoMaxCount(),
    showWheelmapNodesOnMap: AppSettings.shouldShowWheelmapNodesOnMap(),
    wheelmapNodesMaxCount: AppSettings.getWheelmapNodesMaxCount()
  };

  //console.log($scope.$parent);
  //$scope.$parent.title = "Account";

  $scope.userDetails = {
    OSM: null,
    Wiki: null
  }

  $scope.changeOSMSearchRadius = function() {
    AppSettings.setOSMSearchRadius($scope.settings.OSMSearchRadius);
  }

  $scope.changeWheelmapNodesMaxCount = function() {
    AppSettings.setWheelmapNodesMaxCount($scope.settings.wheelmapNodesMaxCount);
  }


  $scope.changeFlickrPhotoMaxCount = function() {
    AppSettings.setFlickrPhotoMaxCount($scope.settings.flickrPhotoMaxCount);
  }

  $scope.changeMapillaryPhotoMaxCount = function() {
    AppSettings.setMapillaryPhotoMaxCount($scope.settings.mapillaryPhotoMaxCount);
  }

  $scope.switchShowWheelmapNodes = function() {
    //console.log("in switchShowWheelmapNodes");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowWheelmapNodesOnMap($scope.settings.showWheelmapNodesOnMap);
    //console.log(AppSettings.shouldShowUserPhotos());
  }

  $scope.switchShowUserPhotos = function() {
    //console.log("in switchShowUserPhotos");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowUserPhotos($scope.settings.showUserPhotos);
    //console.log(AppSettings.shouldShowUserPhotos());
  }

  $scope.switchShowWikidataOnMap = function() {
    // console.log("in switchShowWikidataOnMap");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowWikidataOnMap($scope.settings.showWikidataOnMap);
    //console.log(AppSettings.shouldShowUserPhotos());
  }
  $scope.switchShowWikipediaOnMap = function() {
    //console.log("in switchShowWikipediaOnMap");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowWikipediaOnMap($scope.settings.showWikipediaOnMap);
    //console.log(AppSettings.shouldShowUserPhotos());
  }
  $scope.switchShowCommonsOnMap = function() {
    //console.log("in switchShowCommonsOnMap");
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
      //console.log(jsonObj);
      $scope.userDetails.OSM = jsonObj;
    });
  }
})

.controller('SettingsCountryCtrl', function($scope, $stateParams, AppSettings) {
  $scope.settings = {
    countryCode: $stateParams.countryCode
  }

  switch ($scope.settings.countryCode) {
    case 'da':
      $scope.settings.country = "Denmark";
      $scope.settings.flagStyle = "flag-icon-dk";
      break;
    case 'et':
      $scope.settings.country = "Estonia";
      $scope.settings.flagStyle = "flag-icon-ee";
      break;
    case 'fi':
      $scope.settings.country = "Finland";
      $scope.settings.flagStyle = "flag-icon-fi";
      break;
    case 'is':
      $scope.settings.country = "Iceland";
      $scope.settings.flagStyle = "flag-icon-is";
      break;
    case 'no':
      $scope.settings.country = "Norway";
      $scope.settings.flagStyle = "flag-icon-no";
      break;
    case 'se':
      $scope.settings.country = "Sweden";
      $scope.settings.flagStyle = "flag-icon-se";
      break;
  }
});
