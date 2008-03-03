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
      this.base(arguments);

      if (name == "content") {
        qx.bom.Label.setContent(this._element, value);
      }
    },


    // overridden
    _createDomElement : function()
    {
      this._element = qx.bom.Label.create(this._content, this._htmlMode);
      this._element.QxElement = this;
    },




    /*
    ---------------------------------------------------------------------------
      LABEL API
    ---------------------------------------------------------------------------
    */

    /**
     * Toggles the HTML mode
     *
     * @type member
     * @param value {Boolean} Whether the HTML mode should be used.
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setMode : function(value)
    {
      if (!!this._htmlMode == value) {
        return;
      }

      if (this._element) {
        throw new Error("The label HTML mode cannot be modified after initial creation");
      }

      this._htmlMode = value;
      return this;
    },


    /**
     * Sets the HTML/text content depending on the content mode.
     *
     * @type member
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
     * @type member
     * @return {String} The labels's content
     */
    getContent : function() {
      return this._getProperty("content");
    }
  }
});
