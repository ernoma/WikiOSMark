angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

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

  $scope.authorizeWiki = function() {
    // TODO
  }

  $scope.authorizeOSM = function() {
    OpenStreetMap.getUserDetails();
  }

  $scope.logoutOSM = function() {
    OpenStreetMap.logout();
  }


  $scope.authComplete = function() {
    console.log($location.url());
    OpenStreetMap.authComplete($location.url());
    $state.go("tab.account");
  }
})

.controller('InfoCtrl', function($scope) {

});
