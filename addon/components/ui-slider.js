import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line
const snake = thingy => {
  return thingy ? Ember.String.underscore(thingy) : thingy;
};
import layout from '../templates/components/ui-slider';
const numericApiSurface = ['min','max','step','precision','ticksSnapBounds'];
const booleanApiSurface = ['range','tooltipSplit','ticksTooltip','reversed','enabled','naturalArrowKeys','focus'];
const stringApiSurface = ['selection','tooltip','tooltipSeparator','tooltipPosition','selection','handle','scale','orientation'];
const arrayApiSurface = ['ticks','ticksPositions','ticksLabels'];
const functionalApiSurface = ['formatter'];
const apiSurface = [...numericApiSurface,...booleanApiSurface,...stringApiSurface,...arrayApiSurface, ...functionalApiSurface];
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
  classNameBindings: ['isSliding:sliding','_mood','_section','range:range:singular', 'fill:fill:fit'],
  // API Surface (defaults)
  min: 1,
  max: 10,
  step: 1,
  precision: 0,
  fill: true,
  orientation: 'horizontal',
  range: false,
  selection: 'before', // values are 'before', 'after', or 'none' and indicate placement
  tooltip: 'show' , // show, hide, or always
  tooltipSeparator: ':', // used in ranges
  tooltipPosition: 'top',
  tooltipSplit: false, // if false only one tooltip for ranges, if true then tooltips for both
  ticksTooltip: false,
  handle: 'round', // values are round, square, triangle, or custom
  reversed: false,
  enabled: Ember.computed("disabled", {
    get() {
      return !this.get("disabled");
    },
    set(key, value) {
      return value;
    }
  }),
  naturalArrowKeys: false,
  scale: 'linear',
  focus: false,
  ticks:[],
  ticksPositions:[],
  ticksLabels:[],
  ticksSnapBounds:0,
  // VALUE
  keepInRange: true,
  immediateResponse: false,
  _immediateResponse: on('init',observer('immediateResponse', function() {
    const immediateResponse = this.get('immediateResponse');
    let self = this;
    if(immediateResponse) {
      Ember.run.schedule('afterRender', () => {
        this._slider.on('slide', function(evt) {
          Ember.run.debounce(() => {
            self.set('value', evt.value);
          },30);
        });
      });
    } else {
      if(this._slider) {
        this._slider.off('slide');
      }
    }
  })),
  sections: null,
  _oldSection: null,
  _section: computed('value','sections', function() {
    const {_oldSection} = this.getProperties('_oldSection');
    const newSection = this.sectionCalculator();

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
    if(!sections || new A(['null','undefined']).includes(value)) {
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
      section = Math.floor((value-min)/sectionWidth) + 1;
    }

    return section;
  },
  _value: observer('value','min','max','step', function() {
    this._valueObserver();
  }),
  mood: null,
  _mood: computed('mood', function() {
    const mood = this.get('mood');
    return mood ? `mood-${mood}` : null;
  }),
  _valueObserver() {
    run.next(()=> {
      let {value,min,max,range} = this.getProperties('value','min','max','range');
      const controlValue = this._slider.slider('getValue');

      if(JSON.stringify(value) !== JSON.stringify(controlValue)) {
        // regardless of whether range or not process as an array
        value = typeOf(value) === 'array' ? value : [value];
        value = value.map(v => {
          v = (v < min) ? this.handleMinimalValue() : v;
          v = (v > max) ? this.handleMaximalValue() : v;

          return v;
        });
        // now convert back to scalar if appropriate
        value = range ? value : value[0];
        this.setValue(value);

        this.sendAction('action', 'value-sync', {
          context: this,
          value: value,
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
    this.setValue(this.get('value'));
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
    arrayApiSurface.map(item=> {
      let data = this.get(item);
      if(typeOf(data) === 'string') {
        data = data.split(',');
        data = data.map(d=> {
          return isNaN(Number(d)) ? d : Number(d);
        });
      }
      if(data) {
        options[snake(item)] = data;
      }
      return item;
    });
    stringApiSurface.map(item=>{
      options[snake(item)] = this.get(item);
      return item;
    });
    functionalApiSurface.map(item => {
      options[snake(item)] = this.get(item);
    });

    return options;
  },
  initializeJqueryComponent() {
    const elementId = this.get('elementId');
    let options = this.getConfiguration();
    let value = this.get('value');
    if(typeOf(value) === 'string') {
      value = isNaN(Number(value)) ? options.min : Number(value);
    }

    options = assign(options, {value: value});
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
  },
  destroyJqueryComponent() {
    this._slider.slider('destroy');
  },
  setDefaultValue() {
    let {defaultValue,value} = this.getProperties('defaultValue', 'value');
    if(new A(['null','undefined']).includes(typeOf(value))) {
      defaultValue = typeOf(defaultValue) === 'string' && defaultValue.split(',').length > 1 ? defaultValue.split(',') : defaultValue;
      this.set('value', defaultValue);
    }
  },
  ensureValueSynced() {
    const {value} = this.getProperties('value');
    if(!value) {
      this.set('value', this.getValue());
    }
  },
  getValue() {
    return this._slider.slider('getValue');
  },
  setValue(value) {
    this._slider.slider('setValue', value);
  },

  // LIFECYCLE HOOKS
  init() {
    this._super(...arguments);
    if(!this.get('elementId')) {
      this.set('elementId', 'ember-' + Math.random().toString(36).substr(2, 9));
    }

    run.schedule('afterRender', () => {
      this.initializeJqueryComponent();
      this.addEventListeners();
      this.setDefaultValue();
      this.ensureValueSynced(); // if no default value and value set then we need to get value from the control
      this._benchmarkConfig();
    });
  },
  willDestroyElement() {
    this._super(...arguments);
    this.destroyJqueryComponent();
  }
});
