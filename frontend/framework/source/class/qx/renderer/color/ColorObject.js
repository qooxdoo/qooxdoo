/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.renderer.color.ColorObject",
{
  extend : qx.renderer.color.Color,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vValue)
  {
    // this.debug("Value: " + vValue);
    this.setValue(vValue);

    if (qx.manager.object.ColorManager.getInstance().has(this.getValue())) {
      return qx.manager.object.ColorManager.getInstance().get(this.getValue());
    }

    this.base(arguments);

    // Register this color object to manager instance
    qx.manager.object.ColorManager.getInstance().add(this);

    // Here will all objects with a dependency to this
    // color stored.
    this._dependentObjects = {};
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @param vDefString {var} TODOC
     * @return {var} TODOC
     */
    fromString : function(vDefString) {
      return new qx.renderer.color.ColorObject(vDefString);
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Set a new value from selected theme (only for Operating System Colors)
     *
     * @type member
     * @param vTheme {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    _updateTheme : function(vTheme)
    {
      if (!this._isThemedColor) {
        throw new Error("Could not redefine themed value of non os colors!");
      }

      this._applyThemedValue();
      this._syncObjects();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _applyThemedValue : function()
    {
      var vTheme = qx.manager.object.ColorManager.getInstance().getColorTheme();
      var vRgb = vTheme.getValueByName(this._value);

      if (vRgb)
      {
        this._red = vRgb[0];
        this._green = vRgb[1];
        this._blue = vRgb[2];
      }

      this._style = vTheme.getStyleByName(this._value);
      this._hex = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _syncObjects : function()
    {
      for (var i in this._dependentObjects) {
        this._dependentObjects[i]._updateColors(this, this._style);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vValue {var} TODOC
     * @return {void}
     */
    setValue : function(vValue)
    {
      this._normalize(vValue);
      this._syncObjects();
    },




    /*
    ---------------------------------------------------------------------------
      OBJECT MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    add : function(vObject) {
      this._dependentObjects[vObject.toHashCode()] = vObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vObject {var} TODOC
     * @return {void}
     */
    remove : function(vObject) {
      delete this._dependentObjects[vObject.toHashCode()];
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeDeep("_dependentObjects", 0);
  }
});
