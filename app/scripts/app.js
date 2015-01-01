'use strict';

/**
 * @ngdoc overview
 * @name xmppTestApp
 * @description
 * # xmppTestApp
 *
 * Main module of the application.
 */
angular
  .module('xmppTestApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/login");

    $stateProvider

        .state('landing', {
            url: '/landing',
            templateUrl: 'views/landing.html',
            controller: 'LandingCtrl'
        })

        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        });

  });
