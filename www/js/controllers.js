angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $rootScope) {
  $scope.mainMenuTitle = "Map";
  $scope.sideMenuTitle = "Info";

  $scope.osmObjectInfo = {
    type: "",
    id: "",
    tags: null,
    wikidataTag: null,
    wikipediaTag: null,
    wikimediaCommonsTag: null,
    incompleteGeometry: false,
  }

  $scope.mapControllerData = {
  	selectedFeature: null,
    overpassResult: "",
    changesToSave: false,
    changesetComment: ""
  }

  $scope.searchResults = {
    //wikidataResults = [{"id":"Q5408372","concepturi":"http://www.wikidata.org/entity/Q5408372","url":"//www.wikidata.org/wiki/Q5408372","title":"Q5408372","pageid":5172585,"label":"Joutsenkaula","description":"Wikimedia disambiguation page","match":{"type":"label","language":"en","text":"Joutsenkaula"}},
    //  {"id":"Q2736937","concepturi":"http://www.wikidata.org/entity/Q2736937","url":"//www.wikidata.org/wiki/Q2736937","title":"Q2736937","pageid":2628927,"label":"Joutsen","description":"Wikipedia disambiguation page","match":{"type":"label","language":"en","text":"Joutsen"}
    //}],
    wikidataResults: null,
    wikipediaResults: null,
    commonsResults: null
  }

  $scope.$on('$stateChangeSuccess',
    function(evt, toState, toParams, fromState, fromParams) {
      $rootScope.currentState = toState.name;
      switch ($rootScope.currentState) {
        case "tab.map":
          $scope.mainMenuTitle = "Map";
          $scope.sideMenuTitle = "OSM Object Info";
          break;
        case "tab.wiki":
          $scope.mainMenuTitle = "Wiki";
          $scope.sideMenuTitle = "";
          break;
        case "tab.settings":
          $scope.mainMenuTitle = "Settings";
          $scope.sideMenuTitle = "";
          break;
        case "tab.info":
          $scope.mainMenuTitle = "Info";
          $scope.sideMenuTitle = "";
          break;
      }
  });
})

.controller('TabCtrl', function($scope, $rootScope, $cordovaCamera, GeoLocation, PhotoGallery) {
  $scope.findOSMObjects = function() {
    //console.log("in TabCtrl");
    $scope.$broadcast('findOSMObjects');
  }
  $scope.locateMe = function() {
    //console.log("in TabCtrl");
    $scope.$broadcast('locateMe');
  }

  $scope.inputWikidataChange = function() {
    $scope.$broadcast('inputWikidataChange');
  }
  $scope.selectWikidataSearchResult = function(item) {
    $scope.$broadcast('selectWikidataSearchResult', item);
  }
  $scope.inputWikipediaChange = function() {
    $scope.$broadcast('inputWikipediaChange');
  }
  $scope.selectWikipediaSearchResult = function(item) {
    $scope.$broadcast('selectWikipediaSearchResult', item);
  }
  $scope.inputCommonsChange = function() {
    $scope.$broadcast('inputCommonsChange');
  }
  $scope.selectCommonsSearchResult = function(item) {
    $scope.$broadcast('selectCommonsSearchResult', item);
  }

  $scope.takePhoto = function() {
    var options = {
      quality: 75,
      allowEdit: true,
      correctOrientation: true,
      saveToPhotoAlbum: true
    }

    storePhoto("https://upload.wikimedia.org/wikipedia/commons/8/85/Tesoman_palloiluhalli.jpg");
    //$cordovaCamera.getPicture(options).then(storePhoto, function(err) {
    //  console.log(err);
    //});
  }

  var storePhoto = function(imageURL) {
    // Get location, store photo and location to the localStorage, and view to user (on map, etc.)

    console.log(imageURL); //file:///storage/emulated/0/Android/data/com.ionicframework.wikiosmark921578/cache/1476208863949.jpg
    var position = GeoLocation.getCurrentPosition();
    console.log(position);

    PhotoGallery.addPhoto(imageURL, position);

    $scope.$broadcast('photoAdded');
  }
})

.controller('SettingsCtrl', function($scope, $rootScope, $state, $location, OpenStreetMap, AppSettings) {
  $scope.settings = {
    enableFriends: true,
    showUserPhotos: AppSettings.shouldShowUserPhotos(),
    defaultLanguage: AppSettings.getDefaultLanguage()
  };

  console.log($scope.$parent);
  //$scope.$parent.title = "Account";

  $scope.userDetails = {
    OSM: null,
    Wiki: null
  }

  $scope.switchShowUserPhotos = function() {
    console.log("in switchShowUserPhotos");
    //console.log($scope.settings.showUserPhotos);
    AppSettings.setShowUserPhotos($scope.settings.showUserPhotos);
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
})

.controller('InfoCtrl', function($scope) {

});
