var countryControllers = angular.module('countryControllers', [])

.controller('CountryDetailCtrl', function($scope) {

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    // console.log("State changed: ", toState);
    // console.log("State changed: ", toParams);
    // console.log("State changed: ", fromState);
    // console.log("State changed: ", fromParams);

    $scope.country = {
      item: null,
      countryCode: null
    }

    console.log($scope.mapControllerData.selectedCountryItem);

    if (toState.name == "tab.country-detail" && toParams != {}) {
        $scope.country.item = $scope.mapControllerData.selectedCountryItem;
        $scope.country.countryCode = toParams.countryCode;
    }
  });

  $scope.openLink = function(link) {
    window.open(link, '_system', 'location=yes');
  }
});
