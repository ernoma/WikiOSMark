angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $rootScope) {
  $scope.mainMenuTitle = "Map";
  $scope.sideMenuTitle = "Wiki";

  $scope.$on('$stateChangeSuccess',
    function(evt, toState, toParams, fromState, fromParams) {
      $rootScope.currentState = toState.name;
      switch ($rootScope.currentState) {
        case "tab.map":
          $scope.mainMenuTitle = "Map";
          $scope.sideMenuTitle = "Wiki";
          break;
        case "tab.wiki":
          $scope.mainMenuTitle = "Wiki";
          $scope.sideMenuTitle = "";
          break;
        case "tab.account":
          $scope.mainMenuTitle = "Account";
          $scope.sideMenuTitle = "";
          break;
        case "tab.info":
          $scope.mainMenuTitle = "Info";
          $scope.sideMenuTitle = "";
          break;
      }
  });
})

.controller('TabCtrl', function($scope, $rootScope) {
  $scope.findOSMObjects = function() {
    console.log("in TabCtrl");
    $rootScope.$broadcast('findOSMObjects');
  }
  $scope.locateMe = function() {
    console.log("in TabCtrl");
    $rootScope.$broadcast('locateMe');
  }
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $state, $location, OpenStreetMap) {
  $scope.settings = {
    enableFriends: true
  };

  console.log($scope.$parent);
  //$scope.$parent.title = "Account";

  $scope.userDetails = {
    OSM: null,
    Wiki: null
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
