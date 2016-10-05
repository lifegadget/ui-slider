/* jshint node: true */
'use strict';

var util = require('util');
var extend = util._extend;

var defaultOptions = {
  importBootstrapSliderCSS: true,
  importAddonCss: true
};

module.exports = {
  name: 'ui-slider',
  description: 'A flexible UI slider for ambitious Ember apps',
  included: function(app) {
    var parentApp = (typeof app.import !== 'function' && app.app) ? app.app : app;
    var options = extend(defaultOptions, app.options['ui-slider']);

    parentApp.import('bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.js');

    if (options.importBootstrapSliderCSS) {
      parentApp.import('bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css');
    }
    if (options.importAddonCss) {
      parentApp.import('vendor/ui-slider/ui-slider.css');
    }
  }
};
