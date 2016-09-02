/* jshint node: true */
'use strict';

module.exports = {
  name: 'ui-slider',
  description: 'A flexible UI slider for ambitious Ember apps',
  included: function(app) {
    let parentApp = (typeof app.import !== 'function' && app.app) ? app.app : app;

    parentApp.import('bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.js');
    parentApp.import('bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css');
    parentApp.import('vendor/ui-slider/ui-slider.css');
  }
};
