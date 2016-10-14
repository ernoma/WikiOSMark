
var mapControllers = angular.module('mapControllers', [])

.controller('MapCtrl', function($scope, $rootScope, $state, $timeout, $cordovaGeolocation, $http, leafletData, leafletMapEvents, leafletMarkerEvents, leafletBoundsHelpers, $ionicSideMenuDelegate, OpenStreetMap, Wiki, AppSettings, GeoLocation, PhotoGallery) {

	//
	// Variables & initialization
	//

	var osmColors = {
		wiki: '#0f0',
		building: '#800000',
		leisure: '#196619',
		highway: '#4d4d33',
		nodes: '#ff7800',
		unspecified_way: '#404040',
		unspecified: '#00f'
	}

	var legend = {
		position: 'topleft',
		colors: [ osmColors.wiki, osmColors.building, osmColors.leisure, osmColors.highway, osmColors.unspecified_way, osmColors.nodes, osmColors.unspecified ],
		labels: [ 'Element with a Wiki tag', 'Buildings', 'Leisure', 'Highways', 'Other way elements', 'Node elements', 'Default OSM color' ]
	}

	$scope.map = {
    defaults: {
      zoomControlPosition: 'topleft'
    },
    markers : {},
    events: {
      map: {
        enable: ['context'],
        logic: 'emit'
      }
    }
  };

	$scope.events = {
		markers: {
		   enable: leafletMarkerEvents.getAvailableEvents(),
		}
  };

	var photoLayer = null;
	var osmGeoJsonLayer = null;

	var tilesDict = {
		openstreetmap: {
			name: "OpenStreetMap",
			url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			type: 'xyz',
			options: {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}
		},
		osmCycleLayer: {
			name: "OpenCycleMap",
			url: 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
			type: 'xyz',
			options: {
    		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Maps &copy; <a href="http://thunderforest.com/">Thunderforest</a>',
    		maxZoom: 18
			}
		},
		mapBoxLayer: {
			name: "MapBox",
			url: 'http://{s}.tiles.mapbox.com/v3/' + 'ernoma.i04d787e' + '/{z}/{x}/{y}.png',
			type: 'xyz',
			options: {
    		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    		maxZoom: 20
			}
		}
	}

	var bounds = leafletBoundsHelpers.createBoundsFromArray([
				[ 71.2, 32.8 ],
        [ 53.9, -24.1 ]
  ]);

	angular.extend($scope, {
		tiles: tilesDict.openstreetmap,
		bounds: bounds,
		center: {},
		layers: {
			baselayers: {} //tilesDict
		},
		markers: {},
		legend: null
	});

	var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			maxZoom: 20,
			maxNativeZoom: 19
	});
	var osmCycleLayer = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, , Maps &copy; <a href="http://thunderforest.com/">Thunderforest</a>',
			maxZoom: 20,
			maxNativeZoom: 18
	});
	var mapBoxLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/' + 'ernoma.i04d787e' + '/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 20
	});
	var bingLayer = new L.BingLayer('Agf7Ot_un-nQxTrh4Vg6bqThCzQ5KH6kF2oLndffl3LlclN5dY3ELe80I6Kkj5Qd', {type: 'AerialWithLabels', maxZoom: 20,
	maxNativeZoom: 18});

	var baseMaps = {
			"OpenStreetMap": osmLayer,
			"OpenCycleMap": osmCycleLayer,
			"Bing aerial": bingLayer,
			"MapBox": mapBoxLayer
	}

	angular.element(document).ready(function () {
		// Adding Bing layer is maybe easiest this way
		leafletData.getMap().then(function(map) {
			//console.log(map);
			L.control.layers(baseMaps).addTo(map);
			map.eachLayer(function (layer) {
				//console.log(layer);
				map.removeLayer(layer);
			});
			map.addLayer(mapBoxLayer);
		});

		//console.log("in ready");
	});

	//
	// Event handlers
	//

	$scope.$on( "locateMe", function( event ) {
		$scope.locateMe();
	});

	$scope.$on( "showOSMObjects", function( event ) {
		console.log(event);
		$scope.findOSMObjects();
	});

	$scope.$on( "showLegend", function( event ) {
		console.log(event);
		console.log($scope.legend);
		if ($scope.mapControllerData.legendShown == false) {
			angular.extend($scope, {
				legend: legend
			});
			$scope.mapControllerData.legendShown = true;
			console.log($scope.legend);
		}
		else {
			angular.extend($scope, {
				legend: null
			});
			$scope.mapControllerData.legendShown = false;
		}
	});

	$scope.$on( "updateWikiLayers", function( event ) {
		$scope.updateWikiLayers();
	});

	$scope.$on( "photoAdded", function ( event ) {
		$scope.updatePhotoMapLayer();
	});

	$scope.$on("$ionicView.enter", function(event, data){
   	// handle event
   	//console.log(event);
		//console.log(data);

		$scope.updatePhotoMapLayer();

		//$scope.updateWikiLayers();
	});

	// var markerEvents = leafletMarkerEvents.getAvailableEvents();
  // for (var k in markerEvents){
  //   var eventName = 'leafletDirectiveMarker.wikiosmmap.' + markerEvents[k];
	// 	console.log(eventName);
  //   //$scope.$on(eventName, function(event, args) {
  //   //    console.log(event.name);
  //   //});
  // }

	// var mapEvents = leafletMapEvents.getAvailableMapEvents();
  // for (var k in mapEvents){
  //     var eventName = 'leafletDirectiveMap.wikiosmmap.' + mapEvents[k];
	// 		console.log(eventName);
  //     $scope.$on(eventName, function(event, args) {
  //         console.log(event.name);
  //     });
  // }

	$scope.$on('leafletDirectiveMap.wikiosmmap.moveend', function(event, args) {
		//console.log(event.name);
		//console.log(args);
		//$scope.updateWikiLayers();
	});

	$scope.$on('leafletDirectiveMarker.wikiosmmap.click', function(event, args) {
			//console.log(event.name);
			console.log(args);
			if (args.model != undefined) {
				//console.log("evt.model != undefined");
				//$scope.selectedMapMarker = args;

				// TODO: Wiki.queryMediaWiki, populate WikiDetailCtrl $scope data and show wiki-detail page
				//tab.wiki-detail
			}
			//$state.go("tab.photo-detail", { photoID: args.model.photoID });
	});

	//
	// Methods
	//

	// var photoIcon = {
  // 	iconUrl: 'img/icons/camera.png',
  //   iconSize: [32, 32],
  //   iconAnchor: [16, 16]
  // };

	$scope.updateWikiLayers = function() {
		if (!$scope.mapControllerData.WikiItemsShown) {
			if (AppSettings.shouldShowWikidataOnMap()) {
				leafletData.getMap().then(function(map) {
					var bounds = map.getBounds();
					Wiki.geoQueryWikidata(bounds.getSouthWest(), bounds.getNorthEast(), function(data) {
						console.log(data);

						var items = data.results.bindings;
						var markers = {};

						var wikidataIcon = {
							iconUrl: 'img/wikidata_no_text.png',
							iconSize: [32, 23],
							iconAnchor: [16, 12]
						}

						for (var i = 0; i < items.length; i++) {
							var locationParts = items[i].location.value.split("(")[1].split(")")[0].split(" ");

					    markers["wikidata"+i] = {
					      lat: parseFloat(locationParts[1]),
					      lng: parseFloat(locationParts[0]),
					      draggable: false,
								icon: wikidataIcon,
								wikidataItem: items[i]
								//message: "<div ng-include src=\"'templates/wikidata-map-item-template.html'\"></div>",
								//message: items[i].qLabel.value,
					    };
						}
						console.log(markers);

						Wiki.geoQueryWikipedia(bounds.getSouthWest(), bounds.getNorthEast(), function(data) {
							console.log(data);

							var items = data.query.geosearch;

							var wikipediaIcon = {
								iconUrl: 'img/wikipedia_no_text.png',
								iconSize: [32, 27],
								iconAnchor: [16, 14]
							}

							for (var i = 0; i < items.length; i++) {
						    markers["wikipedia"+i] = {
						      lat: parseFloat(items[i].lat),
						      lng: parseFloat(items[i].lon),
						      draggable: false,
									icon: wikipediaIcon,
									wikipediaItem: items[i]
									//message: "<div ng-include src=\"'templates/wikidata-map-item-template.html'\"></div>",
									//message: items[i].qLabel.value,
						    };
							}

							Wiki.geoQueryCommons(bounds.getSouthWest(), bounds.getNorthEast(), function(data) {
								console.log(data);

								var items = data.query.geosearch;

								var commonsIcon = {
									iconUrl: 'img/commons.png',
									iconSize: [25, 32],
									iconAnchor: [12, 16]
								}

								for (var i = 0; i < items.length; i++) {
							    markers["commons"+i] = {
							      lat: parseFloat(items[i].lat),
							      lng: parseFloat(items[i].lon),
							      draggable: false,
										icon: commonsIcon,
										commonsItem: items[i]
										//message: "<div ng-include src=\"'templates/wikidata-map-item-template.html'\"></div>",
										//message: items[i].qLabel.value,
							    };
								}

								angular.extend($scope, {
									markers: markers
								});

								$scope.mapControllerData.WikiItemsShown = true;
							});
						});
					});
				});
			}
			else {
				angular.extend($scope, {
					markers: {}
				});
			}
			// if (AppSettings.shouldShowWikipediaOnMap()) {
			// }
			// else {
			// 	// TODO
			// }
			// if (AppSettings.shouldShowCommonsOnMap()) {
			// 	// TODO
			// }
			// else {
			// 	// TODO
			// }
		}
		else {
			angular.extend($scope, {
				markers: {}
			});
			$scope.mapControllerData.WikiItemsShown = false;
		}
	}

	$scope.updatePhotoMapLayer = function() {
		if (AppSettings.shouldShowUserPhotos()) {

			leafletData.getMap().then(function(map) {
				var gallery = PhotoGallery.getGallery();
       	//console.log(gallery);

       // 	var markers = {};
				//
       // 	// TODO show photos on the map if in view
       // 	for (var i = 0; i < gallery.photos.length; i++) {
        //  	markers["m" + i] = {
				// 		lat: gallery.photos[i].location.coords.latitude,
        //     lng: gallery.photos[i].location.coords.longitude,
        //     icon: photoIcon,
        //     photoID: gallery.photos[i].photoID
				// 	}
				// }
				//
				// angular.extend($scope, {
				// 	markers: markers
				// });

				photoLayer = L.photo.cluster().on('click', function (evt) {
					// var photo = evt.layer.photo,
					// 	template = '<img src="{url}"/></a><p>{caption}</p>';
					//
					console.log(evt);
					// 	evt.layer.bindPopup(L.Util.template(template, photo), {
					// 		className: 'leaflet-popup-photo',
					// 		minWidth: 400
					// 	}).openPopup();

					if (evt.layer != undefined) {
						$state.go("tab.photo-detail", { photoID: evt.layer.photo.photoID });
					}
				});

				//console.log(map);
				var gallery = PhotoGallery.getGallery();
				var photos = [];

				// TODO show photos on the map if in view
				for (var i = 0; i < gallery.photos.length; i++) {
					var urlParts = gallery.photos[i].photoURL.split("/");
					photos.push({
								lat: gallery.photos[i].location.coords.latitude,
								lng: gallery.photos[i].location.coords.longitude,
								url: gallery.photos[i].photoURL,
								caption: urlParts[urlParts.length-1],
								thumbnail: gallery.photos[i].photoURL,
								photoID: gallery.photos[i].photoID
					});
				}
				photoLayer.add(photos).addTo(map);
			});
		}
		else if (photoLayer != null){
			// angular.extend($scope, {
			// 	markers: {}
			// });

			leafletData.getMap().then(function(map) {
				map.removeLayer(photoLayer);
			});
		}
	}

	$scope.goTo = function() {
		$scope.center  = {
			  lat : 61.5,
			  lng : 23.766667,
			  zoom : 12
			};
	}

	//$scope.goTo();

	$scope.locateMe = function() {
		console.log("in locateMe");
		//$scope.tiles = tilesDict.openstreetmap;
		$scope.locate();
	}

	$scope.locate = function(){
		console.log("in locate");
		$cordovaGeolocation
		  .getCurrentPosition()
		  .then(function (position) {
				console.log(position);
				console.log($scope);
		    $scope.center.lat = position.coords.latitude;
		    $scope.center.lng = position.coords.longitude;
		    $scope.center.zoom = 18;

				var markers = {};
		    markers.now = {
		      lat:position.coords.latitude,
		      lng:position.coords.longitude,
		      //message: "You Are Here",
		      focus: true,
		      draggable: false
		    };

				angular.extend($scope, {
				 	markers: markers
				});

		  }, function(err) {
		    // error
		    console.log("Location error!");
		    console.log(err);
		  });
	};

	$scope.findOSMObjects = function() {
		console.log("in findOSMObjects");
		var onEachFeature = function (feature, layer) {
			layer.on({
        click: function() {
          //console.log("geojson feature clicked");
					// var title = feature.properties.type.charAt(0).toUpperCase() +
					// 	feature.properties.type.slice(1) + " " +
					// 	feature.properties.id;
					//console.log(feature);
					//console.log($scope);
					$scope.mapControllerData.selectedFeature = feature;
					//console.log($scope);
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

					$scope.mapControllerData.changesToSave = false; // TODO could ask saving previous changes before selecting this new feature...
					$scope.$apply();
					// TODO populate Wiki search form with the data
					$ionicSideMenuDelegate.toggleRight(true);
				}
			});
		}

		var styleFeature = function (feature) {

			var style = {};

			if (feature.properties.type == "way") {
				if (feature.properties.tags != undefined) {
					if (feature.properties.tags.wikipedia != undefined) {
						style.color = osmColors.wiki;
						console.log(style);
					}
					else if (feature.properties.tags.building != undefined) {
						style.color = osmColors.building;
					}
					else if ((feature.properties.tags.leisure != undefined && feature.properties.tags.leisure == "park") ||
						(feature.properties.tags.leisure != undefined && feature.properties.tags.leisure == "playground") ||
						(feature.properties.tags.landuse != undefined && feature.properties.tags.landuse == "grass")
						) {
						style.color = osmColors.leisure;
					}
					else if (feature.properties.tags.highway != undefined ||
						(feature.properties.tags.amenity != undefined && feature.properties.tags.amenity == "parking")
						) {
						style.color = osmColors.highway;
					}
					else {
						style.color = osmColors.unspecified_way;
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
			    fillColor: osmColors.nodes,
			    color: "#000",
			    weight: 1,
			    opacity: 1,
			    fillOpacity: 0.4
			};

			if (feature.properties.tags != undefined) {
				if (feature.properties.tags.wikipedia != undefined) {
					geojsonMarkerOptions.fillColor = osmColors.wiki;
				}
			}

			return L.circleMarker(latlng, geojsonMarkerOptions);
		}

		var addOverpassDataToMap = function(data) {

			$scope.mapControllerData.OSMElementsShown = true;

			var geoJson = osmtogeojson(data);
			console.log(geoJson);

			leafletData.getMap().then(function(map) {
				osmGeoJsonLayer = L.geoJson(geoJson, {
					style: styleFeature,
					pointToLayer: pointToLayer,
					onEachFeature: onEachFeature
				}).addTo(map);
			});
		}

		if (!$scope.mapControllerData.OSMElementsShown) {
			addOverpassDataToMap(overpass_test_data);
		}
		else {
			leafletData.getMap().then(function(map) {
				map.removeLayer(osmGeoJsonLayer);
				$scope.mapControllerData.OSMElementsShown = false;
			});
		}

		// data = "[out:json];(node(around:" + AppSettings.getOSMSearchRadius() + "," + $scope.center.lat + "," + $scope.center.lng + ");<;);out meta;";
		// $http.get('http://www.overpass-api.de/api/interpreter?data=' + data)
		// 	.success(function(data, status, headers,config){
		//       console.log('data success');
		//       //console.log(data); // for browser console
		//       //$scope.mapControllerData.overpassResult = data; // for UI
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
