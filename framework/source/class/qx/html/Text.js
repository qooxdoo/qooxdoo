/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019 Zenesis Ltd www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
 * John Spackman (https://www.github.com/johnspackman)

 ************************************************************************ */

/**
 * DOM representation of Text nodes
 */
qx.Class.define("qx.html.Text", {
  extend: qx.html.Node,

  /*
   * ****************************************************************************
   * CONSTRUCTOR
   * ****************************************************************************
   */

  /**
   * Creates a new Text
   * 
   * @param value
   *          {String?} the value of the text
   */
  construct: function(text) {
    this.base(arguments, "#text");
    if (text) {
      this.__text = text;
    }
  },

  /*
   * ****************************************************************************
   * MEMBERS
   * ****************************************************************************
   */

  members: {
    __text: null,

    /*
     * @Override
     */
    _createDomElement: function() {
      return window.document.createTextNode(this.__text || "");
    },

    /*
     * @Override
     */
    isRoot : function() {
      return false;
    },
    
    /*
     * @Override
     */
    _copyData: function(fromMarkup) {
      this.base(arguments, fromMarkup);
      var elem = this._domNode;
      elem.nodeValue = this.__text || "";
    },
    
    /*
     * @Override
     */
    _useNode: function(domNode) {
      this.setText(domNode.nodeValue);
    },

    /*
     * @Override
     */
    _useNodeImpl: function(domNode) {
      this.setText(domNode.nodeValue);
    },

    /**
     * @Override
     */
    _syncData : function() {
      this.base(arguments);
      var elem = this._domNode;
      elem.nodeValue = this.__text || "";
    },
    
    /*
     * @Override
     */
    _serializeImpl: function(writer) {
      if (this.__nodeValue !== null) {
        writer(this.__text);
      }
    },
    
    /**
     * @Override
     */
    useMarkup: function(html) {
      throw new Error("Could not overwrite existing text node!");
    },
    
    /**
     * Sets the text value
     * 
     * @param value {String?} the text value of for the text node
     * @param direct {Boolean?} whether to set the DOM node immediately if there is one 
     */
    setText: function(value, direct) {
      this.__text = value;
      if (direct && this._domNode) {
        this._domNode.nodeValue = value;
      } else {
        qx.html.Element._modified[this.$$hash] = this;
        qx.html.Element._scheduleFlush("element");
      }
    },
    
    /**
     * Returns the value of the node
     * 
     * @return {String} the text node
     */
    getText: function() {
      return this.__text;
    }
  },

  /*
   * ****************************************************************************
   * DEFER
   * ****************************************************************************
   */

  defer: function(statics) {
    statics.__deferredCall = new qx.util.DeferredCall(statics.flush, statics);
  },

  /*
   * ****************************************************************************
   * DESTRUCT
   * ****************************************************************************
   */

  destruct: function() {
    if (this.toHashCode()) {
      delete qx.html.Element._modified[this.toHashCode()];
      delete qx.html.Element._scroll[this.toHashCode()];
    }

    this.__attribValues = this.__styleValues = this.__eventValues = this.__attribJobs = this.__styleJobs = this.__lazyScrollIntoViewX = this.__lazyScrollIntoViewY = null;
  }
});
