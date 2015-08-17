import Ember from 'ember';

export default Ember.Controller.extend({
  flashMessages: Ember.inject.service(),
  value: 50,
  disabled: false,
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

  actions: {
    action: function(type,options) {
      const flashMessages = this.get('flashMessages');
      flashMessages.info(`Action ${type} at value ${options.value}`);
    },
    error: function(type,obj,options) {

    },
    changed: function(value,oldValue) {
      const flashMessages = this.get('flashMessages');
      flashMessages.success(`Value changed to ${value} (from ${oldValue})`);
    }
  }

});
