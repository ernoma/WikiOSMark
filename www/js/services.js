angular.module('starter.services', [])

.factory('AppSettings', function($window) {
  var settingsService = {
    getDefaultLanguage: function() {
      return $window.localStorage["defaultLanguage"] || "en";
    },
    setDefaultLanguage: function(language) {
      $window.localStorage["defaultLanguage"] = language;
    },
    shouldShowUserPhotos: function() {
      if ($window.localStorage["showUserPhotos"] != undefined) {
        return JSON.parse($window.localStorage["showUserPhotos"]);
      }
      else {
        return true;
      }
    },
    setShowUserPhotos: function(value) {
      $window.localStorage["showUserPhotos"] = JSON.stringify(value);
    }
    // set: function(key, value) {
		//   $window.localStorage[key] = value;
		// },
		// get: function(key, defaultValue) {
		//   return $window.localStorage[key] || defaultValue;
		// },
		// setObject: function(key, value) {
		//   $window.localStorage[key] = JSON.stringify(value);
		// },
		// getObject: function(key) {
		//   return JSON.parse($window.localStorage[key] || '{}');
		// }
  }
  return settingsService;
})

.factory('GeoLocation', function() {
  navigator.geolocation.watchPosition(onLocationWatchSuccess, onLocationWatchError, { maximumAge: 10000, enableHighAccuracy: true });

  var currentPosition = null;

  function onLocationWatchSuccess(position) {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
    currentPosition = position;

		//console.log("Latitude : " + latitude + " Longitude: " + longitude);

	}
	function onLocationWatchError(err) {
		if (err.code == 1) {
			console.log("Error: Access is denied!");
		}
		else if ( err.code == 2) {
			console.log("Error: Position is unavailable!");
		}
	}

  var locationService = {
    getCurrentPosition: function() {
      return currentPosition;
    }
  }
  return locationService;
})

.factory('PhotoGallery', function($window) {
    var photoGalleryService = {
      addPhoto: function(imageURL, location) {
        var photoGallery = null;
        if ($window.localStorage["photoGallery"] != undefined) {
           photoGallery = JSON.parse($window.localStorage["photoGallery"]);
        }
        else {
          photoGallery = {
            photos: []
          }
        }
        photoGallery.photos.push({
          photoID: photoGallery.photos.length,
          photoURL: imageURL,
          location: location
        });
        $window.localStorage["photoGallery"] = JSON.stringify(photoGallery);
      },
      getGallery: function() {
        return photoGallery = JSON.parse($window.localStorage["photoGallery"]);
      }
    }
    return photoGalleryService;
})

.factory('Wiki', function($http) {
  var wikiService = {
    getWikidataProperties: function(lang) {

      var promise = $http.get('data/wikidata_properties/' + lang + '.json').success(function(response){
        //console.log(response);
        return response.data;
      });

      return promise;
    },
    showWikidataPage: function(identifier) {
      var URL = "https://www.wikidata.org/wiki/" + identifier;
      window.open(URL, '_system', 'location=yes');
    },
    showWikipediaPage: function(identifier) {
      var URL = "https://";
      var parts =  identifier.split(":");
      URL += parts[0] + ".wikipedia.org/wiki/" + parts[1];
      window.open(URL, '_system', 'location=yes');
    },
    showWikimediaCommonsPage: function(identifier) {
      var URL = "https://commons.wikimedia.org/wiki/" + identifier;
      window.open(URL, '_system', 'location=yes');
    },
    queryMediaWiki: function(site, language, searchText, callback) {
      //console.log(searchText);

  		var url = "https://";

  		if (site == "wikipedia") {
  			url += language;
  			url += ".wikipedia.org/w/api.php?action=opensearch";
  			url += "&limit=" + 50;
  			url += "&search=" + searchText;

  		}
  		else if (site == "wikidata") {
  			url = wdk.searchEntities({
  				search: searchText,
  				language: language,
  				limit: 50
  				});
  		}
  		else { // site == commons
  			url += "commons.wikimedia.org/w/api.php?action=opensearch";
  			url += "&limit=" + 50;
  			url += "&search=" + searchText;
  		}

  		url += "&callback=JSON_CALLBACK";

  		$http.jsonp(url).
  		  success(callback)
  		  .error(function (data) {
  		  	console.log('data error');
  		    console.log(data);
  		  });
    },
  };
  return wikiService;
})

.factory('OpenStreetMap', function($http) {

  var auth = osmAuth({
    oauth_consumer_key: osm_oauth_data.oauth_consumer_key,
    oauth_secret: osm_oauth_data.oauth_secret,
    url: osm_oauth_data.url,
    landing: osm_oauth_data.landing,
    singlepage: true,
    auto: true // show a login form if the user is not authenticated and
              // you try to do a call
  });

  var x2js = new X2JS();
  //var serializer = new XMLSerializer();

  var userDetails = null;

  // var createNodeElement = function() {
  //   var elementXMLString = '';//'<?xml version="1.0" encoding="UTF-8"?>';
  //   elementXMLString += '<osm><' + osmObject.properties.type + ' changeset="' + changesetID + '" visible="true" lon="' + osmObject.geometry.coordinates[0] + '" lat="' + osmObject.geometry.coordinates[1] + '">';
  //   elementXMLString += '<tag k="name" v="Joutsenet"/><tag k="name:en" v="Swans"/><tag k="name:fi" v="Joutsenet"/><tag k="tourism" v="artwork"/>';
  //   for (var key in tags) {
  //     if (tags[key] != null && tags[key] != "") {
  //       elementXMLString += '<tag k="' + key + '"' + ' v="' + tags[key] + '"/>';
  //     }
  //   }
  //   elementXMLString += '</' + osmObject.properties.type + '></osm>';
  //   console.log(elementXMLString);
  //
  //   auth.xhr({
  //     method: 'PUT',
  //     path: '/api/0.6/' + osmObject.properties.type + "/create",
  //     content: elementXMLString,
  //     options: {
  //       header: {
  //         //"Content-Type": 'application/x-www-form-urlencoded'
  //       }
  //     }
  //   }, function(err, response) {
  //     if (err != null) {
  //       console.log("error creating element");
  //       console.log(err);
  //     }
  //     else {
  //       // TODO
  //       var elementID = 4305115206;//response;
  //     }
  //   });
  // }

  var OpenStreetMapService = {
    getUserDetails: function (callback) {
      //auth.authenticate(authCallback);
      if (userDetails == null) {
        auth.xhr({
          method: 'GET',
          path: '/api/0.6/user/details'
        }, function(err, details) {
          //console.log("done");
            // details is an XML DOM of user details
            //console.log(details);
            userDetails = details;
            callback(userDetails);
        });
      }
      else {
        callback(userDetails);
      }
    },
    logout: function () {
      auth.logout();
    },
    authenticated: function() {
      return auth.authenticated();
    },
    getPermissions: function() {
      auth.xhr({
        method: 'GET',
        path: '/api/0.6/permissions'
      }, function(err, response) {
        console.log(err);
        console.log(response);
      });
    },
    updateElementTags: function(osmObject, changesetComment, tags) {
      // Open changeset, create xml, update data, close changeset

      console.log(osmObject);
      console.log(changesetComment);
      console.log(tags);

      var changesetXMLString = '';//'<?xml version="1.0" encoding="UTF-8"?>';
      changesetXMLString += '<osm><changeset><tag k="created_by" v="WikiOSMark 0.1"/>';
      changesetXMLString += '<tag k="comment" v="' + changesetComment + '"/>';
      changesetXMLString += '</changeset></osm>';

      console.log("creating changeset");
      auth.xhr({
        method: 'PUT',
        path: '/api/0.6/changeset/create',
        content: changesetXMLString,
        options: {
          header: {
          }
        }
      }, function(err, response) {
        console.log(response);
        if (err != null) {
          console.log("error creating changeset");
          console.log(err);
        }
        else {
          var changesetID = response;

          // TODO get the element to update
          console.log("getting the OSM element");
          auth.xhr({
            method: 'GET',
            path: '/api/0.6/' + osmObject.properties.type + "/" + osmObject.properties.id // node/4305115206
          }, function(err, response) {
            if (err != null) {
              console.log("error getting OSM element");
              console.log(err);
            }
            else {
              console.log(response);
              // TODO: make the actual update

              var jsonObj = x2js.xml_str2json( response.getElementsByTagName("osm")[0].innerHTML );
              console.log(jsonObj);

              var elementXMLString = '';//'<?xml version="1.0" encoding="UTF-8"?>';
              if (osmObject.properties.type == 'node') {
                elementXMLString += '<osm><' +
                  osmObject.properties.type +
                  ' changeset="' + changesetID +
                  '" id="' + jsonObj.node._id +
                  '" visible="' + jsonObj.node._visible +
                  '" lon="' + jsonObj.node._lon +
                  '" lat="' + jsonObj.node._lat +
                  '" version="' + jsonObj.node._version +
                  '">';
              }
              else { // way or relation
                elementXMLString += '<osm><' +
                  osmObject.properties.type +
                  ' changeset="' + changesetID +
                  '" id="' + jsonObj[osmObject.properties.type]._id +
                  '" visible="' + jsonObj[osmObject.properties.type]._visible +
                  '" version="' + jsonObj[osmObject.properties.type]._version +
                  '">';
              }

              if (jsonObj[osmObject.properties.type].tag != undefined) { // TODO: element does not have any tags yet, add wiki keys
                for (var i = 0; i < jsonObj[osmObject.properties.type].tag.length; i++) {
                  if (jsonObj[osmObject.properties.type].tag[i]._k == "wikipedia") {
                    if (tags.wikipedia == null) { // no changes, keep original
                      elementXMLString += '<tag k="' + jsonObj[osmObject.properties.type].tag[i]._k + '"' +
                        ' v="' + jsonObj[osmObject.properties.type].tag[i]._v + '"/>';
                    }
                    else {
                      elementXMLString += '<tag k="' + jsonObj[osmObject.properties.type].tag[i]._k + '"' +
                        ' v="' + tags.wikipedia + '"/>';
                    }
                  }
                  else if (jsonObj[osmObject.properties.type].tag[i]._k == "wikidata") {
                    if (tags.wikidata == null) { // no changes, keep original
                      elementXMLString += '<tag k="' + jsonObj[osmObject.properties.type].tag[i]._k + '"' +
                        ' v="' + jsonObj[osmObject.properties.type].tag[i]._v + '"/>';
                    }
                    else {
                      elementXMLString += '<tag k="' + jsonObj[osmObject.properties.type].tag[i]._k + '"' +
                        ' v="' + tags.wikidata + '"/>';
                    }
                  }
                  else if(jsonObj[osmObject.properties.type].tag[i]._k == "wikimedia_commons") {
                    if (tags.wikimedia_commons == null) { // no changes, keep original
                      elementXMLString += '<tag k="' + jsonObj[osmObject.properties.type].tag[i]._k + '"' +
                        ' v="' + jsonObj[osmObject.properties.type].tag[i]._v + '"/>';
                    }
                    else {
                      elementXMLString += '<tag k="' + jsonObj[osmObject.properties.type].tag[i]._k + '"' +
                        ' v="' + tags.wikimedia_commons + '"/>';
                    }
                  }
                  else {
                    elementXMLString += '<tag k="' + jsonObj[osmObject.properties.type].tag[i]._k + '"' +
                      ' v="' + jsonObj[osmObject.properties.type].tag[i]._v + '"/>';
                  }
                }
              }

              if (osmObject.properties.type == "way" && jsonObj[osmObject.properties.type].nd != undefined) {
                for (var i = 0; i < jsonObj[osmObject.properties.type].nd.length; i++) {
                  elementXMLString += '<nd ref="' + jsonObj[osmObject.properties.type].nd[i]._ref +
                    '"/>';
                }
              }
              else if (osmObject.properties.type == "relation" && jsonObj[osmObject.properties.type].member != undefined) {
                for (var i = 0; i < jsonObj[osmObject.properties.type].member.length; i++) {
                  elementXMLString += '<member ref="' + jsonObj[osmObject.properties.type].member[i]._ref +
                    '"/>';
                }
              }

              elementXMLString += '</' + osmObject.properties.type + '></osm>';
              console.log(elementXMLString);

              console.log("updating OSM element");
              auth.xhr({
                method: 'PUT',
                path: '/api/0.6/' + osmObject.properties.type + "/" + jsonObj.node._id,
                content: elementXMLString,
                options: {
                  header: {
                  }
                }
              }, function(err, response) {
                if (err != null) {
                  console.log("error updating OSM element");
                  console.log(err);
                }
                else {
                  var version = response;
                  console.log(version);
                }

                console.log("closing changeset");
                auth.xhr({
                  method: 'PUT',
                  path: '/api/0.6/changeset/' + changesetID + '/close',
                  options: {
                    header: {
                    }
                  }
                }, function(err, response) {
                  if (err != null) {
                    console.log("error closing changeset");
                    console.log(err);
                  }
                });
              });
            }
          });
        }
      });
    }
  }

  return OpenStreetMapService;

});
