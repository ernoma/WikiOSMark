angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $rootScope) {
  $scope.mainMenuTitle = "Map";
  $scope.sideMenuTitle = "Info";


  //$scope.selectedMapMarker = null;

  $scope.osmObjectInfo = {
    type: "",
    id: "",
    tags: null,
    wikidataTag: null,
    wikipediaTag: null,
    wikimediaCommonsTag: null,
    incompleteGeometry: false,
    wikidataItem: null,
    wikipediaItem: null,
    wikimediaCommonsItem: null,
  }

  $scope.mapControllerData = {
  	selectedFeature: null,
    overpassResult: "",
    changesToSave: false,
    changesetComment: "",
    OSMElementsShown: false,
    WikiItemsShown: false,
    legendShown: false
  }

  $scope.searchResults = {
    //wikidataResults = [{"id":"Q5408372","concepturi":"http://www.wikidata.org/entity/Q5408372","url":"//www.wikidata.org/wiki/Q5408372","title":"Q5408372","pageid":5172585,"label":"Joutsenkaula","description":"Wikimedia disambiguation page","match":{"type":"label","language":"en","text":"Joutsenkaula"}},
    //  {"id":"Q2736937","concepturi":"http://www.wikidata.org/entity/Q2736937","url":"//www.wikidata.org/wiki/Q2736937","title":"Q2736937","pageid":2628927,"label":"Joutsen","description":"Wikipedia disambiguation page","match":{"type":"label","language":"en","text":"Joutsen"}
    //}],
    wikidataResults: null,
    wikipediaResults: null,
    commonsResults: null
  }

  $scope.$on('$stateChangeSuccess',
    function(evt, toState, toParams, fromState, fromParams) {
      $rootScope.currentState = toState.name;
      switch ($rootScope.currentState) {
        case "tab.map":
          $scope.mainMenuTitle = "Map";
          $scope.sideMenuTitle = "OSM Element Info";
          break;
        case "tab.wiki":
          $scope.mainMenuTitle = "Wiki";
          $scope.sideMenuTitle = "";
          break;
        case "tab.settings":
          $scope.mainMenuTitle = "Settings";
          $scope.sideMenuTitle = "";
          break;
        case "tab.info":
          $scope.mainMenuTitle = "Info";
          $scope.sideMenuTitle = "";
          break;
      }
  });
})

.controller('TabCtrl', function($scope, $rootScope, $ionicPopup, $cordovaCamera, GeoLocation, PhotoGallery, Wiki, OpenStreetMap, AppSettings) {
  $scope.runTests = function() {
    // Wiki.createWikiPage("testorienteerix", "hello", "world", function(response) {
    //   console.log(response);
    // });

    // var maplinkText = '<maplink zoom="13" longitude="10.25515" latitude="60.15995" />';
    //
    // Wiki.editWikiPage("testorienteerix", "new", "maplink_test", maplinkText, "Added new section with a maplink", function(response) {
    //   console.log(response);
    // });

    centerCoordinates = {
      lat: 61.498056,
      lng: 23.760833
    }

    // Wiki.addCoordinatesToItem("wikidata", "Q11861126", centerCoordinates, function(response) {
    //   console.log(response);
    // });

    Wiki.addCoordinatesToItem("wikipedia", "Testorienteerix", centerCoordinates, function(response) {
      console.log(response);
    });
  }

  $scope.showOSMObjects = function() {
    //console.log("in TabCtrl");
    $scope.$broadcast('showOSMObjects');
  }
  $scope.updateWikiLayers = function() {
    $scope.$broadcast('updateWikiLayers');
  }
  $scope.locateMe = function() {
    //console.log("in TabCtrl");
    $scope.$broadcast('locateMe');
  }

  $scope.showLegend = function() {
    $scope.$broadcast('showLegend');
  }

  $scope.showOSMObjectPage = function() {
    window.open("https://www.openstreetmap.org/" +
      $scope.osmObjectInfo.type + "/" +
      $scope.osmObjectInfo.id,
      '_system', 'location=yes');
  }

  $scope.inputWikidataChange = function() {
		// search and suggest options when 2 or more characters in the input field
		$scope.mapControllerData.changesToSave = true;
		if ($scope.osmObjectInfo.wikidataTag.length >= 2) {
			Wiki.queryMediaWiki("wikidata", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikidataTag, function(data) {
					//console.log(data);
					$scope.searchResults.wikidataResults = data.search;
			});
		}
		else if ($scope.osmObjectInfo.wikidataTag.length == 0) {
			$scope.searchResults.wikidataResults = "";
      $scope.osmObjectInfo.wikidataTag == null;
      $scope.osmObjectInfo.wikidataItem = null;
		}
	}

	$scope.inputWikipediaChange = function() {
		// search and suggest options when enought characters in the input field
		$scope.mapControllerData.changesToSave = true;
		if ($scope.osmObjectInfo.wikipediaTag.includes(":")) {
			if ($scope.osmObjectInfo.wikipediaTag.length >= 6) {
				var parts = $scope.osmObjectInfo.wikipediaTag.split(":");
				if (parts.length > 1) {
					Wiki.queryMediaWiki("wikipedia", parts[0], parts[1], function(data) {
							//console.log(data);
							$scope.searchResults.wikipediaResults = data[1];
					});
				}
			}
		}
		else if ($scope.osmObjectInfo.wikipediaTag.length >= 3) {
			Wiki.queryMediaWiki("wikipedia", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikipediaTag, function(data) {
					//console.log(data);
					$scope.searchResults.wikipediaResults = data[1];
			});
		}
		else if ($scope.osmObjectInfo.wikipediaTag.length == 0) {
			$scope.searchResults.wikipediaResults = "";
      $scope.osmObjectInfo.wikipediaTag == null;
      $scope.osmObjectInfo.wikipediaItem = null;
		}
	}

	$scope.inputCommonsChange = function() {
		// TODO search and suggest options when 3 or more characters in the input field
		$scope.mapControllerData.changesToSave = true;
		$scope.commonsResults = null;
		if ($scope.osmObjectInfo.wikimediaCommonsTag.length >= 3) {
			Wiki.queryMediaWiki("commons", AppSettings.getDefaultLanguage(), $scope.osmObjectInfo.wikimediaCommonsTag, function(data) {
					console.log(data);
					$scope.searchResults.commonsResults = data[1];
			});
		}
		else if ($scope.osmObjectInfo.wikimediaCommonsTag.length == 0) {
			$scope.searchResults.commonsResults = "";
      $scope.osmObjectInfo.wikimediaCommonsTag == null;
      $scope.osmObjectInfo.wikimediaCommonsItem = null;
		}
	}

	$scope.selectWikidataSearchResult = function(item) {
		$scope.osmObjectInfo.wikidataTag = item.label + " (" + item.id + ")";
    Wiki.getItemWithCoordinates("wikidata", item.id, function (result) {
        $scope.osmObjectInfo.wikidataItem = result;
        //$scope.osmObjectInfo.wikimediaCommonsCoordinates = coordinates;
    });
		$scope.searchResults.wikidataResults = null;
		// TODO: update wikipedia and commons tags if they can be found via Wiki search
	}

	$scope.selectWikipediaSearchResult = function(item) {
		if ($scope.osmObjectInfo.wikipediaTag.includes(":") && !item.includes(":")) {
			$scope.osmObjectInfo.wikipediaTag = $scope.osmObjectInfo.wikipediaTag.split(":")[0] + ":" + item;
		}
		else {
			$scope.osmObjectInfo.wikipediaTag = item;
		}
    Wiki.getItemWithCoordinates("wikipedia", $scope.osmObjectInfo.wikipediaTag, function (result) {
        $scope.osmObjectInfo.wikipediaItem = result;
        //$scope.osmObjectInfo.wikimediaCommonsCoordinates = coordinates;
    });
		$scope.searchResults.wikipediaResults = null;
		// TODO: update wikidata tag if it can be found via Wiki search
	}

	$scope.selectCommonsSearchResult = function(item) {
		$scope.osmObjectInfo.wikimediaCommonsTag = item;
    Wiki.getItemWithCoordinates("commons", item, function (result) {
        $scope.osmObjectInfo.wikimediaCommonsItem = result;
        //$scope.osmObjectInfo.wikimediaCommonsCoordinates = coordinates;
    });
		$scope.searchResults.commonsResults = null;
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

  $scope.addCoordinatesToWikidataItem = function() {
    // TODO add claim
    console.log($scope.mapControllerData.selectedFeature);
    var centerCoordinates = undefined;

    if ($scope.mapControllerData.selectedFeature.properties.type == "way") {
      centerCoordinates = calculateCenterCoordinates($scope.mapControllerData.selectedFeature.properties.type, $scope.mapControllerData.selectedFeature.geometry.coordinates[0]);
    }
    else if ($scope.mapControllerData.selectedFeature.properties.type == "relation") {
      centerCoordinates = calculateCenterCoordinates($scope.mapControllerData.selectedFeature.properties.type, $scope.mapControllerData.selectedFeature.geometry.coordinates); // may be multipolygon; may contain also other relations?
    }
    else { // node
      centerCoordinates = calculateCenterCoordinates($scope.mapControllerData.selectedFeature.properties.type, $scope.mapControllerData.selectedFeature.geometry.coordinates);
    }

    console.log($scope.osmObjectInfo.wikidataItem.pageTitle);
    console.log(centerCoordinates);
    // Wiki.addCoordinatesToItem("wikidata", $scope.osmObjectInfo.wikidataItem.pageTitle, centerCoordinates, function(response) {
    //   console.log(response);
    // });
  }
  $scope.addCoordinatesToWikipediaItem = function() {
    // TODO https://blog.wikimedia.org/2013/01/31/geodata-a-new-age-of-geotagging-on-wikipedia/ & https://www.mediawiki.org/wiki/Extension:GeoData
  }
  // $scope.addCoordinatesToCommonsItem = function() {
  //   // TODO https://commons.wikimedia.org/wiki/Commons:Geocoding
  // }

  var calculateCenterCoordinates = function(type, coordinates) {
    console.log(coordinates);
    var centerCoordinates = {
      lat: undefined,
      lng: undefined
    }

    if (type == "way") {

    }
    else if (type == "relation") {
      // may be multipolygon; may contain also other relations?
    }
    else { // node
      centerCoordinates.lat = $scope.mapControllerData.selectedFeature.coordinates[1];
      centerCoordinates.lng = $scope.mapControllerData.selectedFeature.coordinates[0];
    }

    return centerCoordinates;
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

  $scope.takePhoto = function() {
    var options = {
      quality: 75,
      allowEdit: true,
      correctOrientation: true,
      saveToPhotoAlbum: true
    }

    storePhoto("https://upload.wikimedia.org/wikipedia/commons/8/85/Tesoman_palloiluhalli.jpg");
    //$cordovaCamera.getPicture(options).then(storePhoto, function(err) {
    //  console.log(err);
    //});
  }

  var storePhoto = function(imageURL) {
    // Get location, store photo and location to the localStorage, and view to user (on map, etc.)

    console.log(imageURL); //file:///storage/emulated/0/Android/data/com.ionicframework.wikiosmark921578/cache/1476208863949.jpg
    var position = GeoLocation.getCurrentPosition();
    console.log(position);

    PhotoGallery.addPhoto(imageURL, position);

    $scope.$broadcast('photoAdded');
  }
})

.controller('InfoCtrl', function($scope) {

});
