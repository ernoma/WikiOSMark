
var mapControllers = angular.module('mapControllers', [])

.controller('MapCtrl', function($scope, $cordovaGeolocation, leafletData) {

	var tilesDict = {
		openstreetmap: {
			url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			options: {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}
		}
	};
	
	$scope.map = {
          defaults: {
            zoomControlPosition: 'bottomleft'
          },
          markers : {},
          events: {
            map: {
              enable: ['context'],
              logic: 'emit'
            }
          }
        };
	
	angular.extend($scope, {
			tiles: tilesDict.openstreetmap
	});
	
	$scope.goTo = function() {
		$scope.map.center  = {
			  lat : 61.5,
			  lng : 23.766667,
			  zoom : 12
			};
	}
	
	$scope.goTo();
	
	$scope.locateMe = function() {
		//$scope.tiles = tilesDict.openstreetmap;
		$scope.locate();
	}

	$scope.locate = function(){

		$cordovaGeolocation
		  .getCurrentPosition()
		  .then(function (position) {
		    $scope.map.center.lat  = position.coords.latitude;
		    $scope.map.center.lng = position.coords.longitude;
		    $scope.map.center.zoom = 15;

		    $scope.map.markers.now = {
		      lat:position.coords.latitude,
		      lng:position.coords.longitude,
		      message: "You Are Here",
		      focus: true,
		      draggable: false
		    };

		  }, function(err) {
		    // error
		    console.log("Location error!");
		    console.log(err);
		  });
	};
});
