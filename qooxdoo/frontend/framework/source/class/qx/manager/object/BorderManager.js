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

qx.Class.define("qx.manager.object.BorderManager",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Registers the themes
    this.__borderThemes = {};

    // Stores the objects
    this.__themedObjects = {};

    // Create empty themed border map
    this.__themedBorders = {};
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    borderTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyBorderTheme"
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
      BORDER VALUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Processing a border and handle callback execution on theme updates.
     *
     * @param obj {Object} Any object
     * @param callback {String} Name of callback function which handles the
     *   apply of the resulting value.
     * @param value {var} Any acceptable border value
     * @return {void}
     */
    process : function(obj, callback, value)
    {
      // Store references for themed borders
      var key = "border" + obj.toHashCode() + "$" + callback;
      var reg = this.__themedObjects;

      if (value && this.__themedBorders[value])
      {
        // Store reference for themed values
        reg[key] = { object : obj, callback : callback, value : value };
      }
      else if (reg[key])
      {
        // In all other cases try to remove previously created references
        delete reg[key];
      }

      // Finally executing given callback
      // Themed borders are able to overwrite the values of named and system borders
      // Simple return of all other named, system, hex, RGB strings
      // Validation is not done here.
      obj[callback](value ? this.__themedBorders[value] || value : null);
    },

    themedBorderToObject : function(value) {
      return this.__themedBorders[value];
    },

    isThemedBorder : function(value) {
      return this.__themedBorders[value] !== undefined;
    },





    /*
    ---------------------------------------------------------------------------
      BORDER THEME HANDLING
    ---------------------------------------------------------------------------
    */

    registerBorderTheme : function(vThemeClass)
    {
      this.__borderThemes[vThemeClass.name] = vThemeClass;

      if (vThemeClass.name == qx.core.Setting.get("qx.borderTheme")) {
        this.setBorderTheme(vThemeClass);
      }
    },


    setBorderThemeById : function(vId) {
      this.setBorderTheme(this.__borderThemes[vId]);
    },


    _applyBorderTheme : function(value, old)
    {
      // Generating RGB strings from themed borders
      var values = value.borders;
      var result = this.__themedBorders = {};
      var util = qx.util.BorderUtil;
      for (var key in values)
      {
        result[key] = new qx.renderer.border.Border;
        result[key].set(values[key]);
      }

      // Inform objects which have registered
      // regarding the theme switch
      var reg = this.__themedObjects;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];
        entry.object[entry.callback](result[entry.value]);
      }
    }
  },






  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.borderTheme" : "qx.theme.appearance.Classic"
  },





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__borderThemes", "__themedObjects", "__themedBorders");
  }
});
