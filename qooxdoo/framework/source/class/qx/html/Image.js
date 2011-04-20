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
    // this member variable is only used for IE browsers to be able
    // to the tag name which will be set. This is heavily connected to the runtime
    // change of decorators and the use of external (=unmanaged images). It is
    // necessary to be able to determine what tag will be used e.g. before the
    // ImageLoader has finished its loading of an external image.
    // See Bug #3894 for more details
    tagNameHint : null,

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
        var elem = this.getDomElement();

        // To prevent any wrong background-position or -repeat it is necessary
        // to reset those styles whenever a background-image is updated.
        // This is only necessary if any backgroundImage was set already.
        // See bug #3376 for details
        var styles = this.getAllStyles();

        if (this.getNodeName() == "div" && this.getStyle("backgroundImage"))
        {
          styles.backgroundPosition = null;
          styles.backgroundRepeat = null;
        }

        var source = this._getProperty("source");
        var scale = this._getProperty("scale");
        var repeat = scale ? "scale" : "no-repeat";

        // Source can be null in certain circumstances.
        // See bug #3701 for details.
        if (source != null) {
          // Normalize "" to null
          source = source || null;

          qx.bom.element.Decoration.update(elem, source, repeat, styles);
        }
      }
    },

    // overridden
    _removeProperty : function(key, direct) {
      if (key == "source") {
        // Work-around check for null in #_applyProperty, introduced with fix
        // for bug #3701. Use empty string that is later normalized to null.
        // This fixes bug #4524.
        this._setProperty(key, "", direct);
      } else {
        this._setProperty(key, null, direct);
      }
    },

    // overridden
    _createDomElement : function()
    {
      var scale = this._getProperty("scale");
      var repeat = scale ? "scale" : "no-repeat";

      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        var source = this._getProperty("source");

        if (this.tagNameHint != null) {
          this.setNodeName(this.tagNameHint);
        } else {
          this.setNodeName(qx.bom.element.Decoration.getTagName(repeat, source));
        }
      }
      else
      {
        this.setNodeName(qx.bom.element.Decoration.getTagName(repeat));
      }

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
      // webkit browser do not allow to remove the required "src" attribute.
      // If removing the attribute the old image is still visible.
      if ((qx.core.Environment.get("engine.name") == "webkit")) {
        this._setProperty("source", "qx/static/blank.gif");
      } else {
        this._removeProperty("source", true);
      }
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
