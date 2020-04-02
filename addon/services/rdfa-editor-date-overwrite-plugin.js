import Service from '@ember/service';
import EmberObject from '@ember/object';
import { A } from '@ember/array';

/**
 * Service responsible to check for RDFA date types and adding a hint to modify it when found.
 *
 * ---------------------------------------------------
 * CODE REVIEW NOTES
 * ---------------------------------------------------
 *
 *  INTERACTION PATTERNS
 *  --------------------
 *  For all incoming contexts, first look whether there is an rdfa node with dataType=xsd:date or xsd:datetime.
 *  If encountered, a hint is generated at the textual location of the content of that node.
 *  At hint insertion, the hinted node is replaced with update content.
 *
 * ---------------------------------------------------
 * END CODE REVIEW NOTES
 * ---------------------------------------------------
 */

const COMPONENT_ID = 'editor-plugins/date-overwrite-card';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-data-overwrite-plugin
 * @class RdfaEditorDateOverwritePlugin
 * @constructor
 * @extends EmberService
 */
export default class RdfaEditorDateOverwritePlugin extends Service {

  /**
   * Restartable task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} rdfaBlocks RDFablocks of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  execute(hrId, rdfaBlocks, hintsRegistry, editor) {
    const hints = A();
    hintsRegistry.removeHints( { rdfaBlocks, hrId, scope: COMPONENT_ID } );
    for (let block of rdfaBlocks) {
      if (this.isRelevant(block)) {
        hints.push(this.generateHint(block, hrId, editor, hintsRegistry));
      }
    }
    if (hints.length > 0) {
      hintsRegistry.addHints(hrId, COMPONENT_ID, hints);
    }
  }

  /**
   * Given the rdfa block, determines whether it's relevent for the plugin to work on
   *
   * @method isRelevant
   * @param {RdfaBlock} block a specific rdfa block
   * @return {Boolean}
   * @private
   */
  isRelevant(block){
    let lastTriple = block.context.slice(-1)[0];
    if(lastTriple.datatype == 'http://www.w3.org/2001/XMLSchema#date'){
      return true;
    }
    if(lastTriple.datatype == 'http://www.w3.org/2001/XMLSchema#dateTime'){
      return true;
    }
    return false;
  }

  /**
   * Generates a hint, given a context
   *
   * @method generateHintsForContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {Object} [{dateString, location}]
   *
   * @private
   */
  generateHint(block, hrId, editor, hintsRegistry) {
    const triple = block.context.slice(-1)[0];
    const value = triple.object;
    const content= triple.content;
    const datatype = triple.datatype;
    const text = block.text || '';
    return EmberObject.create({
      info: {
        plainValue: block.text || '',
        value: triple.object,
        datatype: triple.datatype,
        location: block.region,
        hrId, hintsRegistry, editor
      },
      location: block.region,
      card: COMPONENT_ID,
      options: { noHighlight: true }
    });
  }
}
