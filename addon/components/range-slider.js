import Ember from 'ember';
import layout from '../templates/components/ui-slider';
import UiSlider from '../addon/ui-slider';

export default UiSlider.extend({
  layout: layout,
  value: [2,8],
  range: true
});
