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
#optional(qx.ui.form.Button)
#embed(qx.icontheme/16/actions/format-color.png)

************************************************************************ */

qx.Clazz.define("qx.manager.object.ColorManager",
{
  type : "singleton",
  extend : qx.manager.object.ObjectManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Themes
    this._colorThemes = {};

    // Contains the qx.renderer.color.ColorObjects which
    // represent a themed color.
    this._dependentObjects = {};
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

    colorTheme :
    {
      _legacy   : true,
      type      : "object",
      allowNull : false,
      instance  : "qx.renderer.theme.ColorTheme"
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
      REGISTRATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vThemeClass {var} TODOC
     * @return {void} 
     */
    registerColorTheme : function(vThemeClass)
    {
      this._colorThemes[vThemeClass.classname] = vThemeClass;

      if (vThemeClass.classname == qx.core.Setting.get("qx.colorTheme")) {
        this.setColorTheme(vThemeClass.getInstance());
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vId {var} TODOC
     * @return {void} 
     */
    setColorThemeById : function(vId) {
      this.setColorTheme(this._colorThemes[vId].getInstance());
    },




    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS FOR qx.renderer.color.ColorOBJECTS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param oObject {Object} TODOC
     * @return {void} 
     */
    add : function(oObject)
    {
      var vValue = oObject.getValue();

      this._objects[vValue] = oObject;

      if (oObject.isThemedColor()) {
        this._dependentObjects[vValue] = oObject;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param oObject {Object} TODOC
     * @return {void} 
     */
    remove : function(oObject)
    {
      var vValue = oObject.getValue();

      delete this._objects[vValue];
      delete this._dependentObjects[vValue];
    },


    /**
     * TODOC
     *
     * @type member
     * @param vValue {var} TODOC
     * @return {var} TODOC
     */
    has : function(vValue) {
      return this._objects[vValue] != null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vValue {var} TODOC
     * @return {var} TODOC
     */
    get : function(vValue) {
      return this._objects[vValue];
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyColorTheme : function(propValue, propOldValue, propData)
    {
      propValue.compile();

      for (var i in this._dependentObjects) {
        this._dependentObjects[i]._updateTheme(propValue);
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vParent {var} TODOC
     * @param xCor {var} TODOC
     * @param yCor {var} TODOC
     * @return {void} 
     */
    createThemeList : function(vParent, xCor, yCor)
    {
      var vButton;
      var vThemes = this._colorThemes;
      var vIcon = "icon/16/actions/format-color.png";
      var vPrefix = "Color Theme: ";
      var vEvent = "execute";

      for (var vId in vThemes)
      {
        var vObj = vThemes[vId].getInstance();
        var vButton = new qx.ui.form.Button(vPrefix + vObj.getTitle(), vIcon);

        vButton.setLocation(xCor, yCor);
        vButton.addEventListener(vEvent, new Function("qx.manager.object.ColorManager.getInstance().setColorThemeById('" + vId + "')"));

        vParent.add(vButton);

        yCor += 30;
      }
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
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      // Themes
      this._colorThemes = null;

      // Cleanup dependent objects
      for (var i in this._dependentObjects) {
        delete this._dependentObjects[i];
      }

      delete this._dependentObjects;

      return this.base(arguments);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    /*
    ---------------------------------------------------------------------------
      DEFAULT SETTINGS
    ---------------------------------------------------------------------------
    */

    "qx.colorTheme" : "qx.theme.color.WindowsRoyale"
  }
});
