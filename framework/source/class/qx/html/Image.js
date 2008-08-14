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
 * This is a simple image class using the low level image features of
 * qooxdoo and wraps it for the qx.html layer.
 */
qx.Class.define("qx.html.Image",
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

      if (name === "source")
      {
        var elem = this._element;

        var source = this._getProperty("source");
        var scale = this._getProperty("scale");
        var repeat = scale ? "scale" : "no-repeat";

        qx.bom.element.Decoration.update(elem, source, repeat);
      }
    },


    // overridden
    _createDomElement : function()
    {
      var scale = this._getProperty("scale");
      var repeat = scale ? "scale" : "no-repeat";

      this._nodeName = qx.bom.element.Decoration.getTagName(repeat);

      return this.base(arguments);
    },


    // overridden
    // be sure that style attributes are merged and not overwritten
    _copyData : function(fromMarkup) {
      return this.base(arguments, true);
    },





    /*
    ---------------------------------------------------------------------------
      IMAGE API
    ---------------------------------------------------------------------------
    */

    /**
     * Configures the image source
     *
     * @param value {Boolean} Whether the HTML mode should be used.
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setSource : function(value)
    {
      this._setProperty("source", value);
      return this;
    },


    /**
     * Returns the image source.
     *
     * @return {String} Current image source.
     */
    getSource : function() {
      return this._getProperty("source");
    },


    /**
     * Resets the current source to null which means that no image
     * is shown anymore.
     */
    resetSource : function()
    {
      this._removeProperty("source");
      return this;
    },


    /**
     * Whether the image should be scaled or not.
     *
     * @param value {Boolean} Scale the image
     * @return {qx.html.Label} This instance for for chaining support.
     */
    setScale : function(value)
    {
      this._setProperty("scale", value);
      return this;
    },


    /**
     * Returns whether the image is scaled or not.
     *
     * @return {Boolean} Whether the image is scaled
     */
    getScale : function() {
      return this._getProperty("scale");
    }
  }
});
