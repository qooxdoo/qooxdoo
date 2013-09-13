/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * Text selection manipulation module
 */
qx.Bootstrap.define("qx.module.TextSelection", {
  statics: {

    /**
     * Get the selection of the first element.
     *
     * @return {String|null}
     */
    getTextSelection : function() {
      var el = this[0];
      if (el) {
        return qx.bom.Selection.get(el);
      }

      return null;
    },


    /**
     * Get the length of the selection of the first element.
     *
     *
     * @return {Integer|null}
     */
    getTextSelectionLength : function() {
      var el = this[0];
      if (el) {
        return qx.bom.Selection.getLength(el);
      }

      return null;
    },


    /**
     * Get the start of the selection of the first element.
     *
     * @return {Integer|null}
     */
    getTextSelectionStart : function() {
      var el = this[0];
      if (el) {
        return qx.bom.Selection.getStart(el);
      }

      return null;
    },


    /**
     * Get the end of the selection of the first element.
     *
     * @return {Integer|null}
     */
    getTextSelectionEnd : function() {
      var el = this[0];
      if (el) {
        return qx.bom.Selection.getEnd(el);
      }

      return null;
    },


    /**
     * Set the selection of each element with the given start and end value.
     * If no end value is passed the selection will extend to the end.
     *
     * @param start {Integer} start of the selection (zero based)
     * @param end {Integer} end of the selection
     * @return {qxWeb} The collection for chaining.
     */
    setTextSelection : function(start, end) {
      this._forEachElement(function(el) {
        qx.bom.Selection.set(el, start, end);
      });
      return this;
    },


    /**
     * Clears the selection of all elements.
     *
     * @return {qxWeb} The collection for chaining.
     */
    clearTextSelection : function() {
      this._forEachElement(function(el) {
        qx.bom.Selection.clear(el, start, end);
      });
      return this;
    }
  },


  defer : function(statics) {
    qxWeb.$attach({
      "getTextSelection" : statics.getTextSelection,
      "getTextSelectionLength" : statics.getTextSelectionLength,
      "getTextSelectionStart" : statics.getTextSelectionStart,
      "getTextSelectionEnd" : statics.getTextSelectionEnd,
      "setTextSelection" : statics.setTextSelection,
      "clearTextSelection" : statics.clearTextSelection
    });

  }
});
