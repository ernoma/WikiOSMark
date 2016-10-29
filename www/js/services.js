angular.module('starter.services', [])

.factory('AppSettings', function($window) {
  var settingsService = {
    isFirstStart: function() {
      var firstStart = $window.localStorage["isFirstStart"];
      if (firstStart == undefined) {
        $window.localStorage["isFirstStart"] = false;
        return true;
      }
      return false;
    },
    getDefaultLanguage: function() {
      return $window.localStorage["defaultLanguage"] || "en";
    },
    setDefaultLanguage: function(language) {
      $window.localStorage["defaultLanguage"] = language;
    },
    getOSMSearchRadius: function() {
      if ($window.localStorage["OSMSearchRadius"] != undefined) {
        return JSON.parse($window.localStorage["OSMSearchRadius"]);
      }
      else {
        return 100;
      }
    },
    setOSMSearchRadius: function(value) {
      $window.localStorage["OSMSearchRadius"] = JSON.stringify(value);
    },
    shouldShowWheelmapNodesOnMap: function() {
      if ($window.localStorage["showWheelmapNodesOnMap"] != undefined) {
        return JSON.parse($window.localStorage["showWheelmapNodesOnMap"]);
      }
      else {
        return true;
      }
    },
    setShowWheelmapNodesOnMap: function(value) {
      $window.localStorage["showWheelmapNodesOnMap"] = JSON.stringify(value);
    },
    getWheelmapNodesMaxCount: function() {
      if ($window.localStorage["wheelmapNodesMaxCount"] != undefined) {
        return JSON.parse($window.localStorage["wheelmapNodesMaxCount"]);
      }
      else {
        return 200;
      }
    },
    setWheelmapNodesMaxCount: function(count) {
      $window.localStorage["wheelmapNodesMaxCount"] = JSON.stringify(count);
    },
    shouldShowUserPhotos: function() {
      if ($window.localStorage["showUserPhotos"] != undefined) {
        return JSON.parse($window.localStorage["showUserPhotos"]);
      }
      else {
        return true;
      }
    },
    getFlickrPhotoMaxCount: function() {
      if ($window.localStorage["flickrPhotoMaxCount"] != undefined) {
        return JSON.parse($window.localStorage["flickrPhotoMaxCount"]);
      }
      else {
        return 20;
      }
    },
    setFlickrPhotoMaxCount: function(count) {
      $window.localStorage["flickrPhotoMaxCount"] = JSON.stringify(count);
    },
    getMapillaryPhotoMaxCount: function() {
      if ($window.localStorage["mapillaryPhotoMaxCount"] != undefined) {
        return JSON.parse($window.localStorage["mapillaryPhotoMaxCount"]);
      }
      else {
        return 500;
      }
    },
    setMapillaryPhotoMaxCount: function(count) {
      $window.localStorage["mapillaryPhotoMaxCount"] = JSON.stringify(count);
    },
    setShowUserPhotos: function(value) {
      $window.localStorage["showUserPhotos"] = JSON.stringify(value);
    },
    shouldShowWikidataOnMap: function() {
      if ($window.localStorage["showWikidataOnMap"] != undefined) {
        return JSON.parse($window.localStorage["showWikidataOnMap"]);
      }
      else {
        return true;
      }
    },
    shouldShowWikipediaOnMap: function() {
      if ($window.localStorage["showWikipediaOnMap"] != undefined) {
        return JSON.parse($window.localStorage["showWikipediaOnMap"]);
      }
      else {
        return true;
      }
    },
    shouldShowCommonsOnMap: function() {
      if ($window.localStorage["showCommonsOnMap"] != undefined) {
        return JSON.parse($window.localStorage["showCommonsOnMap"]);
      }
      else {
        return true;
      }
    },
    setShowWikidataOnMap: function(value) {
      $window.localStorage["showWikidataOnMap"] = JSON.stringify(value);
    },
    setShowWikipediaOnMap: function(value) {
      $window.localStorage["showWikipediaOnMap"] = JSON.stringify(value);
    },
    setShowCommonsOnMap: function(value) {
      $window.localStorage["showCommonsOnMap"] = JSON.stringify(value);
    },
    shouldShowCountryData: function(countryCode) {
      if ($window.localStorage["shouldShowCountryData" + countryCode] != undefined) {
        return JSON.parse($window.localStorage["shouldShowCountryData" + countryCode]);
      }
      else {
        return true;
      }
    },
    setShowCountryDataOnMap: function(countryCode, value) {
      $window.localStorage["shouldShowCountryData" + countryCode] = JSON.stringify(value);
    },
    getWikiOSMarkServer: function(value) {
      return "https://wikiosmark.herokuapp.com/"
    },
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
  var watchPositionCallbacks = {};
  var callbackCounter = 0;
  var currentPosition = null;

  navigator.geolocation.watchPosition(onLocationWatchSuccess, onLocationWatchError, { maximumAge: 10000, enableHighAccuracy: true });

  function onLocationWatchSuccess(position) {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
    currentPosition = position;

    for (var key in watchPositionCallbacks) {
      if (watchPositionCallbacks[key] != undefined) {
        watchPositionCallbacks[key](currentPosition);
      }
    }

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
    },
    watchPosition: function(callback) {
      watchPositionCallbacks["id" + callbackCounter] = callback;
      return callbackCounter++;
    },
    stopWatchPosition: function(id) {
      watchPositionCallbacks["id" + id] = undefined;
    }
  }
  return locationService;
})

.factory('Wheelmap', function($window, $http, AppSettings) {

  var nodeTypes = {"conditions":{"page":1,"per_page":500,"format":"json","locale":"en"},"meta":{"page":1,"num_pages":1,"item_count_total":130,"item_count":130},"node_types":[{"id":1,"identifier":"bicycle_rental","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Bicycle rental","icon":"cycling.png"},{"id":2,"identifier":"boatyard","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Boat yard","icon":"boat.png"},{"id":3,"identifier":"bus_station","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Bus station","icon":"busstop.png"},{"id":4,"identifier":"bus_stop","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Bus stop","icon":"busstop.png"},{"id":5,"identifier":"car_rental","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Car rental","icon":"carrental.png"},{"id":6,"identifier":"car_sharing","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Car sharing","icon":"carrental.png"},{"id":7,"identifier":"ferry_terminal","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Ferry terminal","icon":"ferry.png"},{"id":8,"identifier":"fuel","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Gas station","icon":"fillingstation.png"},{"id":9,"identifier":"halt","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Halt","icon":"train.png"},{"id":10,"identifier":"parking","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Parking","icon":"parking.png"},{"id":11,"identifier":"platform","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Platform","icon":"train.png"},{"id":12,"identifier":"station","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Train station","icon":"train.png"},{"id":13,"identifier":"subway_entrance","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Subway entrance","icon":"underground.png"},{"id":14,"identifier":"terminal","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Airport terminal","icon":"airport_terminal.png"},{"id":15,"identifier":"tram_stop","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Tram stop","icon":"tramway.png"},{"id":16,"identifier":"cable_car","category_id":1,"category":{"id":1,"identifier":"public_transfer"},"localized_name":"Cable car","icon":"cablecar.png"},{"id":17,"identifier":"cafe","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Cafe","icon":"coffee.png"},{"id":18,"identifier":"bar","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Bar","icon":"bar_coktail.png"},{"id":19,"identifier":"drinking_water","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Drinking water","icon":"drinkingwater.png"},{"id":20,"identifier":"fast_food","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Fast Food","icon":"fastfood.png"},{"id":21,"identifier":"pub","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Pub","icon":"bar.png"},{"id":22,"identifier":"restaurant","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Restaurant","icon":"restaurant.png"},{"id":23,"identifier":"biergarten","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Biergarten","icon":"biergarten.png"},{"id":25,"identifier":"cinema","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Cinema","icon":"cinema.png"},{"id":26,"identifier":"gallery","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Gallery","icon":"museum_art.png"},{"id":27,"identifier":"nightclub","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Nightclub","icon":"dancinghall.png"},{"id":28,"identifier":"theatre","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Theatre","icon":"theater.png"},{"id":29,"identifier":"zoo","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Zoo","icon":"zoo.png"},{"id":30,"identifier":"brothel","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Brothel","icon":"lantern.png"},{"id":31,"identifier":"community_centre","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Community centre","icon":"communitycentre.png"},{"id":32,"identifier":"stripclub","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Stripclub","icon":"stripclub.png"},{"id":33,"identifier":"playground","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Playground","icon":"playground.png"},{"id":34,"identifier":"atm","category_id":4,"category":{"id":4,"identifier":"money_post"},"localized_name":"ATM","icon":"atm.png"},{"id":35,"identifier":"bureau_de_change","category_id":4,"category":{"id":4,"identifier":"money_post"},"localized_name":"Bureau de change","icon":"currencyexchange.png"},{"id":36,"identifier":"bank","category_id":4,"category":{"id":4,"identifier":"money_post"},"localized_name":"Bank","icon":"bank.png"},{"id":37,"identifier":"post_office","category_id":4,"category":{"id":4,"identifier":"money_post"},"localized_name":"Post office","icon":"postal.png"},{"id":38,"identifier":"college","category_id":5,"category":{"id":5,"identifier":"education"},"localized_name":"College","icon":"university.png"},{"id":39,"identifier":"kindergarten","category_id":5,"category":{"id":5,"identifier":"education"},"localized_name":"Kindergarten","icon":"daycare.png"},{"id":40,"identifier":"library","category_id":5,"category":{"id":5,"identifier":"education"},"localized_name":"Library","icon":"library.png"},{"id":41,"identifier":"museum","category_id":5,"category":{"id":5,"identifier":"education"},"localized_name":"Museum","icon":"museum_archeological.png"},{"id":42,"identifier":"school","category_id":5,"category":{"id":5,"identifier":"education"},"localized_name":"School","icon":"school.png"},{"id":43,"identifier":"university","category_id":5,"category":{"id":5,"identifier":"education"},"localized_name":"University","icon":"university.png"},{"id":44,"identifier":"alcohol","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Liquor","icon":"liquor.png"},{"id":45,"identifier":"bakery","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Bakery","icon":"bread.png"},{"id":46,"identifier":"beverages","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Beverages","icon":"liquor.png"},{"id":47,"identifier":"bicycle","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Bike shop","icon":"cycling.png"},{"id":48,"identifier":"books","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Books","icon":"library.png"},{"id":49,"identifier":"butcher","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Butcher","icon":"butcher.png"},{"id":50,"identifier":"clothes","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Clothes","icon":"clothers_male.png"},{"id":51,"identifier":"computer","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Computer","icon":"computers.png"},{"id":52,"identifier":"convenience","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Convenience","icon":"conveniencestore.png"},{"id":53,"identifier":"department_store","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Department store","icon":"departmentstore.png"},{"id":54,"identifier":"doityourself","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Do it yourself","icon":"tools.png"},{"id":55,"identifier":"dry_cleaning","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Dry cleaning","icon":"laundromat.png"},{"id":56,"identifier":"electronics","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Electronics","icon":"phones.png"},{"id":57,"identifier":"florist","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Florist","icon":"flowers.png"},{"id":58,"identifier":"furniture","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Furniture","icon":"homecenter.png"},{"id":59,"identifier":"garden_centre","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Garden centre","icon":"flowers.png"},{"id":60,"identifier":"hairdresser","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Hairdresser","icon":"barber.png"},{"id":61,"identifier":"hardware","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Hardware","icon":"tools.png"},{"id":62,"identifier":"laundry","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Laundry","icon":"laundromat.png"},{"id":63,"identifier":"mall","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Shopping centre","icon":"mall.png"},{"id":64,"identifier":"kiosk","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Kiosk","icon":"kiosk.png"},{"id":65,"identifier":"optician","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Optician","icon":"ophthalmologist.png"},{"id":66,"identifier":"shoes","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Shoes","icon":"shoes.png"},{"id":67,"identifier":"supermarket","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Supermarket","icon":"supermarket.png"},{"id":68,"identifier":"chemist","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Chemist / Drugstore","icon":"chemist.png"},{"id":69,"identifier":"stationery","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Stationery","icon":"stationery.png"},{"id":70,"identifier":"video","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Video rental store","icon":"music.png"},{"id":71,"identifier":"second_hand","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Second hand","icon":"2hand.png"},{"id":72,"identifier":"car_shop","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Car shop","icon":"car.png"},{"id":73,"identifier":"car_repair","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Car repair","icon":"car_repair.png"},{"id":74,"identifier":"sports","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Sports","icon":"weights.png"},{"id":75,"identifier":"photo","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Photo","icon":"photography.png"},{"id":76,"identifier":"sports_centre","category_id":7,"category":{"id":7,"identifier":"sport"},"localized_name":"Sports centre","icon":"tennis.png"},{"id":77,"identifier":"stadium","category_id":7,"category":{"id":7,"identifier":"sport"},"localized_name":"Stadium","icon":"stadium.png"},{"id":78,"identifier":"swimming_pool","category_id":7,"category":{"id":7,"identifier":"sport"},"localized_name":"Swimming pool","icon":"swimming.png"},{"id":79,"identifier":"archaeological_site","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Archaeological site","icon":"fossils.png"},{"id":80,"identifier":"arts_centre","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Arts centre","icon":"artgallery.png"},{"id":81,"identifier":"artwork","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Artwork","icon":"publicart.png"},{"id":82,"identifier":"attraction","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Attraction","icon":"artgallery.png"},{"id":83,"identifier":"beach","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Beach","icon":"beach.png"},{"id":84,"identifier":"castle","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Castle","icon":"castle.png"},{"id":85,"identifier":"cave_entrance","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Cave entrance","icon":"cave.png"},{"id":86,"identifier":"memorial","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Memorial","icon":"memorial.png"},{"id":87,"identifier":"theme_park","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"Theme park","icon":"themepark.png"},{"id":88,"identifier":"viewpoint","category_id":8,"category":{"id":8,"identifier":"tourism"},"localized_name":"View point","icon":"beautifulview.png"},{"id":90,"identifier":"bed_and_breakfast","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Bed and breakfast","icon":"bed_breakfast1.png"},{"id":91,"identifier":"camp_site","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Camp site","icon":"camping.png"},{"id":92,"identifier":"caravan_site","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Caravan site","icon":"camping.png"},{"id":93,"identifier":"chalet","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Chalet","icon":"home.png"},{"id":94,"identifier":"guest_house","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Guest house","icon":"villa.png"},{"id":95,"identifier":"hostel","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Hostel","icon":"lodging_0star.png"},{"id":96,"identifier":"hotel","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Hotel","icon":"lodging_0star.png"},{"id":97,"identifier":"motel","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Motel","icon":"lodging_0star.png"},{"id":98,"identifier":"place_of_worship","category_id":10,"category":{"id":10,"identifier":"misc"},"localized_name":"Place of worship","icon":"prayer.png"},{"id":99,"identifier":"toilets","category_id":10,"category":{"id":10,"identifier":"misc"},"localized_name":"Toilets","icon":"toilets.png"},{"id":100,"identifier":"company","category_id":10,"category":{"id":10,"identifier":"misc"},"localized_name":"Company (Office)","icon":"workoffice.png"},{"id":101,"identifier":"lawyer","category_id":10,"category":{"id":10,"identifier":"misc"},"localized_name":"Lawyer","icon":"court.png"},{"id":102,"identifier":"courthouse","category_id":11,"category":{"id":11,"identifier":"government"},"localized_name":"Courthouse","icon":"court.png"},{"id":103,"identifier":"townhall","category_id":11,"category":{"id":11,"identifier":"government"},"localized_name":"Town hall","icon":"bigcity.png"},{"id":104,"identifier":"embassy","category_id":11,"category":{"id":11,"identifier":"government"},"localized_name":"Embassy","icon":"embassy.png"},{"id":105,"identifier":"police","category_id":11,"category":{"id":11,"identifier":"government"},"localized_name":"Police","icon":"police.png"},{"id":106,"identifier":"doctors","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Doctor","icon":"medicine.png"},{"id":107,"identifier":"hospital","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Hospital","icon":"firstaid.png"},{"id":108,"identifier":"pharmacy","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Pharmacy","icon":"firstaid.png"},{"id":109,"identifier":"veterinary","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Veterinary","icon":"veterinary.png"},{"id":110,"identifier":"medical_supply","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Medical supplies","icon":"medicalstore.png"},{"id":111,"identifier":"hearing_aids","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Hearing aid dealer","icon":"hearing_aids.png"},{"id":112,"identifier":"social_facility","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Social facility","icon":"social_facility.png"},{"id":113,"identifier":"ice_cream","category_id":2,"category":{"id":2,"identifier":"food"},"localized_name":"Ice cream parlour","icon":"icecream.png"},{"id":114,"identifier":"casino","category_id":3,"category":{"id":3,"identifier":"leisure"},"localized_name":"Casino","icon":"poker.png"},{"id":115,"identifier":"driving_school","category_id":5,"category":{"id":5,"identifier":"education"},"localized_name":"Driving school","icon":"car.png"},{"id":116,"identifier":"deli","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Delicatessen","icon":"lobster-export.png"},{"id":117,"identifier":"confectionery","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Candy store","icon":"targ.png"},{"id":118,"identifier":"beauty","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Beauty salon","icon":"beautysalon.png"},{"id":119,"identifier":"jewelry","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Jewelry","icon":"jewelry.png"},{"id":120,"identifier":"gift","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Gift shop","icon":"gifts.png"},{"id":121,"identifier":"toys","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Toys","icon":"toys.png"},{"id":122,"identifier":"travel_agency","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Travel agency","icon":"travel_agency.png"},{"id":123,"identifier":"outdoor","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Outdoor supply","icon":"hiking.png"},{"id":124,"identifier":"organic","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Organic shop","icon":"restaurant_vegetarian.png"},{"id":125,"identifier":"pet","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Pet shop","icon":"cat.png"},{"id":126,"identifier":"fabric","category_id":6,"category":{"id":6,"identifier":"shopping"},"localized_name":"Fabric shop","icon":"textiles.png"},{"id":127,"identifier":"pitch","category_id":7,"category":{"id":7,"identifier":"sport"},"localized_name":"Sports field","icon":"soccer.png"},{"id":128,"identifier":"estate_agent","category_id":10,"category":{"id":10,"identifier":"misc"},"localized_name":"Real estate agent","icon":"house.png"},{"id":129,"identifier":"insurance","category_id":10,"category":{"id":10,"identifier":"misc"},"localized_name":"Insurance","icon":"workoffice.png"},{"id":130,"identifier":"dormitory","category_id":9,"category":{"id":9,"identifier":"accommodation"},"localized_name":"Dormitory","icon":"apartment.png"},{"id":131,"identifier":"dentist","category_id":12,"category":{"id":12,"identifier":"health"},"localized_name":"Dentist","icon":"dentist.png"},{"id":132,"identifier":"government","category_id":11,"category":{"id":11,"identifier":"government"},"localized_name":"Government agency","icon":"office-building.png"}]}.node_types;

  var wheelmapService = {
    getNodes: function(bbox, filter, maxCount, page, callback) {

      var serverAddress = AppSettings.getWikiOSMarkServer();
      //console.log(serverAddress);

      // Get edit token
      var wheelmapURL = serverAddress + "wheelmap/" + "api/nodes?" +
        "api_key=" + wheelmap_api_data.auth_token +
        "&bbox=" + bbox.min_lng + "," + bbox.min_lat + "," + bbox.max_lng + "," + bbox.max_lat +
        "&page=" + page +
        "&per_page=" + maxCount +
        "&wheelchair=" + filter;

      //console.log(wheelmapURL);

      $http.get(wheelmapURL).
        success(function(data) {
          callback(data);
        })
        .error(function (data) {
          console.log('data error');
          console.log(data);
          callback(null);
        });
    },
    // getNodeTypes: function(lang, callback) {
    //   console.log(nodeTypes);
    //   callback(nodeTypes);
    //   // var serverAddress = AppSettings.getWikiOSMarkServer();
    //   // console.log(serverAddress);
    //   //
    //   // // Get edit token
    //   // var wheelmapURL = serverAddress + "wheelmap/" + "api/node_types?" +
    //   //   "api_key=" + wheelmap_api_data.auth_token +
    //   //   "&locale=" + lang +
    //   //   "&page=" + 1 +
    //   //   "&per_page=" + 500;
    //   //
    //   // $http.get(wheelmapURL).
    //   //   success(function(data) {
    //   //     callback(data.node_types);
    //   //   })
    //   //   .error(function (data) {
    //   //     console.log('data error');
    //   //     console.log(data);
    //   //     callback(null);
    //   //   });
    // },
    getNodeType: function(id) {
      for (var i = 0; i < nodeTypes.length; i++) {
        if (nodeTypes[i].id == id) {
          return nodeTypes[i];
        }
      }
      return null;
    }
  }

  return wheelmapService;
})

.factory('PhotoGallery', function($window, $http) {
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
        var photoGallery = null;
        if ($window.localStorage["photoGallery"] != undefined) {
          photoGallery = JSON.parse($window.localStorage["photoGallery"]);
        }
        else {
          photoGallery = {
            photos: []
          }
        }
        return photoGallery;
      },
      getFlickrPhotos: function(bbox, maxCount, callback) {
        var flickrURL = "https://api.flickr.com/services/rest/?&method=" +
          "flickr.photos.search" +
          "&api_key=" + flickr_api_data.key +
          "&license=4,5,7,8,9,10" +
          "&bbox=" + bbox.min_lng + "," + bbox.min_lat + "," + bbox.max_lng + "," + bbox.max_lat +
          "&per_page=" + maxCount +
          "&extras=geo,url_s,url_o" + // http://librdf.org/flickcurl/api/flickcurl-searching-search-extras.html & https://www.flickr.com/services/api/misc.urls.html
          "&nojsoncallback=1&format=json";

          $http.get(flickrURL).
            success(function(data) {
              callback(data);
            })
            .error(function (data) {
              console.log('data error');
              console.log(data);
              callback(null);
            });
      },
      getFlickrPhotosByRadius: function(centerCoordinates, radius, maxCount, callback) {
        // var flickrURL = "https://api.flickr.com/services/rest/?&method=" +
        //   "flickr.photos.licenses.getInfo" +
        //   "&api_key=" + flickr_api_data.key +
        //   "&ormat=json";
        //
        //   $http.get(flickrURL).
        //     success(function(data) {
        //       callback(data);
        //     })
        //     .error(function (data) {
        //       console.log('data error');
        //       console.log(data);
        //       callback(null);
        //     });

        var flickrURL = "https://api.flickr.com/services/rest/?&method=" +
          "flickr.photos.search" +
          "&api_key=" + flickr_api_data.key +
          "&license=4,5,7,8,9,10" +
          "&lat=" + centerCoordinates.lat +
          "&lon=" + centerCoordinates.lng +
          "&radius=" + radius + // km
          "&per_page=" + maxCount +
          "&extras=geo,url_s,url_o" + // http://librdf.org/flickcurl/api/flickcurl-searching-search-extras.html & https://www.flickr.com/services/api/misc.urls.html
          "&nojsoncallback=1&format=json";

          $http.get(flickrURL).
            success(function(data) {
              callback(data);
            })
            .error(function (data) {
              console.log('data error');
              console.log(data);
              callback(null);
            });
      },
      getFlickrPhotoInfo: function(photoID, callback) {
        var flickrURL = "https://api.flickr.com/services/rest/?&method=" +
          "flickr.photos.getInfo" +
          "&api_key=" + flickr_api_data.key +
          "&photo_id=" + photoID +
          //"&extras=url_o" + // http://librdf.org/flickcurl/api/flickcurl-searching-search-extras.html & https://www.flickr.com/services/api/misc.urls.html
          "&nojsoncallback=1&format=json";

          $http.get(flickrURL).
            success(function(data) {
              callback(data);
            })
            .error(function (data) {
              console.log('data error');
              console.log(data);
              callback(null);
            });
      },
      getMapillaryPhotos: function(bbox, maxCount, callback) {
        var url = "https://a.mapillary.com/v2/search/im?" +
        "client_id=" + mapillary_api_data.clientID +
        "&min_lat=" + bbox.min_lat +
        "&max_lat=" + bbox.max_lat +
        "&min_lon=" + bbox.min_lng +
        "&max_lon=" + bbox.max_lng +
        "&limit=" + maxCount +
        "&page=" + 0;

        $http.get(url).
          success(function(data) {
            callback(data);
          })
          .error(function (data) {
            console.log('data error');
            console.log(data);
            callback(null);
          });
      }
    }
    return photoGalleryService;
})

.factory('Wiki', function($http, AppSettings) {
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
    getItem: function(site, itemID, properties, callback) {

      var url = null;

      var prop = "";
      for (var i = 0; i < properties.length; i++) {
        prop += properties[i] + "|";
      }
      prop = prop.slice(0, -1);

      if (site == "wikipedia") {
        lang = "en";
        if (itemID.includes(":")) {
          lang = itemID.split(":")[0];
        }
        url = "https://";
  			url += lang;
  			url += ".wikipedia.org/w/api.php?action=query";
  			url += "&titles=" + itemID;
  			url += "&prop=" + prop;
  			url += "&callback=JSON_CALLBACK&format=json";
      }
      else if (site == "wikidata") {
        url = "https://www.wikidata.org/w/api.php?callback=JSON_CALLBACK&action=query&titles="
          + itemID + "&format=json&prop=" + prop;
        }
        else { // commons
          url = "https://commons.wikimedia.org/w/api.php?callback=JSON_CALLBACK&action=query&titles="
  				 	+ itemID + "&format=json&prop=" + prop;
        }

        $http.jsonp(url).
          success(function(data) {
            console.log(data);

            var item = null;

            for (var key in data.query.pages) { // should be just one key in pages
              if (key != -1) { // no page with that title
                // TODO: include also other queried properties
                item = {
                  pageTitle: data.query.pages[key].title,
                  coordinates: null,
                }
                if (data.query.pages[key].coordinates != undefined) {
                  item.coordinates = {
                    lat: data.query.pages[key].coordinates.lat,
                    lng: data.query.pages[key].coordinates.lon
                  }
                }
              }
            }

            callback(item);
          })
          .error(function (data) {
            console.log('data error');
            console.log(data);
            callback(null);
          });
    },
    getWikidataWikipediaLinks: function(itemID, callback) {
      url = "https://www.wikidata.org/w/api.php?callback=JSON_CALLBACK&action=wbgetentities&ids=" +
        itemID + "&format=json&props=sitelinks%2Furls";
        $http.jsonp(url).
          success(function(data) {
            console.log(data);
            callback(data);
          })
          .error(function (data) {
            console.log('data error');
            console.log(data);
            callback(null);
          });
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
    geoQueryWikidata: function(southWestPoint, northEastPoint, callback) {
      //console.log(southWestPoint, northEastPoint);
      var url = "https://query.wikidata.org/bigdata/namespace/wdq/sparql?query=";
      var query = 'SELECT ?q ?qLabel ?location ?image ?desc ?osmId ' +
        'WHERE { SERVICE wikibase:box { ' +
        '?q wdt:P625 ?location . bd:serviceParam wikibase:cornerSouthWest "Point(' +
        southWestPoint.lng + " " + southWestPoint.lat +
        ')"^^geo:wktLiteral . bd:serviceParam wikibase:cornerNorthEast "Point(' +
        northEastPoint.lng + " " + northEastPoint.lat +
        ')"^^geo:wktLiteral } OPTIONAL { ?q wdt:P18 ?image } OPTIONAL { ?q wdt:P402 ?osmId }' +
        ' SERVICE wikibase:label { bd:serviceParam wikibase:language "en,da,et,fi,is,no,se" . ?q schema:description ?desc . ?q rdfs:label ?qLabel } } LIMIT 200';

      $http.get(url + encodeURIComponent(query))
      .success(callback)
		  .error(function (data) {
		  	console.log('data error');
		    console.log(data);
		  });
    },
    geoQueryWikipedia: function(southWestPoint, northEastPoint, callback) {
      // TODO query at least in the language where is user is located (in addition to English)
      var url = "https://" + AppSettings.getDefaultLanguage() + ".wikipedia.org/w/api.php?action=query";
      url += "&list=geosearch";
      url += "&gsbbox=" + northEastPoint.lat + "|" + southWestPoint.lng + "|" + southWestPoint.lat + "|" + northEastPoint.lng;
      url += "&gslimit=" + 200;
      url += "&format=json"
      url += "&callback=JSON_CALLBACK";

      $http.jsonp(url).
  		  success(callback)
  		  .error(function (data) {
  		  	console.log('data error');
  		    console.log(data);
  		  });
    },
    geoQueryCommons: function(southWestPoint, northEastPoint, callback) {
      // TODO query at least in the language where is user is located (in addition to English)
      var url = "https://commons.wikimedia.org/w/api.php?action=query";
      url += "&list=geosearch";
      url += "&gsnamespace=6";
      url += "&gsbbox=" + northEastPoint.lat + "|" + southWestPoint.lng + "|" + southWestPoint.lat + "|" + northEastPoint.lng;
      url += "&gslimit=" + 200;
      url += "&format=json"
      url += "&callback=JSON_CALLBACK";

      $http.jsonp(url).
  		  success(callback)
  		  .error(function (data) {
  		  	console.log('data error');
  		    console.log(data);
  		  });
    },
    createWikiPage: function(title, content, summary, callback) {

      var serverAddress = AppSettings.getWikiOSMarkServer();
      console.log(serverAddress);

      // Get edit token
      var tokenURL = serverAddress + "wikipedia/" + "w/api.php?action=query&meta=tokens";
      tokenURL += "&format=json";

      $http.get(tokenURL).
  		  success(function (data) {
          console.log(data);
          // have do this via own server
          var url = serverAddress;
          url += "wikipedia/" + "w/api.php?action=edit";
          url += "&createonly";
          url += "&title=" + title;
          url += "&summary=" + summary;
          url += "&text=" + content;
          //url += "&contentmodel=" + "text";
          url += "&contentformat=" + "text/x-wiki";
          url += "&format=json";

          $http.post(url, { headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            data: { token: data.query.tokens.csrftoken }
          }}).
          success(callback)
          .error(function (data) {
            console.log('data error');
            console.log(data);
          });
        })
  		  .error(function (data) {
  		  	console.log('data error');
  		    console.log(data);
  		  });
    },
    editWikiPage: function(title, section, sectionTitle, content, summary, callback) {
      var serverAddress = AppSettings.getWikiOSMarkServer();
      console.log(serverAddress);
      // Get edit token
      var tokenURL = serverAddress + "wikipedia/" + "w/api.php?action=query&meta=tokens";
      tokenURL += "&format=json";

      $http.get(tokenURL).
  		  success(function (data) {
          console.log(data);
          // have do this via own server
          var url = serverAddress;
          url += "wikipedia/" + "w/api.php?action=edit";
          url += "&nocreate";
          url += "&title=" + title;
          url += "&section=" + section;
          if (sectionTitle != null) {
            url += "&sectiontitle=" + sectionTitle;
          }
          url += "&summary=" + summary;
          url += "&appendtext=" + content;
          url += "&contentformat=" + "text/x-wiki";
          url += "&format=json";

          $http.post(url, { headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            data: { token: data.query.tokens.csrftoken }
          }}).
          success(callback)
          .error(function (data) {
            console.log('data error');
            console.log(data);
          });
        })
  		  .error(function (data) {
  		  	console.log('data error');
  		    console.log(data);
  		  });
    },
    addCoordinatesToItem: function(site, itemID, centerCoordinates, callback) {
      var serverAddress = AppSettings.getWikiOSMarkServer();
      console.log(serverAddress);

      if (site == "wikidata") {
        // Get edit token
        var tokenURL = serverAddress + "wikidata/" + "w/api.php?action=query&meta=tokens";
        tokenURL += "&format=json";

        $http.get(tokenURL).
    		  success(function (data) {
            console.log(data);
            // https://test.wikidata.org/w/api.php?action=help&modules=wbcreateclaim and https://www.mediawiki.org/wiki/Wikibase/API#wbcreateclaim
            // have do this via own server

            //itemID = "Q24231";
            //var coordinatePropertyID = "P625"; // www.wikidata.org
            var coordinatePropertyID = "P125"; // test.wikidata.org

            var url = serverAddress;
            url += "wikidata/" + "w/api.php?action=wbcreateclaim" +
              "&entity=" + itemID +
              "&property=" + "P625" +
              "&snaktype=" + "value" +
              "&value=" + '{"latitude":' + centerCoordinates.lat + ',"longitude":' + centerCoordinates.lng + ',"globe":"http://www.wikidata.org/entity/Q2","precision":0.0001}' +
              "&format=json";

            $http.post(url, { headers: {
              'Content-type': 'application/x-www-form-urlencoded',
              data: { token: data.query.tokens.csrftoken }
            }}).
            success(callback)
            .error(function (data) {
              console.log('data error');
              console.log(data);
            });
          })
    		  .error(function (data) {
    		  	console.log('data error');
    		    console.log(data);
    		  });
      }
      else if (site == "wikipedia") {
        // Get edit token
        var tokenURL = serverAddress + "wikipedia/" + "w/api.php?action=query&meta=tokens";
        tokenURL += "&format=json";

        $http.get(tokenURL).
    		  success(function (data) {
            console.log(data);
            // have do this via own server
            var url = serverAddress;
            url += "wikipedia/" + "w/api.php?action=edit";
            url += "&nocreate";
            url += "&title=" + itemID;
            url += "&summary=" + "Added coordinates";
            url += "&prependtext=" + "{{coord|" + centerCoordinates.lat + "|" + centerCoordinates.lng + "|display=title}}%0A%0A";
            url += "&contentformat=" + "text/x-wiki";
            url += "&format=json";

            $http.post(url, { headers: {
              'Content-type': 'application/x-www-form-urlencoded',
              data: { token: data.query.tokens.csrftoken }
            }}).
            success(callback)
            .error(function (data) {
              console.log('data error');
              console.log(data);
            });
          })
          .error(function (data) {
            console.log('data error');
            console.log(data);
          });
      }
    }
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
      userDetails = null;
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
