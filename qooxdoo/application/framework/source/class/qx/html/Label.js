/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * A cross browser label instance with support for rich HTML and text labels.
 *
 * Text labels supports ellipsis to reduce the text width.
 *
 * The mode can be changed through the method {@link #setRich}
 * which accepts a boolean value. The default mode is "text" which is
 * a good choice because it has a better performance.
 */
qx.Class.define("qx.html.Label",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyProperty : function(name, value)
    {
      this.base(arguments, name, value);

      if (name == "content") {
        qx.bom.Label.setContent(this._element, value);
      }
    },


    // overridden
    _createDomElement : function()
    {
      var rich = this.__rich;
      var el = qx.bom.Label.create(this._content, rich);

      // Styles must be stored locally to work together with
      // synchronisation in flush().
      var styles = qx.bom.Label.getStyles(rich);
      for (var key in styles) {
        this.setStyle(key, styles[key]);
      }

      return el;
    },




    /*
    ---------------------------------------------------------------------------
      LABEL API
    ---------------------------------------------------------------------------
    */

    /**
     * Toggles between rich HTML mode and pure text mode.
     *
     * @param value {Boolean} Whether the HTML mode should be used.
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setRich : function(value)
    {
      if (this._element) {
        throw new Error("The label mode cannot be modified after initial creation");
      }

      value = !!value;

      if (this.__rich == value) {
        return;
      }

      this.__rich = value;
      return this;
    },


    /**
     * Sets the HTML/text content depending on the content mode.
     *
     * @param value {Boolean} Whether the HTML mode should be used.
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setContent : function(value)
    {
      this._setProperty("content", value);
      return this;
    },


    /**
     * Get the current content.
     *
     * @return {String} The labels's content
     */
    getContent : function() {
      return this._getProperty("content");
    }
  }
});
