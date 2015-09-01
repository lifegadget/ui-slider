import Ember from 'ember';
import layout from '../templates/components/ui-slider';
import UiSlider from 'ui-slider/components/ui-slider';

export default UiSlider.extend({
  layout: layout,
  value: [2,9],
  range: true
});
