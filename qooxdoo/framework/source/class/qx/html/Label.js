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

    __rich : null,

    /*
    ---------------------------------------------------------------------------
      ELEMENT API
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyProperty : function(name, value)
    {
      this.base(arguments, name, value);

      if (name == "value")
      {
        var element = this.getDomElement();
        qx.bom.Label.setValue(element, value);
      }
    },


    // overridden
    _createDomElement : function()
    {
      var rich = this.__rich;
      var el = qx.bom.Label.create(this._content, rich);

      return el;
    },


    // overridden
    // be sure that style attributes are merged and not overwritten
    _copyData : function(fromMarkup) {
      return this.base(arguments, true);
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
     * @return {qx.html.Label} This instance for chaining support.
     */
    setRich : function(value)
    {
      var element = this.getDomElement();

      if (element) {
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
     * @param value {String} The content to be used.
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setValue : function(value)
    {
      this._setProperty("value", value);
      return this;
    },


    /**
     * Get the current content.
     *
     * @return {String} The labels's content
     */
    getValue : function() {
      return this._getProperty("value");
    }
  }
});
