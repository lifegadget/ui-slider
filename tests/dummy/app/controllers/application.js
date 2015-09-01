import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line

export default Ember.Controller.extend({
  flashMessages: Ember.inject.service(),
  value: 50,
  disabled: false,
  orientation: "horizontal",
  min: 10,
  max: 100,
  step: 1,
  tooltip: 'show',
  ticks: ['30','40','60'],
  defaultValue: 8,
  min2:1,
  max2:100,
  step2: 1,
  defaultValue2:50,
  DDAUvalue: null,

  actions: {
    action: function(type,options) {
      const flashMessages = this.get('flashMessages');
      let message = `ACTION: ${type}, value was ${options.value}.`;
      if(options.message) {
        message = message + ` Message was: ${options.message}`;
      }
      flashMessages.info(message);
    },
    sectionsAction: function(type,options) {
      const flashMessages = this.get('flashMessages');
      if(type === 'section-change') {
        let message = `Now in section: ${options.section}.`;
        flashMessages.success(message);
      }
    },
    error: function(code,options) {
      const flashMessages = this.get('flashMessages');
      flashMessages.danger(`ERROR: ${code}. Message: ${options.message}`);
    },
    changed: function(value,options) {
      const flashMessages = this.get('flashMessages');
      flashMessages.success(`CHANGED: to ${value} (from ${options.oldValue})`);
    },
    valueChanged: function(action, button) {
      if(action === 'pressed') {
        this.set('DDAUvalue', get(button, 'value'));
      }
    }
  }

});
