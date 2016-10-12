
var mapControllers = angular.module('mapControllers', [])

.controller('MapCtrl', function($scope, $rootScope, $cordovaGeolocation, $ionicPopup, $http, leafletData, leafletMapEvents, $ionicSideMenuDelegate, OpenStreetMap, Wiki, AppSettings) {

	//
	// Variables & initialization
	//

	//$scope.wikidataResults = [{"id":"Q5408372","concepturi":"http://www.wikidata.org/entity/Q5408372","url":"//www.wikidata.org/wiki/Q5408372","title":"Q5408372","pageid":5172585,"label":"Joutsenkaula","description":"Wikimedia disambiguation page","match":{"type":"label","language":"en","text":"Joutsenkaula"}},
	//  {"id":"Q2736937","concepturi":"http://www.wikidata.org/entity/Q2736937","url":"//www.wikidata.org/wiki/Q2736937","title":"Q2736937","pageid":2628927,"label":"Joutsen","description":"Wikipedia disambiguation page","match":{"type":"label","language":"en","text":"Joutsen"}
	//}];
	$scope.wikidataResults = null;
	$scope.wikipediaResults = null;
	$scope.commonsResults = null;

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

	angular.extend($scope, {
		tiles: tilesDict.openstreetmap,
		layers: {
			baselayers: {} //tilesDict
		}
	});

	var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	    maxZoom: 20
	});
	var osmCycleLayer = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, , Maps &copy; <a href="http://thunderforest.com/">Thunderforest</a>',
	    maxZoom: 18
	});
	var mapBoxLayer = L.tileLayer('http://{s}.tiles.mapbox.com/v3/' + 'ernoma.i04d787e' + '/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 20
	});
	var bingLayer = new L.BingLayer('Agf7Ot_un-nQxTrh4Vg6bqThCzQ5KH6kF2oLndffl3LlclN5dY3ELe80I6Kkj5Qd', {type: 'AerialWithLabels'});

	var baseMaps = {
			"OpenStreetMap": osmLayer,
			"OpenCycleMap": osmCycleLayer,
			"Bing aerial": bingLayer,
			"MapBox": mapBoxLayer
	}

	angular.element(document).ready(function () {
		leafletData.getMap().then(function(map) {
			//console.log(map);
			L.control.layers(baseMaps).addTo(map);
			map.eachLayer(function (layer) {
				//console.log(layer);
				map.removeLayer(layer);
			});
			map.addLayer(osmLayer);
		});
	});

	//
	// Event handlers
	//

	$scope.$on( "locateMe", function( event ) {
		$scope.locateMe();
	});

	$scope.$on( "findOSMObjects", function( event ) {
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
		console.log("in locateMe");
		//$scope.tiles = tilesDict.openstreetmap;
		$scope.locate();
	}

	$scope.locate = function(){
		console.log("in locate");
		$cordovaGeolocation
		  .getCurrentPosition()
		  .then(function (position) {
				//console.log(position);
				//console.log($scope);
		    $scope.map.center.lat = position.coords.latitude;
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

	$scope.showOSMObjectPage = function() {
		window.open("https://www.openstreetmap.org/" +
			$scope.osmObjectInfo.type + "/" +
			$scope.osmObjectInfo.id,
			'_system', 'location=yes');
	}

	$scope.searchWiki = function() {
		console.log("in searchWiki");
	}

	$scope.showWikidataPage = function() {
		console.log("in showWikidataPage");
		var item = $scope.osmObjectInfo.wikidataTag;
		if ($scope.osmObjectInfo.wikidataTag.includes("(")) {
			var temp = $scope.osmObjectInfo.wikidataTag.split("(")[1];
			item = temp.split(")")[0];
		}
		Wiki.showWikidataPage(item);
	}
	$scope.showWikipediaPage = function() {
		console.log("in showWikipediaPage");
		var item = $scope.osmObjectInfo.wikipediaTag;
		if (!item.includes(":")) {
			item = AppSettings.getDefaultLanguage() + ":" + $scope.osmObjectInfo.wikipediaTag;
		}
		Wiki.showWikipediaPage(item);
	}
	$scope.showCommonsPage = function() {
		console.log("in showCommonsPage");
		Wiki.showWikimediaCommonsPage($scope.osmObjectInfo.wikimediaCommonsTag);
	}

	$scope.inputWikidataChange = function() {
		// TODO search and suggest options when 2 or more characters in the input field
		$scope.mapControllerData.changesToSave = true;
		if ($scope.osmObjectInfo.wikidataTag.length >= 2) {
			Wiki.queryMediaWiki("wikidata", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikidataTag, function(data) {
					//console.log(data);
					$scope.wikidataResults = data.search;
			});
		}
		else if ($scope.osmObjectInfo.wikidataTag.length == 0) {
			$scope.wikidataResults = "";
		}
	}

	$scope.inputWikipediaChange = function() {
		// TODO search and suggest options when enought characters in the input field
		$scope.mapControllerData.changesToSave = true;
		if ($scope.osmObjectInfo.wikipediaTag.includes(":")) {
			if ($scope.osmObjectInfo.wikipediaTag.length >= 6) {
				var parts = $scope.osmObjectInfo.wikipediaTag.split(":");
				if (parts.length > 1) {
					Wiki.queryMediaWiki("wikipedia", parts[0], parts[1], function(data) {
							//console.log(data);
							$scope.wikipediaResults = data[1];
					});
				}
			}
		}
		else if ($scope.osmObjectInfo.wikipediaTag.length >= 3) {
			Wiki.queryMediaWiki("wikipedia", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikipediaTag, function(data) {
					//console.log(data);
					$scope.wikipediaResults = data[1];
			});
		}
		else if ($scope.osmObjectInfo.wikipediaTag.length == 0) {
			$scope.wikipediaResults = "";
		}
	}

	$scope.inputCommonsChange = function() {
		// TODO search and suggest options when 3 or more characters in the input field
		$scope.mapControllerData.changesToSave = true;
		$scope.commonsResults = null;
		if ($scope.osmObjectInfo.wikimediaCommonsTag.length >= 3) {
			Wiki.queryMediaWiki("commons", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikimediaCommonsTag, function(data) {
					//console.log(data);
					$scope.commonsResults = data[1];
			});
		}
		else if ($scope.osmObjectInfo.wikimediaCommonsTag.length == 0) {
			$scope.commonsResults = "";
		}
	}

	$scope.selectWikidataSearchResult = function(item) {
		$scope.osmObjectInfo.wikidataTag = item.label + " (" + item.id + ")";
		$scope.wikidataResults = null;
		// TODO: update wikipedia and commons tags if they can be found via Wiki search
	}

	$scope.selectWikipediaSearchResult = function(item) {
		if ($scope.osmObjectInfo.wikipediaTag.includes(":") && !item.includes(":")) {
			$scope.osmObjectInfo.wikipediaTag = $scope.osmObjectInfo.wikipediaTag.split(":")[0] + ":" + item;
		}
		else {
			$scope.osmObjectInfo.wikipediaTag = item;
		}
		$scope.wikipediaResults = null;
		// TODO: update wikidata tag if it can be found via Wiki search
	}

	$scope.selectCommonsSearchResult = function(item) {
		$scope.osmObjectInfo.wikimediaCommonsTag = item;
		$scope.commonsResults = null;
	}

	$scope.saveWikiTagChanges = function() {
		// TODO somehow ensure that user is logged in before trying to save changes

		// Check
		// 1. if there are changes to the wiki item(s) and if there are
		// 2. verify the changeset comment from the user,
		// 3. call OpenStreetMapService save accordingly ("trim" the UI input values)

		//console.log($scope);
		//console.log($scope.mapControllerData.selectedFeature);
		//console.log($scope.osmObjectInfo.wikidataTag);
		//console.log($scope.osmObjectInfo.wikipediaTag);
		//console.log($scope.osmObjectInfo.wikimediaCommonsTag);

		var changesetCommentPopup = $ionicPopup.show({
	    template: '<input type="text" ng-model="mapControllerData.changesetComment">',
	    title: 'Changeset comment',
	    scope: $scope,
	    buttons: [
	      { text: 'Cancel',
					onTap: function(e) {
						return false;
					}
				},
	      {
	        text: '<b>Save</b>',
	        type: 'button-positive',
	        onTap: function(e) {
	            return true;
	          }
	      }
	    ]
	  });

		var feature = $scope.mapControllerData.selectedFeature;

		var tags = {
			wikidata: null,
			wikipedia: null,
			wikimedia_commons: null,
		};

		$scope.mapControllerData.changesetComment = "Modified ";
		var changeCount = 0;

		if (feature.properties.tags.wikidata != undefined) {
			tags.wikidata = feature.properties.tags.wikidata;
		}
		if (feature.properties.tags.wikipedia != undefined) {
			tags.wikipedia = feature.properties.tags.wikipedia;
		}
		if (feature.properties.tags.wikimediaCommonsTag != undefined) {
			tags.wikimediaCommonsTag = feature.properties.tags.wikimediaCommonsTag;
		}

		var item = $scope.osmObjectInfo.wikidataTag;
		if (item != null && item.includes("(")) {
			var temp = $scope.osmObjectInfo.wikidataTag.split("(")[1];
			item = temp.split(")")[0];
		}
		if (item != feature.properties.tags.wikidata) {
			tags.wikidata = item;
			$scope.mapControllerData.changesetComment += "wikidata";
			changeCount++;
		}

		var item = $scope.osmObjectInfo.wikipediaTag;
		if (item != null && item != "" && !item.includes(":")) {
			item = AppSettings.getDefaultLanguage() + ":" + $scope.osmObjectInfo.wikipediaTag;
		}
		if (item != feature.properties.tags.wikipedia) {
			tags.wikipedia = item;
			if (changeCount > 0) {
				$scope.mapControllerData.changesetComment += ", ";
			}
			$scope.mapControllerData.changesetComment += "wikipedia";
			changeCount++;
		}

		var item = $scope.osmObjectInfo.wikimediaCommonsTag;
		if (item != feature.properties.tags.wikimediaCommonsTag) {
			tags.wikimedia_commons = $scope.osmObjectInfo.wikimediaCommonsTag;
			if (changeCount > 0) {
				$scope.mapControllerData.changesetComment += " and ";
			}
			$scope.mapControllerData.changesetComment += "wikimedia_commons";
			changeCount++;
		}

		$scope.mapControllerData.changesetComment += (changeCount > 1  ? " tags." : " tag.");

		changesetCommentPopup.then(function(res) {
			console.log(res);
			if (res == true) {
				//OpenStreetMap.getPermissions();
				OpenStreetMap.updateElementTags($scope.mapControllerData.selectedFeature, $scope.mapControllerData.changesetComment, tags);
		 	 	$scope.mapControllerData.changesToSave = false;
			}
	  });
	}

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
