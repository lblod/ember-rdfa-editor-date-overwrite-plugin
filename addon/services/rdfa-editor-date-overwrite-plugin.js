import Service from '@ember/service';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency';
import { isArray } from '@ember/array';
import { warn } from '@ember/debug';

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
 *  POTENTIAL ISSUES/TODO
 *  ---------------------
 *  - Current implementation passes the domNode to replace to the card. At insetion of the update hint, this might be problematic
 *      as this dom node can be removed from the tree. (e.g. in case a silent DOM update occurs like setting a highlight)
 *
 *     TODO: Robust update of domNode
 *
 *
 * ---------------------------------------------------
 * END CODE REVIEW NOTES
 * ---------------------------------------------------
 * @module editor-date-overwrite-plugin
 * @class RdfaEditorDateOverwritePlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorDateOverwritePlugin = Service.extend({

  /**
   * Restartable task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  execute: task(function * (hrId, contexts, hintsRegistry, editor) {
    const hints = [];
    contexts
      .filter(this.detectRelevantContext)
      .forEach( (ctx) => {
        hintsRegistry.removeHintsInRegion(ctx.region, hrId, this.get('who'));
        hints.pushObjects(this.generateHintsForContext(editor,ctx));
      });

    const cards = hints.map( (hint) => this.generateCard(hrId, hintsRegistry, editor, hint));
    if(cards.length > 0){
      hintsRegistry.addHints(hrId, this.get('who'), cards);
    }
  }),

  /**
   * Given context object, tries to detect a context the plugin can work on
   *
   * @method detectRelevantContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {Boolean}
   *
   * @private
   */
  detectRelevantContext(context){
    let lastTriple = context.context.slice(-1)[0];
    if(lastTriple.datatype == 'http://www.w3.org/2001/XMLSchema#date'){
      return true;
    }
    if(lastTriple.datatype == 'http://www.w3.org/2001/XMLSchema#dateTime'){
      return true;
    }
    return false;
  },

  /**
   * Generates a card given a hint
   *
   * @method generateCard
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   * @param {Object} hint containing the hinted string and the location of this string
   *
   * @return {Object} The card to hint for a given template
   *
   * @private
   */
  generateCard(hrId, hintsRegistry, editor, hint){
    return EmberObject.create({
      info: {
        plainValue: hint.text,
        value: hint.value,
        datatype: hint.datatype,
        location: hint.location,
        hrId, hintsRegistry, editor
      },
      location: hint.location,
      card: this.get('who'),
      options: { noHighlight: true }
    });
  },

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
  generateHintsForContext(editor, context){
    const triple = context.context.slice(-1)[0];
    const hints = [];
    const value = triple.object;
    const content= triple.content;
    const datatype = triple.datatype;
    const text = context.text || '';
    const location = context.region;
    hints.push({text, location, context, value, content, datatype});
    return hints;
  },

  ascendDomNodesUntil(rootNode, domNode, condition){
    if(!domNode || rootNode.isEqualNode(domNode)) return null;
    if(!condition(domNode))
      return this.ascendDomNodesUntil(rootNode, domNode.parentElement, condition);
    return domNode;
  },

  findDomNodeForContext(editor, context, condition){
    let richNodes = context.richNodes;
    let domNode = richNodes
          .map(r => this.ascendDomNodesUntil(editor.rootNode, r.domNode, condition))
          .find(d => d);
    if(!domNode){
      warn(`Trying to work on unattached domNode. Sorry can't handle these...`, {id: 'date-overwrite-plugin.domNode'});
    }
    return domNode;
  }
});

RdfaEditorDateOverwritePlugin.reopen({
  who: 'editor-plugins/date-overwrite-card'
});
export default RdfaEditorDateOverwritePlugin;
