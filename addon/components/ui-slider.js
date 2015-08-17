import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line

import layout from '../templates/components/ui-slider';
const numericApiSurface = ['min','max','step','precision'];
const booleanApiSurface = ['range','tooltip_split','reversed','enabled','natural_arrow_keys'];
const stringApiSurface = ['selection','tooltip','tooltip_separator', 'selection', 'handle'];
const arrayApiSurface = ['ticks','ticks_positions','ticks_labels'];
const apiSurface = [...numericApiSurface,...booleanApiSurface,...stringApiSurface,...arrayApiSurface];
const assign = function() {
  let target = {};

  for (let i = 0; i < arguments.length; i++) {
    let source = arguments[i];

    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

export default Ember.Component.extend({
  layout: layout,
  classNames: ['ui-slider'],
  // API Surface (defaults)
  min: 1,
  max: 10,
  step: 1,
  precision: 0,
  orientation: 'horizontal',
  range: false,
  selection: 'before', // values are 'before', 'after', or 'none' and indicate placement
  tooltip: 'show' , // show, hide, or always
  tooltip_separator: ':', // used in ranges
  tooltip_split: false, // if false only one tooltip for ranges, if true then tooltips for both
  handle: 'round', // values are round, square, triangle, or custom
  reversed: false,
  enabled: true,
  natural_arrow_keys: false,
  _value: computed('value','min','max','step', {
    set(_,value) {
      this.setValue(value);
      return value;
    },
    get() {
      return this.getValue();
    }
  }),
  setValue(value) {
    if(this._slider) {
      this._slider.slider('setValue', value);
    } else {
      // not ready
    }
  },
  getValue() {
    if(this._slider) {
      return this._slider.slider('getValue');
    }
  },

  // Functions
  disabled: false,
  _disabled: observer('disabled', function() {
    const disabled = this.get('disabled');
    run.next(()=>{
      if(disabled) {
        this._slider.slider('disable');
      } else {
        this._slider.slider('enable');
      }
    });
  }),
  // Configuration Changes
  _configObserver: observer(...apiSurface, function() {
    const changedConfig = apiSurface.filter(item => {
      return this[item] !== this._benchmark[item];
    });
    changedConfig.map(item => {
      this._slider.slider('setAttribute', item, get(this,item));
      this.sendAction('action', 'set-attribute', {context:this, property: item, value: get(this,item)});
    });
    this._slider.slider('refresh');
  }),
  _benchmarkConfig() {
    this._benchmark = this.getProperties(apiSurface);
  },



  initializeJqueryComponent() {
    let options = {};
    numericApiSurface.map(item=>{
      options[item] = Number(this.get(item));
      return item;
    });
    booleanApiSurface.map(item=>{
      options[item] = Boolean(this.get(item));
      return item;
    });
    let value = this.get('value');
    value = typeOf(value) === 'string' ? Number(value) : value;
    value =  Number.isNaN(value) ? options.min : value;
    options = assign(options, this.getProperties(stringApiSurface), {value: value});
    const elementId = this.get('elementId');
    // console.log('options: %o', options);
    this._slider = this.$(`#slider-value-${elementId}`).slider(options);
  },
  addEventListeners() {
    var self = this;
    self.$().on('slideStart', function(evt) {
      self.sendAction('action','slideStart',{context: self, value: evt.value, evt: evt});
    });
    self.$().on('slideStop', function(evt) {
      self.sendAction('action', 'slideStop', {context: self, value: evt.value, evt: evt});
    });
    self.$().on('changed', function(value,oldValue) {
      self.sendAction('changed', value, oldValue);
      self.set('value', evt.value);
    });

    // self.$().on('slide', function() {
    //   Ember.run.schedule('actions', function() {
    //     Ember.run.debounce(self, function() {
    //       if(self.get('immediateResponse')) {
    //         self.set('value', self.$().attr('value'));
    //       }
    //     }, 300);
    //   });
    // });
  },
  destroyJqueryComponent() {
    this._slider.slider('destroy');
  },
  setDefaultValue() {
    const {defaultValue,value} = this.getProperties('defaultValue', 'value');
    if(new A(['null','undefined']).contains(typeOf(value))) {
      this.set('value', defaultValue);
    }
  },

  // LIFECYCLE HOOKS
  _i: on('init', function() { return this._init(); }),
  _ia: on('didInitAttrs', function() { return this.didInitAttrs(); }),
  _r: on('willRender', function() { return this.willRender(); }),
  _d: on('willDestroyElement', function() { return this.willDestroyElement(); }),
  _dr: on('afterRender', function() { return this.didRender(); }),
  _rendered: false,

  _init() {
    run.schedule('afterRender', () => {
      this.initializeJqueryComponent();
      this.addEventListeners();
    });
  },
  willRender() {
    this.setDefaultValue();
  },
  didInitAttrs() {
    this._benchmarkConfig();
  },
  willDestroyElement() {
    this.destroyJqueryComponent();
  },
  didRender() {
    this._rendered = true;
  }
});
