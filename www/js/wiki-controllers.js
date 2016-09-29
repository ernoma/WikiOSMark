
var wikiControllers = angular.module('wikiControllers', [])

.controller('WikiCtrl', function($scope, $http) {

	//console.log(window.wdk);

	$scope.formData = {
		site: "wikidata",
		language: "en",
		searchText: ""
	};

	$scope.searchResults = [];

	$scope.queryMediaWiki = function(searchText) {

		console.log($scope.formData.searchText);

		var url = "https://";

		var site = "";

		if ($scope.formData.site == "wikipedia") {
			url += $scope.formData.language;
			url += ".wikipedia.org/w/api.php?action=opensearch";
			url += "&limit=" + 50;
			url += "&search=" + $scope.formData.searchText;

		}
		else if ($scope.formData.site == "wikidata") {
			url = wdk.searchEntities({
				search: $scope.formData.searchText,
				language: $scope.formData.language,
				limit: 50
				});
		}
		else { // site == commons
			url += "commons.wikimedia.org/w/api.php?action=opensearch";
			url += "&limit=" + 50;
			url += "&search=" + $scope.formData.searchText;
		}

		url += "&callback=JSON_CALLBACK";

		$http.jsonp(url).
		  success(function(data) {

		  	$scope.searchResults = [];

		    console.log(data);

		    if ($scope.formData.site == "wikidata") {
			    for (var i = 0; i < data.search.length; i++) {
			    	$scope.searchResults.push({
			    		id: $scope.formData.language + $scope.formData.site + "+" + data.search[i].id,
			    		label: data.search[i].label + " (" + data.search[i].id + ")",
			    		description: data.search[i].description
			    	});
			    }
			}
			else if ($scope.formData.site == "commons") {
				for (var i = 0; i < data[1].length; i++) {
					$scope.searchResults.push({
						id: $scope.formData.language + $scope.formData.site + "+" + data[1][i].replace(/\s+/g, '_'),
						label: data[1][i],
						description: data[3][i]
					});
				}
			}
			else { // wikipedia
				for (var i = 0; i < data[1].length; i++) {
					$scope.searchResults.push({
						id: $scope.formData.language + $scope.formData.site + "+" + data[1][i].replace(/\s+/g, '_'),
						label: data[1][i],
						description: data[2][i]
					});
				}
			}
		  })
		  .error(function (data) {
		  	console.log('data error');
		    console.log(data);
		  });
	}
})

.controller('WikiDetailCtrl', function($scope, $stateParams, $http) {
		console.log($stateParams.wikiId);

		$scope.title = "";
		$scope.siteURL = "";

		var parts = $stateParams.wikiId.split("+");
		var lang = parts[0].substring(0, 2);
		var site = parts[0].substring(2);
		var id = parts[1];

		console.log(lang);
		console.log(site);
		console.log(id);

		if (site == "wikipedia") {
			// TODO there are many ways to go to retrieve and present (and edit) the data
			// var url = "https://";
			// url += lang;
			// url += ".wikipedia.org/w/api.php?action=query";
			// url += "&titles=" + id;
			// url += "&prop=revisions&rvprop=content";
			// url += "&callback=JSON_CALLBACK&format=json";
			//
			// $http.jsonp(url).
			//   success(function(data) {
			//     console.log(data);
			//
			//   })
			//   .error(function (data) {
			//   	console.log('data error');
			//     console.log(data);
			//   });
		}
		else if (site == "wikidata") {
			//TODO

			var url = wdk.getEntities(id);

			url += "&callback=JSON_CALLBACK";

			$http.jsonp(url).
				success(function(data) {
					console.log(data);
					var simplifiedClaims = wdk.simplifyClaims(data.entities[id].claims);
					console.log(simplifiedClaims);
				})
				.error(function (data) {
					console.log('data error');
					console.log(data);
				});
		}
		else { // site == commons
			//TODO show page link and image thumbnails with links

			$scope.title = id.replace(/_+/g, ' ');

			$scope.siteURL = "https://commons.wikimedia.org/wiki/" + id;

			var url = "https://commons.wikimedia.org/w/api.php?callback=JSON_CALLBACK&action=query&prop=images&imlimit=50&format=json&titles="
			url += id;

			$http.jsonp(url).
				success(function(data) {
					console.log(data);

				})
				.error(function (data) {
					console.log('data error');
					console.log(data);
				});
		}
});
