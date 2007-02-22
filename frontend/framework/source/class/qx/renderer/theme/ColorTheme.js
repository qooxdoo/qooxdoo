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

qx.Clazz.define("qx.renderer.theme.ColorTheme",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vTitle)
  {
    qx.core.Object.call(this);

    this._compiledColors = {};
    this.setTitle(vTitle);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    title :
    {
      _legacy      : true,
      type         : "string",
      allowNull    : false,
      defaultValue : ""
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
      DATA
    ---------------------------------------------------------------------------
    */

    _needsCompilation : true,
    _colors : {},




    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vName {var} TODOC
     * @return {var} TODOC
     */
    getValueByName : function(vName) {
      return this._colors[vName] || "";
    },


    /**
     * TODOC
     *
     * @type member
     * @param vName {var} TODOC
     * @return {var} TODOC
     */
    getStyleByName : function(vName) {
      return this._compiledColors[vName] || "";
    },




    /*
    ---------------------------------------------------------------------------
      PRIVATE METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    compile : function()
    {
      if (!this._needsCompilation) {
        return;
      }

      for (var vName in qx.renderer.color.Color.themedNames) {
        this._compileValue(vName);
      }

      this._needsCompilation = false;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vName {var} TODOC
     * @return {void} 
     */
    _compileValue : function(vName)
    {
      var v = this._colors[vName];
      this._compiledColors[vName] = v ? qx.renderer.color.Color.rgb2style.apply(this, this._colors[vName]) : vName;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _register : function() {
      return qx.manager.object.ColorManager.getInstance().registerTheme(this);
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      delete this._colors;
      delete this._compiledColors;

      qx.core.Object.prototype.dispose.call(this);
    }
  }
});
