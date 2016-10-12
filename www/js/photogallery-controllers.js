var photoGalleryControllers = angular.module('photoGalleryControllers', [])

.controller('PhotoGalleryCtrl', function($scope, $ionicHistory, PhotoGallery) {

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    console.log("State changed: ", toState);
    console.log("State changed: ", toParams);
    console.log("State changed: ", fromState);
    console.log("State changed: ", fromParams);

    if (toState.name == "tab.photo-detail" && toParams != {}) {

      var gallery = PhotoGallery.getGallery();
      var photos = [];

      // TODO show photos on the map if in view
      var urlParts = gallery.photos[toParams.photoID].photoURL.split("/");
      $scope.photo = {
            lat: gallery.photos[toParams.photoID].location.coords.latitude,
            lng: gallery.photos[toParams.photoID].location.coords.longitude,
            url: gallery.photos[toParams.photoID].photoURL,
            caption: urlParts[urlParts.length-1],
            thumbnail: gallery.photos[toParams.photoID].photoURL,
            photoID: toParams.photoID
      };
      console.log($scope.photo);
    }
  });

  // $scope.goBack = function() {
  //   console.log("goBack");
  //   $ionicHistory.goBack();
  // }
});
