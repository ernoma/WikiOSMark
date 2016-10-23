
var mapControllers = angular.module('mapControllers', [])

.controller('MapCtrl', function($scope, $rootScope, $state, $timeout, $cordovaGeolocation, $http, leafletData, leafletMapEvents, leafletMarkerEvents, leafletBoundsHelpers, $ionicSideMenuDelegate, OpenStreetMap, Wiki, AppSettings, GeoLocation, PhotoGallery, Wheelmap) {

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

	var wheelmapLayer = null;
	var photoLayer = null;
	var flickrPhotoLayer = null;
	var mapillaryPhotoLayer = null;
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

		$scope.showPhotoMapLayer();
		$scope.showWheelmapLayer();
	});

	//
	// Event handlers
	//

	$scope.$on( "locateMe", function( event ) {
		$scope.locateMe();
	});

	$scope.$on( "updateAllMapLayers", function( event ) {
		console.log(event);
		$scope.updateOSMObjects();
		$scope.updatePhotoMapLayer();
		$scope.updateWikiLayers();
		$scope.updatFlickrLayer();
		$scope.updateMapillaryLayer();
		$scope.updateWheelmapLayer();
	});

	$scope.$on( "showOSMObjects", function( event ) {
		console.log(event);
		$scope.showOSMObjects();
	});
	$scope.$on( "photoAdded", function ( event ) {
		$scope.updatePhotoMapLayer();
	});
	$scope.$on( "showWikiLayers", function( event ) {
		$scope.showWikiLayers();
	});
	$scope.$on( "showFlickrPhotos", function (event) {
		$scope.showFlickrPhotos();
	});
	$scope.$on( "showMapillaryPhotos", function (event) {
		$scope.showMapillaryPhotos();
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
	$scope.$on("$ionicView.enter", function(event, data){
   	// handle event
   	//console.log(event);
		//console.log(data);

	});
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

				// TODO: 1. Wiki.queryMediaWiki,
				// 2. populate WikiDetailCtrl $scope data,
				// 2.1. include maplink and mapframe as suggested additions to the page and
				// 3. show wiki-detail page

				//tab.wiki-detail

				if (args.modelName.includes("wikipedia")) {
					$state.go("tab.wiki-detail", { wikiId: AppSettings.getDefaultLanguage() + "wikipedia+" + args.model.wikipediaItem.title, coordinates: "" + args.model.lat + "|" + args.model.lng});
				}
				else if (args.modelName.includes("wikidata")) {
					var qURLparts = args.model.wikidataItem.q.value.split("/");
					$state.go("tab.wiki-detail", { wikiId: AppSettings.getDefaultLanguage() + "wikidata+" + qURLparts[qURLparts.length-1], coordinates: "" + args.model.lat + "|" + args.model.lng});
				}
				else if (args.modelName.includes("commons")) {
					$state.go("tab.wiki-detail", { wikiId: AppSettings.getDefaultLanguage() + "commons+" + args.model.commonsItem.title, coordinates: "" + args.model.lat + "|" + args.model.lng});
				}

				//Wiki.createWikiPage("testorienteerix", "hello", "world", function(response) {
				//	console.log(response);
				//});

			}
			//$state.go("tab.photo-detail", { photoID: args.model.photoID });
	});

	//
	// Methods
	//

	$scope.updateOSMObjects = function() {

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
							Wiki.getItemWithCoordinates("wikipedia", feature.properties.tags[key], function (item) {
									$scope.osmObjectInfo.wikipediaItem = item;
							});
						}
						else if (key == "wikidata") {
							$scope.osmObjectInfo.wikidataTag = feature.properties.tags[key];
							Wiki.getItemWithCoordinates("wikidata", feature.properties.tags[key], function (item) {
									$scope.osmObjectInfo.wikidataItem = item;
							});
						}
						else if (key == "wikimedia_commons") {
							$scope.osmObjectInfo.wikimediaCommonsTag = feature.properties.tags[key];
							Wiki.getItemWithCoordinates("commons", feature.properties.tags[key], function (item) {
									$scope.osmObjectInfo.wikimediaCommonsItem = item;
							});
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
						//console.log(style);
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
			var geoJson = osmtogeojson(data);
			console.log(geoJson);

			leafletData.getMap().then(function(map) {
				if (osmGeoJsonLayer != null) {
					map.removeLayer(osmGeoJsonLayer);
				}
				$scope.mapControllerData.selectedFeature = null;
				osmGeoJsonLayer = L.geoJson(geoJson, {
					style: styleFeature,
					pointToLayer: pointToLayer,
					onEachFeature: onEachFeature
				}).addTo(map);
			});
		}

		if ($scope.mapControllerData.OSMElementsShown) {
			addOverpassDataToMap(overpass_test_data);
			// data = "[out:json];(node(around:" + AppSettings.getOSMSearchRadius() + "," + $scope.center.lat + "," + $scope.center.lng + ");<;);out meta;";
			// $http.get('http://www.overpass-api.de/api/interpreter?data=' + data)
			// .success(function(data, status, headers,config){
			// 	console.log('data success');
			// 	//console.log(data); // for browser console
			// 	//$scope.mapControllerData.overpassResult = data; // for UI
			//
			// 	addOverpassDataToMap(data);
			// })
			// .error(function(data, status, headers,config){
			// 	console.log('data error');
			// })
			// .then(function(result){
			// 	//things = result.data;
			// });
		}
	}

	$scope.updatePhotoMapLayer = function() {
		if (AppSettings.shouldShowUserPhotos()) {
			leafletData.getMap().then(function(map) {
				var gallery = PhotoGallery.getGallery();
				//console.log(gallery);

				if (photoLayer != null) {
					map.removeLayer(photoLayer);
				}

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
						$state.go("tab.photo-detail", { source: "camera", photoID: evt.layer.photo.photoID });
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
				//console.log(photos);
				photoLayer.add(photos).addTo(map);
			});
		}
	}
	$scope.updateWikiLayers = function() {
		if ($scope.mapControllerData.WikiItemsShown) {
			angular.extend($scope, {
				markers: {}
			});
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

						if (data.query != undefined) {
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

								if (data.query != undefined) {
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
								}

								angular.extend($scope, {
									markers: markers
								});
							});
						}
					});
				});
			});
		}
	}
	$scope.updatFlickrLayer = function() {
		if ($scope.mapControllerData.flickrPhotosShown) {
			leafletData.getMap().then(function(map) {
				//bbox.min_lng + "," + bbox.min_lat + "," + bbox.max_lng + "," + bbox.max_lat
				var bounds = map.getBounds();
				var bbox = {
					min_lng: bounds.getWest(),
					min_lat: bounds.getSouth(),
					max_lng: bounds.getEast(),
					max_lat: bounds.getNorth()
				}
				console.log(bbox);

				//var data = {"photos":{"page":1,"pages":7528,"perpage":9,"total":"67746","photo":[{"id":"30488776035","owner":"11912988@N02","secret":"8b177af23e","server":"8577","farm":9,"title":"New fresh air is coming #aj20 #aljazeera #aj2016 #great #new_building #aja","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"25.314511","longitude":"51.496547","accuracy":"16","context":0,"place_id":"1yGIw8VUV7NaufVgQA","woeid":"55922532","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm9.staticflickr.com\/8577\/30488776035_8b177af23e_m.jpg","height_s":"240","width_s":"240","url_o":"https:\/\/farm9.staticflickr.com\/8577\/30488776035_b8587a5980_o.jpg","height_o":"1080","width_o":"1080"},{"id":"30401673871","owner":"148301490@N03","secret":"8b415de6f4","server":"8583","farm":9,"title":"Cascade Complex in 2014","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"40.189979","longitude":"44.515442","accuracy":"16","context":0,"place_id":"q62C_I9TULtsfefR","woeid":"2214662","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm9.staticflickr.com\/8583\/30401673871_8b415de6f4_m.jpg","height_s":"140","width_s":"240","url_o":"https:\/\/farm9.staticflickr.com\/8583\/30401673871_ca39cf918e_o.jpg","height_o":"432","width_o":"742"},{"id":"30432059555","owner":"51065046@N05","secret":"a0ec7322ee","server":"8267","farm":9,"title":"Enter the Lotfollah","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"32.657222","longitude":"51.678888","accuracy":"16","context":0,"place_id":"TBWrXzFTUL.szzcA","woeid":"2254572","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm9.staticflickr.com\/8267\/30432059555_a0ec7322ee_m.jpg","height_s":"240","width_s":"159","url_o":"https:\/\/farm9.staticflickr.com\/8267\/30432059555_bfcbddcd0e_o.jpg","height_o":"4066","width_o":"2699"},{"id":"29800432554","owner":"10485860@N00","secret":"71de4c5727","server":"5632","farm":6,"title":"Sunset","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"22.500121","longitude":"70.182529","accuracy":"16","context":0,"place_id":"68R_3hxQUL9x8wFmbg","woeid":"12586424","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5632\/29800432554_71de4c5727_m.jpg","height_s":"240","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5632\/29800432554_03a07ce9f4_o.jpg","height_o":"1080","width_o":"1080"},{"id":"30427000035","owner":"29436924@N00","secret":"6659d236e9","server":"5507","farm":6,"title":"Physical text...been a while... #visittoabookstore, #irresistibleurgetobuyeverything,  #missthesmell, #withdrawalsymtom, #misstouchingbooks, #goingbacktoebooksisgoingtobetough, #insearchofabirthdaygift, #lovebooks, #bookworm, #MeinKampfisstillabestseller,","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"19.135880","longitude":"72.825680","accuracy":"16","context":0,"place_id":"mY8Xe19YUrKH2eFJ.w","woeid":"90889080","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5507\/30427000035_6659d236e9_m.jpg","height_s":"240","width_s":"192","url_o":"https:\/\/farm6.staticflickr.com\/5507\/30427000035_310b492dc2_o.jpg","height_o":"1350","width_o":"1080"},{"id":"29768381463","owner":"145748390@N03","secret":"04d9aabb93","server":"5339","farm":6,"title":"Table is Set | Scubaspa Maldives","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"3.943295","longitude":"72.881477","accuracy":"16","context":0,"place_id":"AXtOfupTULyWt9gh","woeid":"2268295","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5339\/29768381463_04d9aabb93_m.jpg","height_s":"180","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5339\/29768381463_bd6b431969_o.jpg","height_o":"810","width_o":"1080"},{"id":"30349822616","owner":"145748390@N03","secret":"5efebaa7f1","server":"5576","farm":6,"title":"Fresh for Mojitos | Scubaspa Maldives","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"3.943295","longitude":"72.881477","accuracy":"16","context":0,"place_id":"AXtOfupTULyWt9gh","woeid":"2268295","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5576\/30349822616_5efebaa7f1_m.jpg","height_s":"198","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5576\/30349822616_a6447abc6d_o.jpg","height_o":"889","width_o":"1080"},{"id":"30268537602","owner":"53253289@N03","secret":"6bbb9aea85","server":"5589","farm":6,"title":"20161002_1205_Georgia_Lumia 930_077.jpg","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"41.836408","longitude":"43.389872","accuracy":"16","context":0,"place_id":"UvRj1hVQW7xvzGnD","woeid":"1962649","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5589\/30268537602_6bbb9aea85_m.jpg","height_s":"135","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5589\/30268537602_561bc174ae_o.jpg","height_o":"3024","width_o":"5376"},{"id":"30087727760","owner":"53253289@N03","secret":"2eeba74f41","server":"5641","farm":6,"title":"20160930_1901_Georgia_Lumia 930_096.jpg","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"41.687594","longitude":"44.805524","accuracy":"16","context":0,"place_id":"8IGWCv5QW7yShirL","woeid":"1965878","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5641\/30087727760_2eeba74f41_m.jpg","height_s":"135","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5641\/30087727760_b1f35990c8_o.jpg","height_o":"2701","width_o":"4802"}]},"stat":"ok"}
				PhotoGallery.getFlickrPhotos(bbox, AppSettings.getFlickrPhotoMaxCount(), function(data) {
					console.log(data);
					//console.log(map);
					if (flickrPhotoLayer != null) {
						map.removeLayer(flickrPhotoLayer);
					}

					flickrPhotoLayer = L.photo.cluster().on('click', function (evt) {
						// var photo = evt.layer.photo,
						// 	template = '<img src="{url}"/></a><p>{caption}</p>';
						//
						console.log(evt);
						// 	evt.layer.bindPopup(L.Util.template(template, photo), {
						// 		className: 'leaflet-popup-photo',
						// 		minWidth: 400
						// 	}).openPopup();

						$scope.mapControllerData.selectedFlickrPhoto = {
							lat: evt.layer.photo.lat,
							lng: evt.layer.photo.lng,
							url: evt.layer.photo.url,
							caption: evt.layer.photo.caption,
							thumbnail: evt.layer.photo.thumbnail,
							photoID: evt.layer.photo.photoID
						}

						if (evt.layer != undefined) {
							$state.go("tab.photo-detail", { source: "flickr", photoID: evt.layer.photo.photoID });
						}
					});

					//console.log(map);
					var photos = [];

					var photoArray = data.photos.photo;
					for (var i = 0; i < photoArray.length; i++) {
						photos.push({
									lat: parseFloat(photoArray[i].latitude),
									lng: parseFloat(photoArray[i].longitude),
									url: photoArray[i].url_o,
									caption: photoArray[i].title,
									thumbnail: photoArray[i].url_s,
									photoID: parseInt(photoArray[i].id)
						});
					}
					//console.log(photos);
					flickrPhotoLayer.add(photos).addTo(map);
				});
			});
		}
	}

	$scope.updateMapillaryLayer = function() {
		if ($scope.mapControllerData.mapillaryPhotosShown) {
			leafletData.getMap().then(function(map) {
			//bbox.min_lng + "," + bbox.min_lat + "," + bbox.max_lng + "," + bbox.max_lat
			var bounds = map.getBounds();
			var bbox = {
				min_lng: bounds.getWest(),
				min_lat: bounds.getSouth(),
				max_lng: bounds.getEast(),
				max_lat: bounds.getNorth()
			}
			console.log(bbox);

			//var data = {"photos":{"page":1,"pages":7528,"perpage":9,"total":"67746","photo":[{"id":"30488776035","owner":"11912988@N02","secret":"8b177af23e","server":"8577","farm":9,"title":"New fresh air is coming #aj20 #aljazeera #aj2016 #great #new_building #aja","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"25.314511","longitude":"51.496547","accuracy":"16","context":0,"place_id":"1yGIw8VUV7NaufVgQA","woeid":"55922532","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm9.staticflickr.com\/8577\/30488776035_8b177af23e_m.jpg","height_s":"240","width_s":"240","url_o":"https:\/\/farm9.staticflickr.com\/8577\/30488776035_b8587a5980_o.jpg","height_o":"1080","width_o":"1080"},{"id":"30401673871","owner":"148301490@N03","secret":"8b415de6f4","server":"8583","farm":9,"title":"Cascade Complex in 2014","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"40.189979","longitude":"44.515442","accuracy":"16","context":0,"place_id":"q62C_I9TULtsfefR","woeid":"2214662","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm9.staticflickr.com\/8583\/30401673871_8b415de6f4_m.jpg","height_s":"140","width_s":"240","url_o":"https:\/\/farm9.staticflickr.com\/8583\/30401673871_ca39cf918e_o.jpg","height_o":"432","width_o":"742"},{"id":"30432059555","owner":"51065046@N05","secret":"a0ec7322ee","server":"8267","farm":9,"title":"Enter the Lotfollah","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"32.657222","longitude":"51.678888","accuracy":"16","context":0,"place_id":"TBWrXzFTUL.szzcA","woeid":"2254572","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm9.staticflickr.com\/8267\/30432059555_a0ec7322ee_m.jpg","height_s":"240","width_s":"159","url_o":"https:\/\/farm9.staticflickr.com\/8267\/30432059555_bfcbddcd0e_o.jpg","height_o":"4066","width_o":"2699"},{"id":"29800432554","owner":"10485860@N00","secret":"71de4c5727","server":"5632","farm":6,"title":"Sunset","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"22.500121","longitude":"70.182529","accuracy":"16","context":0,"place_id":"68R_3hxQUL9x8wFmbg","woeid":"12586424","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5632\/29800432554_71de4c5727_m.jpg","height_s":"240","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5632\/29800432554_03a07ce9f4_o.jpg","height_o":"1080","width_o":"1080"},{"id":"30427000035","owner":"29436924@N00","secret":"6659d236e9","server":"5507","farm":6,"title":"Physical text...been a while... #visittoabookstore, #irresistibleurgetobuyeverything,  #missthesmell, #withdrawalsymtom, #misstouchingbooks, #goingbacktoebooksisgoingtobetough, #insearchofabirthdaygift, #lovebooks, #bookworm, #MeinKampfisstillabestseller,","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"19.135880","longitude":"72.825680","accuracy":"16","context":0,"place_id":"mY8Xe19YUrKH2eFJ.w","woeid":"90889080","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5507\/30427000035_6659d236e9_m.jpg","height_s":"240","width_s":"192","url_o":"https:\/\/farm6.staticflickr.com\/5507\/30427000035_310b492dc2_o.jpg","height_o":"1350","width_o":"1080"},{"id":"29768381463","owner":"145748390@N03","secret":"04d9aabb93","server":"5339","farm":6,"title":"Table is Set | Scubaspa Maldives","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"3.943295","longitude":"72.881477","accuracy":"16","context":0,"place_id":"AXtOfupTULyWt9gh","woeid":"2268295","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5339\/29768381463_04d9aabb93_m.jpg","height_s":"180","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5339\/29768381463_bd6b431969_o.jpg","height_o":"810","width_o":"1080"},{"id":"30349822616","owner":"145748390@N03","secret":"5efebaa7f1","server":"5576","farm":6,"title":"Fresh for Mojitos | Scubaspa Maldives","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"3.943295","longitude":"72.881477","accuracy":"16","context":0,"place_id":"AXtOfupTULyWt9gh","woeid":"2268295","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5576\/30349822616_5efebaa7f1_m.jpg","height_s":"198","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5576\/30349822616_a6447abc6d_o.jpg","height_o":"889","width_o":"1080"},{"id":"30268537602","owner":"53253289@N03","secret":"6bbb9aea85","server":"5589","farm":6,"title":"20161002_1205_Georgia_Lumia 930_077.jpg","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"41.836408","longitude":"43.389872","accuracy":"16","context":0,"place_id":"UvRj1hVQW7xvzGnD","woeid":"1962649","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5589\/30268537602_6bbb9aea85_m.jpg","height_s":"135","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5589\/30268537602_561bc174ae_o.jpg","height_o":"3024","width_o":"5376"},{"id":"30087727760","owner":"53253289@N03","secret":"2eeba74f41","server":"5641","farm":6,"title":"20160930_1901_Georgia_Lumia 930_096.jpg","ispublic":1,"isfriend":0,"isfamily":0,"latitude":"41.687594","longitude":"44.805524","accuracy":"16","context":0,"place_id":"8IGWCv5QW7yShirL","woeid":"1965878","geo_is_family":0,"geo_is_friend":0,"geo_is_contact":0,"geo_is_public":1,"url_s":"https:\/\/farm6.staticflickr.com\/5641\/30087727760_2eeba74f41_m.jpg","height_s":"135","width_s":"240","url_o":"https:\/\/farm6.staticflickr.com\/5641\/30087727760_b1f35990c8_o.jpg","height_o":"2701","width_o":"4802"}]},"stat":"ok"}
			PhotoGallery.getMapillaryPhotos(bbox, AppSettings.getMapillaryPhotoMaxCount(), function(data) {
				console.log(data);
				//console.log(map);
				if (mapillaryPhotoLayer != null) {
					map.removeLayer(mapillaryPhotoLayer);
				}

				mapillaryPhotoLayer = L.photo.cluster().on('click', function (evt) {
					// var photo = evt.layer.photo,
					// 	template = '<img src="{url}"/></a><p>{caption}</p>';
					//
					console.log(evt);
					// 	evt.layer.bindPopup(L.Util.template(template, photo), {
					// 		className: 'leaflet-popup-photo',
					// 		minWidth: 400
					// 	}).openPopup();

					$scope.mapControllerData.selectedMapillaryPhoto = {
						lat: evt.layer.photo.lat,
						lng: evt.layer.photo.lng,
						url: evt.layer.photo.url,
						caption: evt.layer.photo.caption,
						thumbnail: evt.layer.photo.thumbnail,
						photoID: evt.layer.photo.photoID
					}

					if (evt.layer != undefined) {
						$state.go("tab.photo-detail", { source: "mapillary", photoID: evt.layer.photo.photoID });
					}
				});

				//console.log(map);
				var photos = [];

				var photoArray = data.ims;
				for (var i = 0; i < photoArray.length; i++) {
					photos.push({
								lat: photoArray[i].lat,
								lng: photoArray[i].lon,
								url: "https://d1cuyjsrcm0gby.cloudfront.net/" + photoArray[i].key + "/thumb-2048.jpg",
								caption: "Photo by " + photoArray[i].user,
								thumbnail: "https://d1cuyjsrcm0gby.cloudfront.net/" + photoArray[i].key + "/thumb-320.jpg",
								photoID: photoArray[i].key
					});
				}
				//console.log(photos);
				mapillaryPhotoLayer.add(photos).addTo(map);
			});
		});
		}
	}

	$scope.updateWheelmapLayer = function() {
		if (AppSettings.shouldShowWheelmapNodesOnMap()) {
			leafletData.getMap().then(function(map) {

				if (wheelmapLayer != null) {
					map.removeLayer(wheelmapLayer);
				}

				var bounds = map.getBounds();
				var bbox = {
					min_lng: bounds.getWest(),
					min_lat: bounds.getSouth(),
					max_lng: bounds.getEast(),
					max_lat: bounds.getNorth()
				}
				//console.log(bbox);

				wheelmapLayer = L.wheelmap.cluster().on('click', function (evt) {
					console.log(evt);

					var nodeType = Wheelmap.getNodeType(evt.layer.node.node_type.id);
					var iconName = null;
					if (nodeType != null) {
						iconName = nodeType.icon;
					}
					else {
						iconName = evt.layer.node.wheelchair + ".png";
					}

					$scope.mapControllerData.selectedWheelmapNode = {
						lat: evt.layer.node.lat,
						lng: evt.layer.node.lng,
						category: evt.layer.node.category,
						node_type: evt.layer.node.node_type,
						caption: evt.layer.node.caption,
						nodeID: evt.layer.node.nodeID,
						wheelchair: evt.layer.node.wheelchair,
						icon: "lib/leaflet-wheelmap/icons/" + evt.layer.node.wheelchair + "/" + iconName
					}

					if (evt.layer != undefined) {
						$state.go("tab.wheelmap-detail", { nodeID: evt.layer.node.nodeID });
					}
				});

				var nodes = [];

				Wheelmap.getNodes(bbox, "yes", Math.ceil(AppSettings.getWheelmapNodesMaxCount() / 4), 1, function(data) {
					//console.log(data);

					for (var i = 0; i < data.nodes.length; i++) {
						var nodeTypeIdentifier = data.nodes[i].node_type.identifier.replace(/_+/g, ' ');
						nodeTypeIdentifier = nodeTypeIdentifier.charAt(0).toUpperCase() + nodeTypeIdentifier.slice(1);
						nodes.push({
									lat: data.nodes[i].lat,
									lng: data.nodes[i].lon,
									category: data.nodes[i].category,
									node_type: data.nodes[i].node_type, //data.nodes[i].photoURL,
									caption: data.nodes[i].name != undefined ? data.nodes[i].name : nodeTypeIdentifier, // TODO look from the node types
									nodeID: data.nodes[i].id,
									wheelchair: data.nodes[i].wheelchair
						});
					}

					Wheelmap.getNodes(bbox, "limited", Math.ceil(AppSettings.getWheelmapNodesMaxCount() / 4), 1, function(data) {
						//console.log(data);

						for (var i = 0; i < data.nodes.length; i++) {
							var nodeTypeIdentifier = data.nodes[i].node_type.identifier.replace(/_+/g, ' ');
							nodeTypeIdentifier = nodeTypeIdentifier.charAt(0).toUpperCase() + nodeTypeIdentifier.slice(1);
							nodes.push({
										lat: data.nodes[i].lat,
										lng: data.nodes[i].lon,
										category: data.nodes[i].category,
										node_type: data.nodes[i].node_type, //data.nodes[i].photoURL,
										caption: data.nodes[i].name != undefined ? data.nodes[i].name : nodeTypeIdentifier, // TODO look from the node types
										nodeID: data.nodes[i].id,
										wheelchair: data.nodes[i].wheelchair
							});
						}

						Wheelmap.getNodes(bbox, "no", Math.ceil(AppSettings.getWheelmapNodesMaxCount() / 4), 1, function(data) {
							//console.log(data);

							for (var i = 0; i < data.nodes.length; i++) {
								var nodeTypeIdentifier = data.nodes[i].node_type.identifier.replace(/_+/g, ' ');
								nodeTypeIdentifier = nodeTypeIdentifier.charAt(0).toUpperCase() + nodeTypeIdentifier.slice(1);
								nodes.push({
											lat: data.nodes[i].lat,
											lng: data.nodes[i].lon,
											category: data.nodes[i].category,
											node_type: data.nodes[i].node_type, //data.nodes[i].photoURL,
											caption: data.nodes[i].name != undefined ? data.nodes[i].name : nodeTypeIdentifier, // TODO look from the node types
											nodeID: data.nodes[i].id,
											wheelchair: data.nodes[i].wheelchair
								});
							}

							Wheelmap.getNodes(bbox, "unknown", Math.ceil(AppSettings.getWheelmapNodesMaxCount() / 4), 1, function(data) {
								//console.log(data);

								//var data = {"conditions":{"page":1,"per_page":28,"format":"json","bbox":"-42.979,46.437,51.68,74.614"},"meta":{"page":1,"num_pages":4202,"item_count_total":117642,"item_count":28},"nodes":[{"name":"The Jeremy Bentham","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"no","node_type":{"id":21,"identifier":"pub"},"lat":51.5235442,"lon":-0.1355991,"id":108042,"category":{"id":2,"identifier":"food"},"street":"University Street","housenumber":"31","city":null,"postcode":null,"website":null,"phone":"020 7387 3033"},{"name":"Duke of Cumberland","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":21,"identifier":"pub"},"lat":51.0244,"lon":-0.726258,"id":262708,"category":{"id":2,"identifier":"food"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Darton","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":12,"identifier":"station"},"lat":53.5879909,"lon":-1.530826,"id":417909,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Hirschgartenallee","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":4,"identifier":"bus_stop"},"lat":48.1527491,"lon":11.5077339,"id":444575,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Adalbert-/Schloßstraße","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":15,"identifier":"tram_stop"},"lat":50.1193072,"lon":8.6445911,"id":559189,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"The Black Rock","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":21,"identifier":"pub"},"lat":53.6828141,"lon":-1.4989677,"id":581475,"category":{"id":2,"identifier":"food"},"street":"Cross Square","housenumber":"19","city":"Wakefield","postcode":null,"website":null,"phone":null},{"name":"Oranienstraße","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":4,"identifier":"bus_stop"},"lat":50.1026389,"lon":8.3990556,"id":586864,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Rhönring","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":15,"identifier":"tram_stop"},"lat":49.8845586,"lon":8.6516548,"id":604697,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Mozartturm","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":15,"identifier":"tram_stop"},"lat":49.8697722,"lon":8.6277147,"id":604795,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"DITIB Sinsheim Fatih Moschee","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":98,"identifier":"place_of_worship"},"lat":49.246026,"lon":8.881004,"id":3530749693,"category":{"id":10,"identifier":"misc"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Albrechtstraße","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":4,"identifier":"bus_stop"},"lat":47.6573481,"lon":9.4553253,"id":2105104,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Mainhausen","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":10,"identifier":"parking"},"lat":50.0031781,"lon":8.9908311,"id":2455376,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Fox and Hounds","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":21,"identifier":"pub"},"lat":52.164493,"lon":-0.5036502,"id":3865117,"category":{"id":2,"identifier":"food"},"street":"Milton Road","housenumber":"1","city":null,"postcode":"MK41 6AP","website":null,"phone":null},{"name":"The Swan","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":96,"identifier":"hotel"},"lat":52.1349288,"lon":-0.4655978,"id":4118139,"category":{"id":9,"identifier":"accommodation"},"street":"High Street","housenumber":"1","city":null,"postcode":"MK40 1RW","website":"http://www.bedfordswanhotel.co.uk/","phone":null},{"name":"STF Vandrarhem Zinkensdamm","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":95,"identifier":"hostel"},"lat":59.3147408,"lon":18.0442868,"id":8082103,"category":{"id":9,"identifier":"accommodation"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":"http://www.vandrarhemmetzinkensdamm.com/","phone":null},{"name":null,"wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":8,"identifier":"fuel"},"lat":46.6838171,"lon":7.6644266,"id":8082505,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Braine-l'Alleud","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":12,"identifier":"station"},"lat":50.6847958,"lon":4.3757651,"id":9779713,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":"http://www.belgianrail.be/fr/gares/recherche-gares/19/braine-l-alleud.aspx","phone":null},{"name":"Henne Mølle Å Badehotel","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":22,"identifier":"restaurant"},"lat":55.7205945,"lon":8.171297,"id":10477163,"category":{"id":2,"identifier":"food"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":"http://www.hennemoelleaa.dk/","phone":"+45 76524000"},{"name":"The Cormorant","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":21,"identifier":"pub"},"lat":50.8387358,"lon":-1.1175237,"id":11009741,"category":{"id":2,"identifier":"food"},"street":"Castle Street","housenumber":"181","city":null,"postcode":"PO16 9QX","website":"www.thecormorant.co.uk","phone":"+44-2392-379374"},{"name":"Heilbronner Straße","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":4,"identifier":"bus_stop"},"lat":51.0101985,"lon":13.701411,"id":11306937,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Nersingen","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":12,"identifier":"station"},"lat":48.4298795,"lon":10.1173108,"id":11420177,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"George Inn","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":21,"identifier":"pub"},"lat":50.6985959,"lon":-1.2953048,"id":11600986,"category":{"id":2,"identifier":"food"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"The Castle Inn","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":21,"identifier":"pub"},"lat":50.6993402,"lon":-1.2977975,"id":11604640,"category":{"id":2,"identifier":"food"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Cask and Crispin","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":21,"identifier":"pub"},"lat":50.6986117,"lon":-1.2988961,"id":11604643,"category":{"id":2,"identifier":"food"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Delitzscher/Essener Straße","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":4,"identifier":"bus_stop"},"lat":51.376082,"lon":12.3841904,"id":12351651,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Dietmannsried","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":12,"identifier":"station"},"lat":47.8128279,"lon":10.2905408,"id":13622060,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Landsberg (Lech) Schule","wheelchair":"limited","wheelchair_description":null,"wheelchair_toilet":"unknown","node_type":{"id":12,"identifier":"station"},"lat":48.0536747,"lon":10.8695596,"id":13796546,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null},{"name":"Lindau Hauptbahnhof","wheelchair":"limited","wheelchair_description":"WC nicht rollstuhlgerecht, überall Schwellen","wheelchair_toilet":"unknown","node_type":{"id":12,"identifier":"station"},"lat":47.544202,"lon":9.6808298,"id":13801901,"category":{"id":1,"identifier":"public_transfer"},"street":null,"housenumber":null,"city":null,"postcode":null,"website":null,"phone":null}]};
								//console.log(data);
								//console.log(wheelmap_nodetypes);

								for (var i = 0; i < data.nodes.length; i++) {
									var nodeTypeIdentifier = data.nodes[i].node_type.identifier.replace(/_+/g, ' ');
									nodeTypeIdentifier = nodeTypeIdentifier.charAt(0).toUpperCase() + nodeTypeIdentifier.slice(1);
									nodes.push({
												lat: data.nodes[i].lat,
												lng: data.nodes[i].lon,
												category: data.nodes[i].category,
												node_type: data.nodes[i].node_type, //data.nodes[i].photoURL,
												caption: data.nodes[i].name != undefined ? data.nodes[i].name : nodeTypeIdentifier, // TODO look from the node types
												nodeID: data.nodes[i].id,
												wheelchair: data.nodes[i].wheelchair
									});
								}

								//console.log(nodes);
								wheelmapLayer.add(nodes).addTo(map);

							});
						});
					});
				});
			});
		}
	}

	$scope.showOSMObjects = function() {
		console.log("in showOSMObjects");

		if (!$scope.mapControllerData.OSMElementsShown) {
			$scope.mapControllerData.OSMElementsShown = true;
			$scope.updateOSMObjects();
		}
		else {
			leafletData.getMap().then(function(map) {
				map.removeLayer(osmGeoJsonLayer);
				$scope.mapControllerData.OSMElementsShown = false;
				$scope.mapControllerData.selectedFeature = null;
			});
		}

		// (node(around:100.0,61.496507,23.781377);<;);out meta; // sorsapuisto
		// (node(around:100.0,61.5,23.766667);<;);out meta; // koskipuisto
	}

	$scope.showPhotoMapLayer = function() {
		if (AppSettings.shouldShowUserPhotos()) {
			$scope.updatePhotoMapLayer();
		}
		else if (photoLayer != null){
			leafletData.getMap().then(function(map) {
				map.removeLayer(photoLayer);
			});
		}
	}

	$scope.showWikiLayers = function() {
		if (!$scope.mapControllerData.WikiItemsShown) {
			$scope.mapControllerData.WikiItemsShown = true;
			$scope.updateWikiLayers();
		}
		else {
			angular.extend($scope, {
				markers: {}
			});
			$scope.mapControllerData.WikiItemsShown = false;
		}
	}

	$scope.showFlickrPhotos = function() {
		if (!$scope.mapControllerData.flickrPhotosShown) {
			$scope.mapControllerData.flickrPhotosShown = true;
			$scope.updatFlickrLayer();
		}
		else if (flickrPhotoLayer != null) {
			leafletData.getMap().then(function(map) {
				map.removeLayer(flickrPhotoLayer);
				$scope.mapControllerData.flickrPhotosShown = false;
			});
		}
	}

	$scope.showMapillaryPhotos = function() {
		if (!$scope.mapControllerData.mapillaryPhotosShown) {
			$scope.mapControllerData.mapillaryPhotosShown = true;
			$scope.updateMapillaryLayer();
		}
		else if (mapillaryPhotoLayer != null) {
			leafletData.getMap().then(function(map) {
				map.removeLayer(mapillaryPhotoLayer);
				$scope.mapControllerData.mapillaryPhotosShown = false;
			});
		}
	}

	$scope.showWheelmapLayer = function() {
		if (AppSettings.shouldShowWheelmapNodesOnMap()) {
			$scope.updateWheelmapLayer();
		}
		else if (wheelmapLayer != null){
			leafletData.getMap().then(function(map) {
				map.removeLayer(wheelmapLayer);
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

		if ($scope.mapControllerData.watchPositionID != -1) {
			GeoLocation.stopWatchPosition($scope.mapControllerData.watchPositionID);
			$scope.mapControllerData.watchPositionID = -1;
		}
		else {
			$scope.locate();
		}
	}

	$scope.locate = function(){
		console.log("in locate");
		$cordovaGeolocation
			.getCurrentPosition()
			.then(function (position) {
				console.log(position);
				console.log($scope);
				$scope.center.lat = parseFloat(position.coords.latitude);
				$scope.center.lng = parseFloat(position.coords.longitude);
				$scope.center.zoom = 18;

				if ($scope.markers == null) {
					var markers = {};
					markers.now = {
						lat: $scope.center.lat,
						lng: $scope.center.lng,
						//message: "You Are Here",
						focus: true,
						draggable: false
					};

					angular.extend($scope, {
						markers: markers
					});
				}
				else {
					$scope.markers.now = {
						lat: $scope.center.lat,
						lng: $scope.center.lng,
						//message: "You Are Here",
						focus: true,
						draggable: false
					};
				}

				$scope.mapControllerData.watchPositionID = GeoLocation.watchPosition($scope.positionUpdated);

			}, function(err) {
				// error
				console.log("Location error!");
				console.log(err);
			});
	}

	$scope.positionUpdated = function(position) {
		//console.log(position);
		$scope.center.lat = parseFloat(position.coords.latitude);
		$scope.center.lng = parseFloat(position.coords.longitude);

		if ($scope.markers == null) {
			var markers = {};
			markers.now = {
				lat: $scope.center.lat,
				lng: $scope.center.lng,
				//message: "You Are Here",
				focus: true,
				draggable: false
			};

			angular.extend($scope, {
				markers: markers
			});
		}
		else {
			$scope.markers.now = {
				lat: $scope.center.lat,
				lng: $scope.center.lng,
				//message: "You Are Here",
				focus: true,
				draggable: false
			};
		}
	}
});
