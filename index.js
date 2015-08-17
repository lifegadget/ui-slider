/* jshint node: true */
'use strict';

module.exports = {
  name: 'ui-slider',
  description: 'A flexible UI slider for ambitious Ember apps',
  included: function(app) {
    app.import('bower_components/seiyria-bootstrap-slider/js/bootstrap-slider.js');
    app.import('bower_components/seiyria-bootstrap-slider/css/bootstrap-slider.css');
  }
};
