import Service from '@ember/service';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency';
import { isArray } from '@ember/array';
import { warn } from '@ember/debug';

/**
 * Service responsible for detecting dates and hinting invisible dates.
 *
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
  }).restartable(),

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
        label: `Wijzig de datum`,
        plainValue: hint.text,
        value: hint.value,
        datatype: hint.datatype,
        domNode: hint.domNode,
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
    const text = context.text;
    const location = context.region;
    const domNode = this.findDomNodeForContext(editor, context, this.firstMatchingDateDom);
    hints.push({text, location, context, value, domNode, content, datatype});
    return hints;
  },

  firstMatchingDateDom(domNode){
    if(!domNode.attributes || !domNode.attributes.datatype)
      return false;

    let baseUri = 'http://www.w3.org/2001/XMLSchema#';
    let expandedProperty = domNode.attributes.datatype.value.replace('xsd:', baseUri);

    if('http://www.w3.org/2001/XMLSchema#date' == expandedProperty)
      return true;
    if('http://www.w3.org/2001/XMLSchema#dateTime' == expandedProperty)
      return true;

    return false;
  },

  ascendDomNodesUntil(rootNode, domNode, condition){
    if(!domNode || rootNode.isEqualNode(domNode)) return null;
    if(!condition(domNode))
      return this.ascendDomNodesUntil(rootNode, domNode.parentElement, condition);
    return domNode;
  },

  findDomNodeForContext(editor, context, condition){
    let richNodes = isArray(context.richNode) ? context.richNode : [ context.richNode ];
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
