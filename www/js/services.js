angular.module('starter.services', [])

.factory('OpenStreetMap', function() {

  var auth = osmAuth({
    oauth_consumer_key: osm_oauth_data.oauth_consumer_key,
    oauth_secret: osm_oauth_data.oauth_secret,
    url: osm_oauth_data.url,
    landing: osm_oauth_data.landing,
    singlepage: true,
    auto: true // show a login form if the user is not authenticated and
              // you try to do a call
  });

  var OpenStreetMapService = {
    getUserDetails: function () {
      //auth.authenticate(authCallback);
      auth.xhr({
        method: 'GET',
        path: '/api/0.6/user/details'
      }, function(err, details) {
        console.log("done");
          // details is an XML DOM of user details
          console.log(details);
      });
    },
    logout: function () {
      auth.logout();
    }
  }

  return OpenStreetMapService;

})

.factory('Wiki', function($http) {
  var wikiService = {
    getWikidataProperties: function(lang) {

      var promise = $http.get('data/wikidata_properties/' + lang + '.json').success(function(response){
        //console.log(response);
        return response.data;
      });

      return promise;
    }
  };
  return wikiService;
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
