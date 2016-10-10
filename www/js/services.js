angular.module('starter.services', [])

.factory('AppSettings', function($window) {
  var settingsService = {
    getDefaultLanguage: function() {
      return $window.localStorage["defaultLanguage"] || "en";
    },
    setDefaultLanguage: function(language) {
      $window.localStorage["defaultLanguage"] = language;
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

  var serializer = new XMLSerializer();

  var userDetails = null;

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
      // TODO: create xml, open changeset, update data, close changeset
      // TODO: also check if a wiki tag should be deleted
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
            //"Content-Type": 'application/x-www-form-urlencoded'
          }
        }
      }, function (err, response) {
          console.log(response);
          if (err != null) {
            console.log("error creating changeset");
            console.log(err);
          }
          else {
            var changesetID = response;

            // TODO make the actual change

            console.log("closing changeset");
            auth.xhr({
              method: 'PUT',
              path: '/api/0.6/changeset/' + changesetID + '/close',
              options: {
                header: {
                  //"Content-Type": 'application/x-www-form-urlencoded'
                }
              }
            }, function (err, response) {
              if (err != null) {
                console.log("error creating changeset");
                console.log(err);
              }
          });
        }
      });
    }
  }

  return OpenStreetMapService;

});
