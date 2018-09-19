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
  updatedDate: '',
  dateFormat: 'DD/MM/YYYY',

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

  createNewDomNodeHTML(domNode, newValue){
    let newDomNode = domNode.cloneNode(true);
    newDomNode.textContent = moment(newValue).format('LL');
    newDomNode.setAttribute('content', moment(newValue).format('YYYY-MM-DD'));
    return newDomNode.outerHTML;
  },

  actions: {
    insert(){
      let mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      this.get('hintsRegistry').removeHintsAtLocation(this.get('location'), this.get('hrId'), 'editor-plugins/date-overwrite-card');
      this.editor.replaceNodeWithHTML(this.domNodeToUpdate , this.createNewDomNodeHTML(this.domNodeToUpdate, this.updatedDate), true);
    }
  }
});
