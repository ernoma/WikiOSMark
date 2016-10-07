
var mapControllers = angular.module('mapControllers', [])

.controller('MapCtrl', function($scope, $rootScope, $cordovaGeolocation, $http, leafletData, leafletEvents, $ionicSideMenuDelegate) {

	//
	// Variables
	//

	$scope.overpassResult = "";

	var mapFeatures = [];

	var mapEvents = leafletEvents.getAvailableMapEvents();
	//console.log(mapEvents);
	for (var k in mapEvents){
      var eventName = 'leafletDirectiveMap.' + mapEvents[k];
      $scope.$on(eventName, function(event){
          //console.log(event.name);
					if (event.name == "leafletDirectiveMap.popupopen") {
						console.log(event);
						for (var i = 0; i < mapFeatures.length; i++) {
							if (mapFeatures[i].popup._isOpen) {
								console.log(mapFeatures[i].feature);
								$ionicSideMenuDelegate.toggleRight(true);
								break;
							}
						}
					}
      });
  }

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

	var tilesDict = {
		openstreetmap: {
			url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			options: {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}
		}
	};

	angular.extend($scope, {
			tiles: tilesDict.openstreetmap
	});

	//
	// Event handlers
	//

	$rootScope.$on( "locateMe", function( event ) {
		$scope.locateMe();
	});

	$rootScope.$on( "findOSMObjects", function( event ) {
		$scope.findOSMObjects();
	});

	//
	// Methods
	//

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
		    $scope.map.center.zoom = 18;

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

	$scope.findOSMObjects = function() {

		var onEachFeature = function (feature, layer) {
			var content = "";

			content += "<h3>" + feature.properties.type.charAt(0).toUpperCase() + feature.properties.type.slice(1);
			content += " " + feature.properties.id + "</h3>";

			if (feature.properties.tags != undefined) {
				content += "<h4>Tags:</h4>";
				for (var key in feature.properties.tags) {
						content += key + "=" + feature.properties.tags[key] + "<br>";
				}
			}
			// if (feature.properties.tags["wikipedia"] == undefined) {
			// 		content += "<p><button class='button button-small button-positive' ng-click='searchWiki()'>Search Wiki</button></p>";
			// }
			if (feature.properties.tainted) {
				content += "<p><b>Note:</b> incomplete geometry</p>";
			}

			layer.bindPopup(content);
			//console.log(layer);
			//var popup = layer.getPopup();
			var mapFeature = {
				popup: layer._popup,
				feature: feature
			}
			mapFeatures.push(mapFeature);
		}

		var styleFeature = function (feature) {

			var style = {};

			if (feature.properties.type == "way") {
				if (feature.properties.tags != undefined) {
					if (feature.properties.tags.wikipedia != undefined) {
						style.color = '#0f0';
						console.log(style);
					}
					else if (feature.properties.tags.building != undefined) {
						style.color = '#800000';
					}
					else if ((feature.properties.tags.leisure != undefined && feature.properties.tags.leisure == "park") ||
						(feature.properties.tags.leisure != undefined && feature.properties.tags.leisure == "playground") ||
						(feature.properties.tags.landuse != undefined && feature.properties.tags.landuse == "grass")
						) {
						style.color = '#196619';
					}
					else if (feature.properties.tags.highway != undefined ||
						(feature.properties.tags.amenity != undefined && feature.properties.tags.amenity == "parking")
						) {
						style.color = '#4d4d33';
					}
					else {
						style.color = '#404040';
					}
				}
				if (feature.properties.tainted) {
					style.dashArray = "5, 5";
					//console.log(style);
				}
			}

			return style;
		}

		var pointToLayer = function (feature, latlng) {

			var geojsonMarkerOptions = {
			    radius: 12,
			    fillColor: "#ff7800",
			    color: "#000",
			    weight: 1,
			    opacity: 1,
			    fillOpacity: 0.4
			};

			if (feature.properties.tags != undefined) {
				if (feature.properties.tags.wikipedia != undefined) {
					geojsonMarkerOptions.fillColor = "#0f0";
				}
			}

			return L.circleMarker(latlng, geojsonMarkerOptions);
		}


		data = "[out:json];(node(around:100.0," + $scope.map.center.lat + "," + $scope.map.center.lng + ");<;);out meta;";
		$http.get('http://www.overpass-api.de/api/interpreter?data=' + data)
			.success(function(data, status, headers,config){
		      console.log('data success');
		      //console.log(data); // for browser console
		      //$scope.overpassResult = data; // for UI

		      var geoJson = osmtogeojson(data);
		      console.log(geoJson);

		      leafletData.getMap().then(function(map) {
		      	L.geoJson(geoJson, {
		      		style: styleFeature,
		      		pointToLayer: pointToLayer,
		      		onEachFeature: onEachFeature
		      	}).addTo(map);
		      });
		    })
		    .error(function(data, status, headers,config){
		      console.log('data error');
		    })
		    .then(function(result){
		      //things = result.data;
		    });

		// (node(around:100.0,61.496507,23.781377);<;);out meta; // sorsapuisto
		// (node(around:100.0,61.5,23.766667);<;);out meta; // koskipuisto
	}

});
