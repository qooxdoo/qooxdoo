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
      this.base(arguments);

      if (name == "content") {
        qx.bom.Image.setSource(this._element, value);
      }
    },


    // overridden
    _createDomElement : function() {
      return qx.bom.Image.create(this._source);
    },





    /*
    ---------------------------------------------------------------------------
      IMAGE API
    ---------------------------------------------------------------------------
    */

    /**
     * Configures the image source (a full qualified URL)
     *
     * @type member
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
     * @type member
     * @return {String} Current image source.
     */
    getSource : function() {
      return this._getProperty("source");
    }
  }
});
