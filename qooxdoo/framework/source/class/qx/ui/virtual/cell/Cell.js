/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * EXPERIMENTAL!
 *
 * Themeable Cell renderer.
 *
 * This cell renderer can be styled by an appearance theme.
 */
qx.Class.define("qx.ui.virtual.cell.Cell",
{
  extend : qx.ui.virtual.cell.Abstract,

  construct : function()
  {
    this.base(arguments);

    this.__stylesheet = qx.ui.virtual.cell.CellStylesheet.getInstance();

    this.__userStyles = {};
    this.__themeStyles = {};

    this.__userPaddings = {};
    this.__themePaddings = {};

    this.__states = {};
    this.__themeValues = {};

    this.initAppearance();
    this.__initializeThemableProperties();
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The appearance ID. This ID is used to identify the appearance theme
     * entry to use for this cell.
     */
    appearance :
    {
      check : "String",
      init : "cell",
      apply : "_applyAppearance"
    },


    /** The cell's background color */
    backgroundColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBackgroundColor",
      themeable : true
    },


    /** The cell's text color */
    textColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyTextColor",
      themeable : true
    },


    /** The text alignment of the cell's content */
    textAlign :
    {
      check : ["left", "center", "right", "justify"],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign"
    },


    /**
     * The cell's font. The value is either a font name defined in the font
     * theme or an instance of {@link qx.bom.Font}.
     */
    font :
    {
      nullable : true,
      apply : "_applyFont",
      check : "Font",
      themeable : true
    },


    /*
    ---------------------------------------------------------------------------
      PADDING
    ---------------------------------------------------------------------------
    */

    /** Padding of the widget (top) */
    paddingTop :
    {
      check : "Integer",
      init : 0,
      apply : "_applyPadding",
      themeable : true
    },


    /** Padding of the widget (right) */
    paddingRight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyPadding",
      themeable : true
    },


    /** Padding of the widget (bottom) */
    paddingBottom :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyPadding",
      themeable : true
    },


    /** Padding of the widget (left) */
    paddingLeft :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyPadding",
      themeable : true
    },


    /**
     * The 'padding' property is a shorthand property for setting 'paddingTop',
     * 'paddingRight', 'paddingBottom' and 'paddingLeft' at the same time.
     *
     * If four values are specified they apply to top, right, bottom and left
     * respectively. If there is only one value, it applies to all sides, if
     * there are two or three, the missing values are taken from the opposite
     * side.
     */
    padding :
    {
      group : [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ],
      mode  : "shorthand",
      themeable : true
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    __themableProperties : null,
    __statesKey : null,
    __states : null,

    __themeValues : null,
    __themeStyles : null,
    __userStyles : null,

    __userPaddings : null,
    __themePaddings : null,

    __isThemed : false,
    __stylesheet : null,


    __initializeThemableProperties : function()
    {
      var PropertyUtil = qx.util.PropertyUtil;

      var cssProperties = qx.lang.Object.fromArray(this._getCssProperties());
      this.__themableProperties = [];

      var clazz = this.constructor;
      while(clazz)
      {
        var properties = PropertyUtil.getProperties(clazz);
        for (var prop in properties) {
          if (!cssProperties[prop]) {
            this.__themableProperties.push(prop);
          }
        }
        clazz = clazz.superclass;
      }
    },


    _getCssProperties : function()
    {
      return [
        "backgroundColor", "textColor", "font", "textAlign",
        "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"
      ];
    },


    // property apply
    _applyAppearance : function(value, old)
    {
      if (old) {
        this.__themeStyles = {};
      }
    },


    _getValue : function(propertyName)
    {
      if (this.__isThemed) {
        return qx.util.PropertyUtil.getThemeValue(this, propertyName);
      } else {
        return qx.util.PropertyUtil.getUserValue(this, propertyName);
      }
    },


    /**
     * Store a properties computed style string either in the user or in the
     * theme values. User values will be applied as inline styles, while theme
     * values are stored in a stylesheet.
     *
     * @param name {String} The property name
     * @param styles {String} String with computed CSS styles
     */
    _storeStyle : function(propertyName, styles)
    {
      var store;

      if (this.__isThemed) {
        store = this.__themeStyles;
      } else {
        store = this.__userStyles;
      }

      if (styles === null) {
        delete store[propertyName];
      } else {
        store[propertyName] = styles;
      }
    },


    // property apply
    _applyBackgroundColor : function(value, old, name)
    {
      var value = this._getValue(name);
      if (!value) {
        this._storeStyle(name, null);
      } else {
        this._storeStyle(name, "background-color:" + qx.theme.manager.Color.getInstance().resolve(value));
      }
    },


    // property apply
    _applyTextColor : function(value, old, name)
    {
      var value = this._getValue(name);
      if (!value) {
        this._storeStyle(name, null);
      } else {
        this._storeStyle(name, "color:" + qx.theme.manager.Color.getInstance().resolve(value));
      }
    },


    // property apply
    _applyTextAlign : function(value, old, name)
    {
      var value = this._getValue(name);
      if (!value) {
        this._storeStyle(name, null);
      } else {
        this._storeStyle(name, "text-align:" + value);
      }
    },


    // property apply
    _applyFont : function(value, old, name)
    {
      var value = this._getValue(name);
      if (!value) {
        this._storeStyle(name, null);
      } else {
        var font = qx.theme.manager.Font.getInstance().resolve(value)
        this._storeStyle(name, qx.bom.element.Style.compile(font.getStyles()));
      }
    },


    // property apply
    _applyPadding : function(value, old, name)
    {
      var value = this._getValue(name);

      if (this.__isThemed) {
        var paddingStore = this.__themePaddings;
      } else {
        paddingStore = this.__userPaddings;
      }

      if (value === null) {
        delete paddingStore[name];
      } else {
        paddingStore[name] = value;
      }

      if (value === null) {
        this._storeStyle(name, null)
      } else {
        var cssKey = qx.lang.String.hyphenate(name);
        this._storeStyle(name, cssKey + ":" + value + "px");
      }
    },



    /*
    ---------------------------------------------------------------------------
      IMPLEMENT CELL API
    ---------------------------------------------------------------------------
    */

    getCellProperties : function(value, states)
    {
      this.__setStates(states);
      return {
        classes : this.getCssClasses(value, states),
        style : this.getStyles(value, states),
        attributes : this.getAttributes(value, states),
        content : this.getContent(value, states),
        insets : this.getInsets(value, states)
      };
    },


    getAttributes : function(value, states) {
      return "";
    },


    getContent : function(value, states) {
      return value;
    },


    // overridden
    getCssClasses : function(value, states)
    {
      var cssClass = this.__stylesheet.getCssClass(this.__statesKey) || "";
      return "qx-cell " + cssClass;
    },


    __setStates : function(states)
    {

      // Avoid errors if no states are set
      if (!states) {
        states = {};
      }

      var appearance = this.getAppearance();
      var statesKey = appearance + "-" + qx.lang.Object.getKeys(states).sort().join(" ");
      if (this.__statesKey == statesKey) {
        return;
      }
      this.__statesKey = statesKey;

      var themeStyles = this.__states[this.__statesKey];
      if (!themeStyles)
      {
        this.__clearThemedPropertyValues();
        this.__updateThemeableProperties(states);
        this.__computeCssClassForStates(states);
        this.__cacheThemedValues();

        var themeStyles = qx.lang.Object.clone(this.__themeStyles);
        this.__states[this.__statesKey] = 1;
      }
      this.__applyThemeValues();
    },


    __clearThemedPropertyValues : function()
    {
      var PropertyUtil = qx.util.PropertyUtil;
      var themableProperties = this._getCssProperties();
      for (var i=0; i<themableProperties.length; i++) {
        PropertyUtil.deleteThemeValue(this, themableProperties[i]);
      }
    },


    __updateThemeableProperties : function(states)
    {
      this.__themeStyles = {};

      this.__isThemed = true;

      var appearance = this.getAppearance();
      var PropertyUtil = qx.util.PropertyUtil;

      var styles = qx.theme.manager.Appearance.getInstance().styleFrom(appearance, states);
      for (var prop in styles)
      {
        if (styles[prop] !== undefined) {
          PropertyUtil.setThemed(this, prop, styles[prop]);
        }
      }

      this.__isThemed = false;
    },


    __computeCssClassForStates : function()
    {
      var styleString = qx.lang.Object.getValues(this.__themeStyles).join(";");
      this.__stylesheet.computeClassForStyles(this.__statesKey, styleString);
    },


    __cacheThemedValues : function()
    {
      var properties = this.__themableProperties;
      var PropertyUtil = qx.util.PropertyUtil;

      var themeValues = {};
      for (var i=0; i<properties.length; i++)
      {
        var key = properties[i];
        var value = PropertyUtil.getThemeValue(this, key);
        if (value !== undefined) {
          themeValues[key] = value;
        }
      }
      this.__themeValues[this.__statesKey] = themeValues;
    },


    __applyThemeValues : function()
    {
      var PropertyUtil = qx.util.PropertyUtil;
      var themeValues = this.__themeValues[this.__statesKey] || {};
      for (var key in themeValues) {
        PropertyUtil.setThemed(this, key, themeValues[key]);
      }
    },


    // overridden
    getStyles: function(value, states) {
      return qx.lang.Object.getValues(this.__userStyles).join(";");
    },


    // overridden
    getInsets : function(value, states)
    {
      var user = this.__userPaddings;
      var theme = this.__themePaddings;

      var top = (user.paddingTop !== undefined ? user.paddingTop : theme.paddingTop) || 0;
      var right = (user.paddingRight !== undefined ? user.paddingRight : theme.paddingRight) || 0;
      var bottom = (user.paddingBottom !== undefined ? user.paddingBottom : theme.paddingBottom) || 0;
      var left = (user.paddingLeft !== undefined ? user.paddingLeft : theme.paddingLeft) || 0;

      return [left + right, top + bottom];
    }
  },


  destruct : function() {
    this.__stylesheet = this.__userStyles = this.__themeStyles = null;
    this.__userPaddings = this.__themePaddings = this.__states = null;
    this.__themeValues = this.__themableProperties = null;
  }
});
