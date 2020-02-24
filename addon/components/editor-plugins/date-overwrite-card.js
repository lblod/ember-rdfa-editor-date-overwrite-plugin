import { computed } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/date-overwrite-card';
import moment from 'moment';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-date-overwrite-plugin
* @class DateOverwriteCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,

  _date: null,

  isDateTime: computed('info.datatype', function(){
    return this.get('info.datatype') == 'http://www.w3.org/2001/XMLSchema#dateTime';
  }),

  isValidValue: computed('_date', function() {
    return moment(this._date).isValid();
  }),

  isValidInput: computed('updatedDate', 'minutes', 'hours', function() {
    return moment(this.updatedDate).isValid() && (!this.isDateTime || (this.minutes && this.hours));
  }),

  isInvalidInput: not('isValidInput'),

  hours: computed('isValidValue', '_date', {
    get(){
      return this.isValidValue ? `${moment(this._date, this.rdfaDateformat).hours()}` : null;
    },
    set(k,v){
      if(v) this.set('_date', moment(this._date).hour(v).toISOString());
      return v;
    }
  }),

  minutes: computed('isValidValue', '_date', {
     get(){
      return this.isValidValue ? `${moment(this._date, this.rdfaDateformat).minutes()}` : null;
    },
    set(k,v){
      if(v) this.set('_date', moment(this._date).minutes(v).toISOString());
      return v;
    }
  }),

  updatedDate: computed('isValidValue', '_date', {
    get(){
      return this.isValidValue ? moment(this._date, this.rdfaDateformat) : null;
    },
    set(k, v){
      if(moment(v).isValid()){
        this.set('_date', moment(v).hours(this.hours || 0 ).minutes(this.minutes || 0).toISOString());
        return moment(this._date, this.rdfaDateformat);
      }
      return v;
    }
  }),

   didReceiveAttrs() {
     this._super(...arguments);
     if(moment(this.info.value).isValid())
       this.set('_date', this.info.value);
   },

  dateFormat: 'DD/MM/YYYY',
  rdfaDateFormat: 'YYYY-MM-DD',

  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  location: reads('info.location'),

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  hrId: reads('info.hrId'),

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  editor: reads('info.editor'),

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),

  placeholder: computed('info.value', function(){
    return moment(new Date()).format('DD/MM/YYYY');
  }),

  formatTimeStr(isoStr, hours){
    if(hours)
      return moment(isoStr).format('LL, LT');
    return moment(isoStr).format('LL');
  },

  createNewDateContent(newValue){
    const newContent = {
      text: moment(newValue).format('LL'),
      content:  moment(newValue).format(this.rdfaDateFormat)
    }
    return newContent;
  },


  firstMatchingDateNode(region){
    const dateNodes = this.editor.selectContext(region, { datatype: 'http://www.w3.org/2001/XMLSchema#date'})
    const dateTimeNodes = this.editor.selectContext(region, { datatype: 'http://www.w3.org/2001/XMLSchema#dateTime'})
    if(dateNodes.selections.length && dateTimeNodes.selections.length) {
      if(dateNodes.selections[0].range[0] < dateTimeNodes.selections[0].range[0]) {
        return dateNodes
      } else {
        return dateTimeNodes
      }
    } else if(dateNodes.selections.length) {
      return dateNodes
    } else {
      return dateTimeNodes
    }
  },

  createNewDatetimeContent(newValue, hours, minutes){
    let dateTimeIso = moment(newValue).hours(hours || 0).minutes(minutes || 0).toISOString();
    const newContent = {
      text: this.formatTimeStr(dateTimeIso, hours),
      content: dateTimeIso
    }
    return newContent
  },

  actions: {
    insert(){
      let mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      if (this.updatedDate.toISOString() !== this.info.value) {
        this.get('hintsRegistry').removeHintsAtLocation(mappedLocation, this.get('hrId'), 'editor-plugins/date-overwrite-card');
        const nodeToUpdate = this.firstMatchingDateNode(mappedLocation);
        if (nodeToUpdate) {
          const domNodeToUpdate = nodeToUpdate;
          console.log(domNodeToUpdate)
          var newContent;
          if (this.isDateTime) {
            newContent = this.createNewDatetimeContent(this.updatedDate, this.hours, this.minutes);
          }
          else {
            newContent = this.createNewDateContent(domNodeToUpdate, this.updatedDate);
          }
          console.log(newContent)
          this.editor.update(nodeToUpdate, {set: { innerHTML: newContent.text, content: newContent.content }})
        }
      }
    }
  }
});
