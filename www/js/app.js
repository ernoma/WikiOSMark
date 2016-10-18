// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'leaflet-directive', 'ngCordova', 'mapControllers', 'wikiControllers', 'settingsControllers', 'photoGalleryControllers', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'MapCtrl'
      }
    }
  })

  .state('tab.photo-detail', {
    url: '/photo/:photoID',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-photo.html',
        controller: 'PhotoGalleryCtrl'
      }
    }
  })

  .state('tab.wiki', {
      url: '/wiki',
      views: {
        'tab-wiki': {
          templateUrl: 'templates/tab-wiki.html',
          controller: 'WikiCtrl'
        }
      }
    })

    .state('tab.wiki-detail', {
      url: '/wiki/:wikiId/:coordinates',
      views: {
        'tab-wiki': {
          templateUrl: 'templates/tab-wiki-detail.html',
          controller: 'WikiDetailCtrl'
        }
      }
    })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-account.html',
        controller: 'SettingsCtrl'
      }
    }
  })
  .state('osmlanding', {
    url: '/osmlanding?oauth_token={oauthToken}',
    template: '',
    controller: function($stateParams) {
      console.log($stateParams.oauthToken);
    }
  })

  .state('tab.info', {
    url: '/info',
    views: {
      'tab-info': {
        templateUrl: 'templates/tab-info.html',
        controller: 'InfoCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/map');

});
