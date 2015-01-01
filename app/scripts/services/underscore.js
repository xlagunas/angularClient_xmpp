'use strict';

/**
 * @ngdoc service
 * @name xmppTestApp.underscore
 * @description
 * # underscore
 * Factory in the xmppTestApp.
 */
angular.module('xmppTestApp')
  .factory('_', function () {
    return window._; // assumes underscore has already been loaded on the page
  });
