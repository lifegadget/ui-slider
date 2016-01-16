/* jshint node: true */
'use strict';

module.exports = {
  name: 'ui-slider',
  description: 'A flexible UI slider for ambitious Ember apps',
  included: function(app) {
    app.import('bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.js');
    app.import('bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider.css');
    app.import('vendor/ui-slider/ui-slider.css');
  }
};
