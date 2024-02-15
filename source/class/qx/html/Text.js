/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019-2020 Zenesis Limited, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (https://github.com/johnspackman, john.spackman@zenesis.com)

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
  construct(text) {
    super("#text");
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
    _createDomElement() {
      return window.document.createTextNode(this.__text || "");
    },

    /*
     * @Override
     */
    isRoot() {
      return false;
    },

    /*
     * @Override
     */
    _copyData(fromMarkup, propertiesFromDom) {
      super._copyData(fromMarkup, propertiesFromDom);
      var elem = this._domNode;
      elem.nodeValue = this.__text || "";
    },

    /*
     * @Override
     */
    _useNodeImpl(domNode) {
      this.setText(domNode.nodeValue);
    },

    /**
     * @Override
     */
    _syncData() {
      super._syncData();
      var elem = this._domNode;
      elem.nodeValue = this.__text || "";
    },

    /*
     * @Override
     */
    _serializeImpl(serializer) {
      serializer.rawTextInBody(this.__text);
    },

    /**
     * @Override
     */
    useMarkup(html) {
      throw new Error("Could not overwrite existing text node!");
    },

    /**
     * Sets the text value
     *
     * @param value {String?} the text value of for the text node
     * @param direct {Boolean?} whether to set the DOM node immediately if there is one
     */
    setText(value, direct) {
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
    getText() {
      return this.__text;
    }
  },

  /*
   * ****************************************************************************
   * DEFER
   * ****************************************************************************
   */

  defer(statics) {
    statics.__deferredCall = new qx.util.DeferredCall(statics.flush, statics);
  },

  /*
   * ****************************************************************************
   * DESTRUCT
   * ****************************************************************************
   */

  destruct() {
    if (this.toHashCode()) {
      delete qx.html.Element._modified[this.toHashCode()];
      delete qx.html.Element._scroll[this.toHashCode()];
    }

    this.__attribValues =
      this.__styleValues =
      this.__eventValues =
      this.__attribJobs =
      this.__styleJobs =
      this.__lazyScrollIntoViewX =
      this.__lazyScrollIntoViewY =
        null;
  }
});
