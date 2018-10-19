import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
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

  isDateTime: computed('info.datatype', function(){
    return this.get('info.datatype') == 'http://www.w3.org/2001/XMLSchema#dateTime';
  }),

  hours: computed('info.value', function(){
    return moment(this.info.value, this.rdfaDateformat).hours();
  }),

  minutes: computed('info.value', function(){
    return moment(this.info.value, this.rdfaDateformat).minutes();
  }),

  updatedDate: '',
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

  domNodeToUpdate: reads('info.domNode'),

  placeholder: computed('info.value', function(){
    return moment(this.info.value).format('DD/MM/YYYY');
  }),

  formatTimeStr(isoStr, hours){
    if(hours)
      return moment(isoStr).format('LL, LT');
    return moment(isoStr).format('LL');
  },

  createNewDomDateNodeHTML(domNode, newValue){
    let newDomNode = domNode.cloneNode(true);
    newDomNode.textContent = moment(newValue).format('LL');
    newDomNode.setAttribute('content', moment(newValue).format(this.rdfaDateFormat));
    return newDomNode.outerHTML;
  },

  createNewDomDatetimeNodeHTML(domNode, newValue, hours, minutes){
    let newDomNode = domNode.cloneNode(true);
    let dateTimeIso = moment(newValue).hours(hours || 0).minutes(minutes || 0).toISOString();
    newDomNode.textContent = this.formatTimeStr(dateTimeIso, hours);
    newDomNode.setAttribute('content', dateTimeIso);
    return newDomNode.outerHTML;
  },

  actions: {
    insert(){
      let mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      this.get('hintsRegistry').removeHintsAtLocation(mappedLocation, this.get('hrId'), 'editor-plugins/date-overwrite-card');
      this.editor.replaceNodeWithHTML(this.domNodeToUpdate , this.createNewDomDateNodeHTML(this.domNodeToUpdate, this.updatedDate), true);
    },

    insertDateTime(){
      let mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      this.get('hintsRegistry').removeHintsAtLocation(mappedLocation, this.get('hrId'), 'editor-plugins/date-overwrite-card');
      this.editor.replaceNodeWithHTML(this.domNodeToUpdate,
                                      this.createNewDomDatetimeNodeHTML(this.domNodeToUpdate, this.updatedDate, this.hours, this.minutes),
                                      true);
    }
  }
});
