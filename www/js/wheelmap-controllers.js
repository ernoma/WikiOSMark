var wheelmapControllers = angular.module('wheelmapControllers', [])

.controller('WheelmapCtrl', function($scope, $ionicHistory) {

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    console.log("State changed: ", toState);
    console.log("State changed: ", toParams);
    console.log("State changed: ", fromState);
    console.log("State changed: ", fromParams);

    if (toState.name == "tab.wheelmap-detail" && toParams != {}) {
      console.log($scope.mapControllerData.selectedWheelmapNode);
      var nodeTypeIdentifier = $scope.mapControllerData.selectedWheelmapNode.node_type.identifier.replace(/_+/g, ' ');
      nodeTypeIdentifier = nodeTypeIdentifier.charAt(0).toUpperCase() + nodeTypeIdentifier.slice(1);
      var category = $scope.mapControllerData.selectedWheelmapNode.category.identifier.replace(/_+/g, ' ');
      category = category.charAt(0).toUpperCase() + category.slice(1);
      $scope.node = {
        lat: $scope.mapControllerData.selectedWheelmapNode.lat,
        lng: $scope.mapControllerData.selectedWheelmapNode.lng,
        category: $scope.mapControllerData.selectedWheelmapNode.category,
        prettified_category: category,
        node_type: $scope.mapControllerData.selectedWheelmapNode.node_type,
        prettified_node_type: nodeTypeIdentifier,
        caption: $scope.mapControllerData.selectedWheelmapNode.caption,
        nodeID: toParams.nodeID,
        wheelchair: $scope.mapControllerData.selectedWheelmapNode.wheelchair,
        icon: $scope.mapControllerData.selectedWheelmapNode.icon
      }
    }
  });

  $scope.showAtWheelmapOrg = function() {
    window.open("https://wheelmap.org/map#/?" +
      "lat=" + $scope.node.lat +
      "&lon=" + $scope.node.lng +
      "&zoom=18",
      '_system', 'location=yes');
  }
});
