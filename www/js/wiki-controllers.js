
var wikiControllers = angular.module('wikiControllers', [])

.controller('WikiCtrl', function($scope, $cordovaGeolocation, $http) {

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
			    		id: data.search[i].id,
			    		label: data.search[i].label + " (" + data.search[i].id + ")",
			    		description: data.search[i].description
			    	});
			    }
			}
			else {
				for (var i = 0; i < data[1].length; i++) {
					$scope.searchResults.push({
						id: $scope.formData.language + "_" + $scope.formData.site + "_" + data[1][i].replace(/\s+/g, '_'),
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

});
