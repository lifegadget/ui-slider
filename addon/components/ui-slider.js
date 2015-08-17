import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line
const snake = thingy => {
  return thingy ? Ember.String.underscore(thingy) : thingy;
};
import layout from '../templates/components/ui-slider';
const numericApiSurface = ['min','max','step','precision'];
const booleanApiSurface = ['range','tooltipSplit','reversed','enabled','naturalArrowKeys'];
const stringApiSurface = ['selection','tooltip','tooltipSeparator', 'tooltipPosition', 'selection', 'handle'];
const arrayApiSurface = ['ticks','ticksPositions','ticksLabels'];
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
const MINALIMAL_VALUE = 'min_value_exceeded';
const MAXIMAL_VALUE = 'max_value_exceeded';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['ui-slider'],
  classNameBindings: ['isSliding:sliding','_mood','_section'],
  // API Surface (defaults)
  min: 1,
  max: 10,
  step: 1,
  precision: 0,
  orientation: 'horizontal',
  range: false,
  selection: 'before', // values are 'before', 'after', or 'none' and indicate placement
  tooltip: 'show' , // show, hide, or always
  tooltipSeparator: ':', // used in ranges
  tooltipPosition: 'top',
  tooltipSplit: false, // if false only one tooltip for ranges, if true then tooltips for both
  handle: 'round', // values are round, square, triangle, or custom
  reversed: false,
  enabled: true,
  naturalArrowKeys: false,
  // VALUE
  keepInRange: true,
  _value: observer('value','min','max','step', function() {
    this._valueObserver();
  }),
  sections: null,
  _oldSection: null,
  _section: computed('value','sections', function() {
    const {_oldSection} = this.getProperties('_oldSection');
    const newSection = this.sectionCalculator();
    console.log('new section: %o', newSection);

    if(newSection && newSection !== _oldSection) {
      this.sendAction('action','section-change',{
        context: this,
        section: newSection,
        oldSection: _oldSection
      });
      this.set('_oldSection', newSection);
    }

    return newSection ? `section-${newSection}` : null;
  }),
  sectionCalculator() {
    let {sections,min,max,value} = this.getProperties('sections','min','max','value');
    console.log('section calculator: %o value', value);
    if(!sections || !value) {
      return null;
    }
    let section = 1;
    if(typeOf(sections) === 'array') {
      sections.map((item,index) => {
        if(item > min && item < max && value > item) {
          section = index+2;
        }
      });
    } else {
      const width = max - min + 1;
      const sectionWidth = width / Number(sections);
      console.log('width: %s. sectionWidth: %s', width,sectionWidth);
      section = Math.floor((value-min)/sectionWidth) + 1;
    }

    return section;
  },
  mood: null,
  _mood: computed('mood', function() {
    const mood = this.get('mood');
    return mood ? `mood-${mood}` : null;
  }),
  _valueObserver() {
    run.next(()=> {
      let {value,min,max,sections,_section} = this.getProperties('value','min','max','sections','_section');
      const controlValue = this._slider.slider('getValue');
      if(value !== controlValue) {
        value = (value < min) ? this.handleMinimalValue() : value;
        value = (value > max) ? this.handleMaximalValue() : value;
        this._slider.slider('setValue', value);
        this.sendAction('action', 'value-sync', {
          context: this,
          message: `A new value -- ${value} -- was received by container and pushed into slider UI`
        });
      }
    });
  },

  handleMinimalValue() {
    const {min,value,keepInRange} = this.getProperties('min','value','keepInRange');
    this.sendAction('error', MINALIMAL_VALUE, {
      message: `The minimum value [${min}] was exceeded: ${value}`,
      context: this
    });
    if(keepInRange) {
      run.next(()=>{
        this.set('value',min);
        this.sendAction('action', 'range-correction', {
          context: this,
          message: `The value was less than the minimum so resetting value to minimum [${min}]`,
          value: min,
          oldValue: value
        });
      });
    }

    return min;
  },
  handleMaximalValue() {
    const {max,value,keepInRange} = this.getProperties('max','value','keepInRange');
    this.sendAction('error', MAXIMAL_VALUE, {
      message: `The maximum value [${max}] was exceeded: ${value}`,
      context: this
    });
    if(keepInRange) {
      run.next(()=>{
        this.set('value',max);
        this.sendAction('action', 'range-correction', {
          context: this,
          message: `The value was less than the minimum so resetting value to minimum [${max}]`,
          value: max,
          oldValue: value
        });
      });
    }

    return max;
  },

  // Functions
  disabled: false,
  _disabled: observer('disabled', function() {
    const disabled = this.get('disabled');
    run.next(()=>{
      if(disabled) {
        this._slider.slider('disable');
        this.sendAction('action', 'slide-disabled', {
          context: this,
          value: this.get('value')
        });
      } else {
        this._slider.slider('enable');
        this.sendAction('action', 'slide-enabled', {
          context: this,
          value: this.get('value')
        });
      }
    });
  }),
  // Configuration Changes
  _configObserver: observer(...apiSurface, function() {
    this.updateConfig();
  }),
  updateConfig() {
    const changedConfig = apiSurface.filter(item => {
      return this[item] !== this._benchmark[item];
    });
    changedConfig.map(item => {
      this._slider.slider('setAttribute', snake(item), get(this,item));
      this.sendAction('action', 'set-attribute', {context:this, property: item, value: get(this,item)});
    });
    this._benchmarkConfig();
    this._slider.slider('refresh');
  },
  _benchmarkConfig() {
    this._benchmark = this.getProperties(apiSurface);
  },
  getConfiguration() {
    let options = {};
    numericApiSurface.map(item=>{
      options[snake(item)] = Number(this.get(item));
      return item;
    });
    booleanApiSurface.map(item=>{
      options[snake(item)] = Boolean(this.get(item));
      return item;
    });

    return options;
  },
  initializeJqueryComponent() {
    let options = this.getConfiguration();
    let value = this.get('value');
    value = typeOf(value) === 'string' ? Number(value) : value;
    value =  Number.isNaN(value) ? options.min : value;
    options = assign(options, this.getProperties(stringApiSurface), {value: value});
    const elementId = this.get('elementId');
    this._slider = this.$(`#slider-value-${elementId}`).slider(options);
  },
  addEventListeners() {
    var self = this;
    self._slider.on('slideStart', function(evt) {
      self.set('isSliding', true);
      evt.preventDefault();
      run.next(()=> {
        self.sendAction('action','slideStart',{context: self, value: evt.value, evt: evt});
      });
    });
    self._slider.on('slideStop', function(evt) {
      self.set('isSliding', false);
      evt.preventDefault();
      self.sendAction('action', 'slideStop', {context: self, value: evt.value, evt: evt});
      self.sendAction('changed', evt.value, {context: self, evt: evt, oldValue: self.get('value')});
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
  ensureValueSynced() {
    const {value} = this.getProperties('value');
    if(!value) {
      this.set('value', this._slider.slider('getValue'));
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
      this.setDefaultValue();
      this.ensureValueSynced(); // if no default value and value set then we need to get value from the control
    });
  },
  willRender() {

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
