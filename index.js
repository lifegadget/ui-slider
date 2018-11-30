/* jshint node: true */
'use strict';

var util = require('util');
var extend = util._extend;

var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var fastbootTransform = require('fastboot-transform');

var defaultOptions = {
  importBootstrapSliderCSS: true,
  importAddonCss: true
};

module.exports = {
  name: 'ui-slider',
  description: 'A flexible UI slider for ambitious Ember apps',

  treeForVendor(defaultTree) {
    var browserVendorLib = fastbootTransform(
      new Funnel('bower_components/seiyria-bootstrap-slider/dist', {
        files: [
          'bootstrap-slider.js'
        ]
      })
    )

    if (defaultTree) {
      return new mergeTrees([defaultTree, browserVendorLib]);
    }

    return browserVendorLib
  },

  included: function(app) {
    var parentApp = (typeof app.import !== 'function' && app.app) ? app.app : app;
    var options = extend(defaultOptions, app.options['ui-slider']);

    parentApp.import('vendor/bootstrap-slider.js');

    if (options.importBootstrapSliderCSS) {
      parentApp.import('bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css');
    }

    if (options.importAddonCss) {
      parentApp.import('vendor/ui-slider/ui-slider.css');
    }
  }
};
