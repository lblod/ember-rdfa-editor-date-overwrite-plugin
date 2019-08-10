import { action } from '@ember/object';
import { computed } from '@ember/object';
import { reads, not, alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/date-overwrite-card';
import moment from 'moment';
import { inject as service} from '@ember/service';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-date-overwrite-plugin
* @class DateOverwriteCard
* @extends Ember.Component
*/
export default class EditorPluginDateOverWriteCardComponent extends Component {
  layout = layout

  @service store

  @computed("info.rdfaProperty")
  get rdfsPropertyObject() {
  	if(this.get("info.rdfaProperty")) {
  		return this.store.peekAll('rdfs-property').filterBy('rdfaType', this.info.rdfaProperty).firstObject;
  	} // TODO: only works if property was fetched beforehand.
  }

  @alias( "rdfsPropertyObject.label" ) propertyLabel

  _date = null

  dateFormat = 'DD/MM/YYYY'
  rdfaDateFormat = 'YYYY-MM-DD'


  @computed('info.datatype')
  get isDateTime(){
    return this.get('info.datatype') == 'http://www.w3.org/2001/XMLSchema#dateTime';
  }

  @computed( '_date' )
  get isValidValue() {
    return moment(this._date).isValid();
  }

  @computed('updatedDate', 'minutes', 'hours')
  get isValidInput() {
    return moment(this.updatedDate).isValid() && (!this.isDateTime || (this.minutes && this.hours));
  }

  @not('isValidInput') isInvalidInput

  @computed('isValidValue', '_date')
  get hours() {
    return this.isValidValue ? `${moment(this._date, this.rdfaDateformat).hours()}` : null;
  }

  @action
  setHours(h) {
    if(h) this.set('_date', moment(this._date).hour(h).toISOString());
  }

  @computed('isValidValue', '_date')
  get minutes(){
    return this.isValidValue ? `${moment(this._date, this.rdfaDateformat).minutes()}` : null;
  }

  @action
  setMinutes(m) {
    if(m) this.set('_date', moment(this._date).minutes(m).toISOString());
  }

  @computed('isValidValue', '_date')
  get updatedDate() {
    return this.isValidValue ? moment(this._date, this.rdfaDateformat) : null;
  }

  didReceiveAttrs() {
    this._super(...arguments);
    if(moment(this.info.value).isValid())
      this.set('_date', this.info.value);
  }

  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  @reads('info.location') location

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  @reads('info.hrId') hrId

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  @reads('info.editor') editor

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  @reads('info.hintsRegistry') hintsRegistry

  @computed('info.value')
  get placeholder(){
    return moment(new Date()).format('DD/MM/YYYY');
  }

  formatTimeStr(isoStr, hours){
    if(hours)
      return moment(isoStr).format('LL, LT');
    return moment(isoStr).format('LL');
  }

  createNewDomDateNodeHTML(domNode, newValue){
    let newDomNode = domNode.cloneNode(true);
    newDomNode.textContent = moment(newValue).format('LL');
    newDomNode.setAttribute('content', moment(newValue).format(this.rdfaDateFormat));
    return newDomNode.outerHTML;
  }

  firstMatchingDateNode(region){
    const contexts = this.editor.getContexts({ region });
    const baseUri = 'http://www.w3.org/2001/XMLSchema#';
    const context = contexts.find(( snippet) =>  {
      const types = [
        'http://www.w3.org/2001/XMLSchema#date',
        'http://www.w3.org/2001/XMLSchema#dateTime'
      ];
      const node = snippet.semanticNode;
      return node.rdfaAttributes
      	&& node.rdfaAttributes.datatype
      	&& types.includes(node.rdfaAttributes.datatype.replace('xsd:', baseUri));
    });
    if (context) {
      return context.semanticNode;
    }
  }

  createNewDomDatetimeNodeHTML(domNode, newValue, hours, minutes){
    let newDomNode = domNode.cloneNode(true);
    let dateTimeIso = moment(newValue).hours(hours || 0).minutes(minutes || 0).toISOString();
    newDomNode.textContent = this.formatTimeStr(dateTimeIso, hours);
    newDomNode.setAttribute('content', dateTimeIso);
    return newDomNode.outerHTML;
  }

  @action
  updateDate(v){
    console.log("updateddate");
    if(moment(v).isValid()){
      this.set('_date', moment(v).hours(this.hours || 0 ).minutes(this.minutes || 0).toISOString());
      return moment(this._date, this.rdfaDateformat);
    }
  }

  @action
  insert(){
    if( !this.isValidInput )
      return;
    
    let mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
    if (this.updatedDate.toISOString() !== this.info.value) {
      this.get('hintsRegistry').removeHintsAtLocation(mappedLocation, this.get('hrId'), 'editor-plugins/date-overwrite-card');
      const nodeToUpdate = this.firstMatchingDateNode(mappedLocation);
      if (nodeToUpdate) {
        const domNodeToUpdate = nodeToUpdate.domNode;
        var newValue;
        if (this.isDateTime) {
          newValue = this.createNewDomDatetimeNodeHTML(domNodeToUpdate, this.updatedDate, this.hours, this.minutes);
        }
        else {
          newValue = this.createNewDomDateNodeHTML(domNodeToUpdate, this.updatedDate);
        }
        this.editor.replaceNodeWithHTML(domNodeToUpdate, newValue, true);
      }
    }
  }
    
}

