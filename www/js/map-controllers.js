
var mapControllers = angular.module('mapControllers', [])

.controller('MapCtrl', function($scope, $rootScope, $cordovaGeolocation, $http, leafletData, leafletEvents, $ionicSideMenuDelegate, Wiki, AppSettings) {

	//
	// Variables
	//

	$scope.overpassResult = "";

	//var mapFeatures = [];

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
	//
	// $rootScope.$on( "findOSMObjects", function( event ) {
	// 	$scope.findOSMObjects();
	// });

	//console.log(leafletEvents);
	//var markerEvents = leafletEvents.getAvailableMarkerEvents();
	//console.log(markerEvents);
	// var mapEvents = leafletEvents.getAvailableMapEvents();
	// //console.log(mapEvents);
	// for (var k in mapEvents){
  //     var eventName = 'leafletDirectiveMap.' + mapEvents[k];
  //     $scope.$on(eventName, function(event){
  //         //console.log(event.name);
	// 				if (event.name == "leafletDirectiveMap.popupopen") {
	// 					console.log(event);
	// 					for (var i = 0; i < mapFeatures.length; i++) {
	// 						if (mapFeatures[i].popup._isOpen) {
	//
	// 							leafletData.getMap().then(function(map) {
	// 								console.log(mapFeatures[i].popup);
	// 								map.closePopup(mapFeatures[i].popup);
	// 								console.log(mapFeatures[i].feature);
	// 								// TODO populate info form with the data
	// 								var title = mapFeatures[i].feature.properties.type.charAt(0).toUpperCase() +
	// 									mapFeatures[i].feature.properties.type.slice(1) + " " +
	// 									mapFeatures[i].feature.properties.id;
	// 								console.log(title);
	// 								$scope.osmObjectInfo.title = title;
	// 								//tags: mapFeatures[i].feature.properties.tags,
	// 								//incompleteGeometry: mapFeatures[i].feature.properties.tainted
	//
	// 								// TODO populate Wiki search form with the data
	// 								$ionicSideMenuDelegate.toggleRight(true);
	// 							});
	// 							break;
	// 						}
	// 					}
	// 				}
  //     });
  // }
	// $scope.$on('leafletDirectiveMarker.click', function(event, locationEvent) {
	// 	console.log(event);
	// 	console.log(locationEvent);
	// });

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
		console.log("in locateMe");
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

	$scope.searchWiki = function() {
		console.log("in searchWiki");
	}

	$scope.showWikidataPage = function() {
		console.log("in showWikidataPage");
		Wiki.showWikidataPage($scope.osmObjectInfo.wikidataTag);
	}
	$scope.showWikipediaPage = function() {
		console.log("in showWikipediaPage");
		Wiki.showWikipediaPage($scope.osmObjectInfo.wikipediaTag);
	}
	$scope.showCommonsPage = function() {
		console.log("in showCommonsPage");
		Wiki.showWikimediaCommonsPage($scope.osmObjectInfo.wikimediaCommonsTag);
	}

	$scope.inputWikidataChange = function() {
		// TODO search and suggest options when 2 or more characters in the input field
		if ($scope.osmObjectInfo.wikidataTag.length >= 2) {
			Wiki.queryMediaWiki("wikidata", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikidataTag, function(data) {
					console.log(data);
			});
		}
	}
	$scope.inputWikipediaChange = function() {
		// TODO search and suggest options when enought characters in the input field
		if ($scope.osmObjectInfo.wikipediaTag.includes(":")) {
			if ($scope.osmObjectInfo.wikipediaTag.length >= 6) {
				var parts = $scope.osmObjectInfo.wikipediaTag.split(":");
				if (parts.length > 1) {
					Wiki.queryMediaWiki("wikipedia", parts[0], parts[1], function(data) {
							console.log(data);
					});
				}
			}
		}
		else {
			if ($scope.osmObjectInfo.wikipediaTag.length >= 3) {
				Wiki.queryMediaWiki("wikipedia", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikipediaTag, function(data) {
						console.log(data);
				});
			}
		}
	}
	$scope.inputCommonsChange = function() {
		// TODO search and suggest options when 3 or more characters in the input field
	}

	$scope.saveWikiTagChanges = function() {
		// TODO Check
		// 1. what changes there are
		// 2. if there exists the wiki item(s) and if there does
		// 3. call OpenStreetMapService save accordingly
	}

	$scope.findOSMObjects = function() {
		console.log("in findOSMObjects");
		var onEachFeature = function (feature, layer) {
			layer.on({
        click: function() {
          console.log("geojson feature clicked");
					// var title = feature.properties.type.charAt(0).toUpperCase() +
					// 	feature.properties.type.slice(1) + " " +
					// 	feature.properties.id;
					console.log(feature);
					$scope.osmObjectInfo.id = feature.properties.id;
					$scope.osmObjectInfo.type = feature.properties.type;
					$scope.osmObjectInfo.tags = {};
					$scope.osmObjectInfo.wikidataTag = null;
					$scope.osmObjectInfo.wikipediaTag = null;
					$scope.osmObjectInfo.wikimediaCommonsTag = null;
					for (var key in feature.properties.tags) {
						if (key == "wikipedia") {
							$scope.osmObjectInfo.wikipediaTag = feature.properties.tags[key];
						}
						else if (key == "wikidata") {
							$scope.osmObjectInfo.wikidataTag = feature.properties.tags[key];
						}
						else if (key == "wikimedia_commons") {
							$scope.osmObjectInfo.wikimediaCommonsTag = feature.properties.tags[key];
						}
						else {
							$scope.osmObjectInfo.tags[key] = feature.properties.tags[key];
						}
					}
					//$scope.osmObjectInfo.tags = feature.properties.tags;
					$scope.osmObjectInfo.incompleteGeometry = feature.properties.tainted;

					// TODO populate Wiki search form with the data
					$ionicSideMenuDelegate.toggleRight(true);
				}
			});

			// var content = "";
			//
			// content += "<h3>" + feature.properties.type.charAt(0).toUpperCase() + feature.properties.type.slice(1);
			// content += " " + feature.properties.id + "</h3>";
			//
			// if (feature.properties.tags != undefined) {
			// 	content += "<h4>Tags:</h4>";
			// 	for (var key in feature.properties.tags) {
			// 			content += key + "=" + feature.properties.tags[key] + "<br>";
			// 	}
			// }
			// if (feature.properties.tags["wikipedia"] == undefined) {
			//  		content += "<p><button class='button button-small button-positive' ng-click='searchWiki()'>Search Wiki</button></p>";
			// }
			// if (feature.properties.tainted) {
			// 	content += "<p><b>Note:</b> incomplete geometry</p>";
			// }
			//
			// //var element = $compile(content);
			// //console.log(element);
			// //var html = element($scope);
			// //console.log(html);
			// layer.bindPopup(content);


			//console.log(layer);
			//var popup = layer.getPopup();
			// var mapFeature = {
			// 	popup: layer._popup,
			// 	feature: feature
			// }
			// mapFeatures.push(mapFeature);
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


		var addOverpassDataToMap = function(data) {
			var geoJson = osmtogeojson(data);
			console.log(geoJson);

			leafletData.getMap().then(function(map) {
				L.geoJson(geoJson, {
					style: styleFeature,
					pointToLayer: pointToLayer,
					onEachFeature: onEachFeature
				}).addTo(map);
			});
		}

		addOverpassDataToMap(overpass_test_data);

		// data = "[out:json];(node(around:100.0," + $scope.map.center.lat + "," + $scope.map.center.lng + ");<;);out meta;";
		// $http.get('http://www.overpass-api.de/api/interpreter?data=' + data)
		// 	.success(function(data, status, headers,config){
		//       console.log('data success');
		//       //console.log(data); // for browser console
		//       //$scope.overpassResult = data; // for UI
		//
		//       addOverpassDataToMap(data);
		//     })
		//     .error(function(data, status, headers,config){
		//       console.log('data error');
		//     })
		//     .then(function(result){
		//       //things = result.data;
		//     });

		// (node(around:100.0,61.496507,23.781377);<;);out meta; // sorsapuisto
		// (node(around:100.0,61.5,23.766667);<;);out meta; // koskipuisto
	}

});
