
var wikiControllers = angular.module('wikiControllers', [])

.controller('WikiCtrl', function($scope, $http, Wiki, AppSettings, $state, $ionicSideMenuDelegate) {

	//console.log(window.wdk);

	$scope.formData = {
		site: "wikidata",
		language: AppSettings.getDefaultLanguage(),
		searchText: ""
	};

	$scope.searchResults = [];

	$scope.$on( "editWikiTemplates", function( event ) {
		$scope.editWikiTemplates();
	});

	$scope.editWikiTemplates = function() {
		$ionicSideMenuDelegate.toggleRight(false);
		$state.go("tab.wiki-template-edit");
	}

	$scope.inputSearchChange = function() {
		if ($scope.formData.searchText.length == 0) {
			$scope.searchResults = [];
		}
		else {
			switch ($scope.formData.site) {
				case "wikidata":
					if ($scope.formData.searchText.length >= 2) {
						Wiki.queryMediaWiki($scope.formData.site, $scope.formData.language, $scope.formData.searchText, function(data) {
								//console.log(data);
								$scope.searchResults = [];
								for (var i = 0; i < data.search.length; i++) {
									$scope.searchResults.push({
										id: $scope.formData.language + $scope.formData.site + "+" + data.search[i].id,
										label: data.search[i].label + " (" + data.search[i].id + ")",
										description: data.search[i].description
									});
								}
						});
					}
					break;
				case "wikipedia":
					if ($scope.formData.searchText.length >= 3) {
						Wiki.queryMediaWiki($scope.formData.site, $scope.formData.language, $scope.formData.searchText, function(data) {
								//console.log(data);
								$scope.searchResults = [];
								for (var i = 0; i < data[1].length; i++) {
									$scope.searchResults.push({
										id: $scope.formData.language + $scope.formData.site + "+" + data[1][i].replace(/\s+/g, '_'),
										label: data[1][i],
										description: data[2][i]
									});
								}
						});
					}
				case "commons":
					if ($scope.formData.searchText.length >= 3) {
						Wiki.queryMediaWiki($scope.formData.site, $scope.formData.language, $scope.formData.searchText, function(data) {
								//console.log(data);
								$scope.searchResults = [];
								for (var i = 0; i < data[1].length; i++) {
									$scope.searchResults.push({
										id: $scope.formData.language + $scope.formData.site + "+" + data[1][i].replace(/\s+/g, '_'),
										label: data[1][i],
										description: data[3][i]
									});
								}
						});
					}
				default:
					// nothing
			}
		}
	}

	$scope.queryMediaWiki = function() {
		Wiki.queryMediaWiki($scope.formData.site, $scope.formData.language, $scope.formData.searchText, function(data) {

			$scope.searchResults = [];

			//console.log(data);

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
		});
	}
})

.controller('WikiDetailCtrl', function($scope, $stateParams, $http, Wiki, AppSettings) {
		//console.log($stateParams.wikiId);

		var IMAGE_COUNT_LIMIT = 10;
		var IMAGE_THUMB_WIDTH = 80;

		var parts = $stateParams.wikiId.split("+");
		var lang = parts[0].substring(0, 2);
		var site = parts[0].substring(2);
		var id = parts[1];
		$scope.data = {
			lang: lang,
			site: site,
			title: id.replace(/_+/g, ' '),
			siteURL: ""
		};

		$scope.mapframe = {
			text: "",
			width: 250,
			height: 250,
			zoom: 13,
			latitude: undefined,
			longitude: undefined,
			align: "right"
		}


		if ($stateParams.coordinates != undefined) {
			//console.log($stateParams.coordinates);
			// TODO
			// 1. check if a page section has maplink/mapframe and
			// 2.1. if a section has maplink state it in the UI
			// 2.2. if not then show a form to add maplink and mapframe with various parameters
			var coordParts = $stateParams.coordinates.split("|");
			$scope.mapframe.latitude = coordParts[0];
			$scope.mapframe.longitude = coordParts[1];
		}

		// console.log(lang);
		// console.log(site);
		// console.log(id);

		$scope.addMapframeToWikipedia = function(sectionIndex, section) {

			var mapframeHTML = '%0A%0A<mapframe text="' +
				$scope.mapframe.text + '"' +
				' width=' + $scope.mapframe.width +
				' height=' + $scope.mapframe.height +
				' zoom=' + $scope.mapframe.zoom +
				' latitude=' + $scope.mapframe.latitude +
				' longitude=' + $scope.mapframe.longitude +
				' align=' + $scope.mapframe.align +
				' />';

			console.log(mapframeHTML);

			Wiki.editWikiPage("testorienteerix", sectionIndex, null, mapframeHTML, "Added mapframe to the section " + section.title, function(response) {
				console.log(response);
			});
		}

		var doWikipediaSearch = function(url) {
			$http.jsonp(url).
			  success(function(data) {
					console.log(data);
			    // console.log(data);
					for (var key in data.query.pages) { // there is just one key, so for runs only once
						var content = data.query.pages[key].revisions[0]['*'];
						var parsedContent = wtf_wikipedia.parse(content);
						// console.log(parsedContent);

						if (parsedContent.redirect != undefined) {
							var url = "https://";
							url += lang;
							url += ".wikipedia.org/w/api.php?action=query";
							url += "&titles=" + parsedContent.redirect;
							url += "&prop=revisions&rvprop=content";
							url += "&callback=JSON_CALLBACK&format=json";

							doWikipediaSearch(url);
						}
						else {
							if (parsedContent.images != undefined && parsedContent.images.length > 0) {
								$scope.articleImage = parsedContent.images[0].thumb;
							}

							console.log(parsedContent);
							$scope.sections = [];
							parsedContent.text.forEach(function(sectionContent, key, map) {
								var text = "";
								for (var i = 0; i < sectionContent.length; i++) {
									text += sectionContent[i].text + " ";
								}
								$scope.sections.push({
									title: key,
									content: text,
									show: false,
									showMapframe: false,
									showMaplink: false,
									showRawSectionText: true
								});
							});
							$scope.toggleGroup = function(section) {
								section.show = !section.show;
							};
							$scope.isGroupShown = function(section) {
								return section.show;
							};
							$scope.toggleMapframe = function(section) {
								section.showMapframe = !section.showMapframe;
							};
							$scope.isMapframeShown = function(section) {
								return section.showMapframe;
							};
							$scope.toggleMaplink = function(section) {
								section.showMaplink = !section.showMaplink;
							};
							$scope.isMaplinkShown = function(section) {
								return section.showMaplink;
							};
							$scope.toggleRawSectionText = function(section) {
								section.showRawSectionText = !section.showRawSectionText;
							};
							$scope.isRawSectionTextShown = function(section) {
								return section.showRawSectionText;
							};

						// var textEntries = parsedContent.text.get("Intro");
						// // console.log(textEntries);
						//
						// for (var i = 0; i < textEntries.length; i++) {
						// 	$scope.introText += textEntries[i].text + " ";
						// }
						}
					}
			  })
			  .error(function (data) {
			  	console.log('data error');
			    console.log(data);
			  });
		}

		$scope.addMaplinkToWikipedia = function(sectionIndex, section) {

			var maplinkHTML = '%0A%0A<maplink';
			if ($scope.mapframe.text != "" ) {
				maplinkHTML += ' text="' + $scope.mapframe.text + '"';
			}
			maplinkHTML +=
				' zoom=' + $scope.mapframe.zoom +
				' latitude=' + $scope.mapframe.latitude +
				' longitude=' + $scope.mapframe.longitude +
				' />';

			// console.log(maplinkHTML);

			Wiki.editWikiPage("testorienteerix", sectionIndex, null, maplinkHTML, "Added maplink to the section " + section.title, function(response) {
				// console.log(response);
			});
		}

		$scope.goTo = function(URL) {
				//console.log("goTo: " + URL);
				//e.preventDefault();
				window.open(URL, '_system', 'location=yes');
		}

		if (site == "wikipedia") {

			$scope.articleImage = "";
			$scope.introText = "";
			$scope.data.siteURL = "https://" + lang + ".wikipedia.org/wiki/" + id;

			var url = "https://";
			url += lang;
			url += ".wikipedia.org/w/api.php?action=query";
			url += "&titles=" + id;
			url += "&prop=revisions&rvprop=content";
			url += "&callback=JSON_CALLBACK&format=json";

			doWikipediaSearch(url);
		}
		else if (site == "wikidata") {
			var url = wdk.getEntities(id);

			url += "&callback=JSON_CALLBACK";

			$http.jsonp(url).
				success(function(data) {
					// console.log(data);

					$scope.data.title = "";
					if (data.entities[id].labels[lang] != undefined) {
						$scope.data.title = data.entities[id].labels[lang].value + ' ';
					}
					else if (data.entities[id].labels[AppSettings.getDefaultLanguage()] != undefined) {
						$scope.data.title = data.entities[id].labels[AppSettings.getDefaultLanguage()].value + ' ';
					}
					else if (data.entities[id].labels['en'] != undefined) {
						$scope.data.title = data.entities[id].labels['en'].value + ' ';
					}
					else {
						for (var key in data.entities[id].labels) {
							$scope.data.title = data.entities[id].labels[key].value + ' ';
							break;
						}
					}
					$scope.data.title += "(" + id + ")";

					$scope.data.siteURL = "https://www.wikidata.org/wiki/" + id;

					var simplifiedClaims = wdk.simplifyClaims(data.entities[id].claims);
					// console.log(simplifiedClaims);

					Wiki.getWikidataProperties('en').then(function(wikidataProperties) {
						// console.log(wikidataProperties.data);
						if (lang != 'en') {
							Wiki.getWikidataProperties(lang).then(function(langWikidataProperties) {
								console.log(langWikidataProperties.data);
								createWikidataClaims(simplifiedClaims, wikidataProperties.data, langWikidataProperties.data);
							});
						}
						else {
							createWikidataClaims(simplifiedClaims, wikidataProperties.data, null);
						}
					});
				})
				.error(function (data) {
					console.log('data error');
					console.log(data);
				});

				var createWikidataClaims = function(simplifiedClaims, wikidataProperties, langWikidataProperties) {
					// TODO show somewhat similar but more compact table than in the Wikidata site
					$scope.claims = [];
					for (var key in simplifiedClaims) {
						var propertyName = key;
						if (langWikidataProperties != null) {
							for (var i = 0; i < langWikidataProperties.rows.length; i++) {
								if (langWikidataProperties.rows[i][0] == key) {
									propertyName = langWikidataProperties.rows[i][1] + " (" + key + ")";
									break;
								}
							}
						}
						if (propertyName == key) {
							for (var i = 0; i < wikidataProperties.rows.length; i++) {
								if (wikidataProperties.rows[i][0] == key) {
									propertyName = wikidataProperties.rows[i][1] + " (" + key + ")";
									break;
								}
							}
						}
						var values = [];
						var areLinks = false;
						for (var i = 0; i < simplifiedClaims[key].length; i++) {
							value = simplifiedClaims[key][i];
							if (typeof simplifiedClaims[key][i] === 'string' && simplifiedClaims[key][i].startsWith('Q') && !isNaN(parseInt(simplifiedClaims[key][i].substring(1)))) {
								value = 'https://www.wikidata.org/wiki/' + simplifiedClaims[key][i];
								areLinks = true;
							}
							values.push(value);
						}

						$scope.claims.push({
							property: propertyName,
							values: values,
							areLinks: areLinks
						});
					}
					// console.log($scope.claims);
				}
		}
		else { // site == commons

			// show image thumbnails with links
			$scope.imageCount = -1;
			$scope.imageCountLimitReached = false;
			$scope.data.siteURL = "https://commons.wikimedia.org/wiki/" + id;
			$scope.thumbs = [];

			if (id.includes("File:")) {
				// var url = "https://";
				// url += "commons.wikimedia.org/w/api.php?action=query";
				// url += "&titles=" + id;
				// url += "&prop=revisions&rvprop=content";
				// url += "&callback=JSON_CALLBACK&format=json";

				var thumbsUrl = "https://commons.wikimedia.org/w/api.php?callback=JSON_CALLBACK&action=query&titles="
				 	+ id + "&format=json&prop=imageinfo&iiprop=url|comment|extmetadata|user&iiurlwidth="
				 	+ IMAGE_THUMB_WIDTH;

				$http.jsonp(thumbsUrl).
					success(function(data) {
						// console.log(data);

						$scope.imageCountLimitReached = false;
						$scope.imageCount = 1;
						$scope.thumbs = [];
						for (var thumbsPageKey in data.query.pages) { // there should be only one thumbsPageKey for "File:"
							var thumbItem = createThumbItem(data.query.pages[thumbsPageKey]);
							$scope.thumbs.push(thumbItem);
						}
					})
					.error(function (data) {
						console.log('data error');
						console.log(data);
					});
			}
			else if(id.includes("Category:")) {
				var url = "https://commons.wikimedia.org/w/api.php?callback=JSON_CALLBACK&format=json&action=query&generator=categorymembers&gcmlimit=" +
					IMAGE_COUNT_LIMIT + "&gcmtype=file&gcmtitle=" +
					id + "&prop=imageinfo&iiprop=url|comment|extmetadata|user&iiurlwidth="
					+ IMAGE_THUMB_WIDTH;
				//var url = "https://commons.wikimedia.org/w/api.php?callback=JSON_CALLBACK&action=query&prop=images&imlimit=" + IMAGE_COUNT_LIMIT + "&format=json&titles="
				//url += id;

				$http.jsonp(url).
					success(function(data) {
						// console.log(data);

						if (data.continue != undefined) {
							// TODO there exists more than IMAGE_COUNT_LIMIT images, note in the UI, otherwise maybe show number of images
							$scope.imageCountLimitReached = true;
							$scope.imageCount = IMAGE_COUNT_LIMIT;
						}

						for (var key in data.query.pages) { // there is just one key, so for runs only once

							var thumbItem = createThumbItem(data.query.pages[key]);

							$scope.thumbs.push(thumbItem);
						}
					})
					.error(function (data) {
						console.log('data error');
						console.log(data);
					});
			}
			else {
				var url = "https://commons.wikimedia.org/w/api.php?callback=JSON_CALLBACK&action=query&prop=images&imlimit=" + IMAGE_COUNT_LIMIT + "&format=json&titles="
				url += id;

				$http.jsonp(url).
					success(function(data) {
						// console.log(data);

						for (var key in data.query.pages) { // there is just one key, so for runs only once
							var imagesNames = data.query.pages[key].images;

							if (data.continue != undefined) {
								// TODO there exists more than IMAGE_COUNT_LIMIT images, note in the UI, otherwise maybe show number of images
								$scope.imageCountLimitReached = true;
								$scope.imageCount = imagesNames.length;
							}

							var titles = "";

							for (var i = 0; i < imagesNames.length; i++) {
								titles += imagesNames[i].title + "|";
							}
							titles = titles.slice(0, titles.length - 1);
							var thumbsUrl = "https://commons.wikimedia.org/w/api.php?callback=JSON_CALLBACK&action=query&titles="
								+ titles + "&format=json&prop=imageinfo&iiprop=url|comment|extmetadata|user&iiurlwidth="
								+ IMAGE_THUMB_WIDTH;

							$http.jsonp(thumbsUrl).
								success(function(thumbsData) {
									// console.log(thumbsData);

									for (var thumbsPageKey in thumbsData.query.pages) {

										var thumbItem = createThumbItem(thumbsData.query.pages[thumbsPageKey]);

										$scope.thumbs.push(thumbItem);
									}
								})
								.error(function (thumbsData) {
									console.log('data error');
									console.log(thumbsData);
								});
						}

					})
					.error(function (data) {
						console.log('data error');
						console.log(data);
					});
			}
		}

		var createThumbItem = function(page) {
			var imageinfo = page.imageinfo[0];
			var div = document.createElement("div");
			div.innerHTML = imageinfo.extmetadata.ImageDescription.value;
			var description = div.textContent || div.innerText || "";
			//var description = imageinfo.extmetadata.ImageDescription.value;
			div.innerHTML = imageinfo.extmetadata.Credit.value;
			var source = div.textContent || div.innerText || "";
			var date = imageinfo.extmetadata.DateTimeOriginal.value;
			var author = imageinfo.user != undefined ? imageinfo.user : "";
			var permission = imageinfo.extmetadata.LicenseShortName.value;
			var commentParts = imageinfo.comment.split("|");
			for (var j = 1; j < commentParts.length; j++) {
				var temp = commentParts[j].split("=");
				switch (temp[0]) {
					// case "Description ":
					// case "Description":
					// 		description = temp[1].substring(1);
					// 	break;
					case "Source ":
					case "Source":
							source = temp[1].substring(1);
						break;
					// case "Date ":
					// case "Date":
					// 		date = temp[1].substring(1);
					// 	break;
					case "Author ":
					case "Author":
							author = imageinfo.user;
						break;
					// case "Permission ":
					// case "Permission":
					// 		permission = temp[1].substring(1);
						break;
				}
			}

			var thumbItem = {
				image: imageinfo.thumburl,
				title: page.title.split(":")[1],
				date: date,
				description: description,
				source: source,
				author: author,
				permission: permission,
				comment: imageinfo.comment,
				descrUrl: imageinfo.descriptionurl
			}

			return thumbItem;
		}
})

.controller('WikiTemplateCtrl', function($scope, $stateParams, $http, Wiki, AppSettings) {
	$scope.template = {
		content: "",
		changesToSave: false,
		selectedBase: "foo"
	}

	$scope.selectBaseTemplate = function() {
		switch ($scope.template.selectedBase) {
			case "foo":
					$scope.template.content = "<noinclude>{{documentation}}</noinclude>\n\nfoo template";
				break;
			default:

		}
	}

	$scope.selectBaseTemplate();
});
