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
    
    this.__stylesheet = qx.ui.virtual.cell.CellStylesheet.getInstance().getStylesheet();
  
    this.__userStyles = {};
    this.__themeStyles = {};
    
    this.__userPaddings = {};
    this.__themePaddings = {};
    
    this.__styles = {};
    this.__classes = {};
    
    this.initAppearance();
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

    // property apply
    _applyAppearance : function(value, old)
    {
      if (old)
      {
        for (var cssClass in this.__classes) {
          qx.bom.Stylesheet.removeRule(this.__stylesheet, "." + cssClass);
        }
        this.__classes = {};
        this.__styles = {};
        this.__themePaddings = {};
        this.__classCounter = 0;
        this.__themeStyles = {};
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
    _store : function(name, styles) 
    {
      var userValue = this["$$user_" + name];
      
      // if the user "reseted" the property
      if (!this.__isThemed && userValue === undefined)
      {
        delete this.__userStyles[name];
        var store = this.__themeStyles;
      }
      else if (this.__isThemed) 
      {
        var store = this.__themeStyles;
      }
      else
      {
        var store = this.__userStyles;
      }
      
      if (styles === null) {
        delete store[name];
      } else {
        store[name] = styles;
      }
      
    },
   
    
    // property apply
    _applyBackgroundColor : function(value, old, name) {
      this.__store(
        name,
        value ?
          "background-color:" + qx.theme.manager.Color.getInstance().resolve(value) :
          null
      );
    },

    
    // property apply
    _applyTextColor : function(value, old, name) {
      this.__store(
        name,
        value ?
          "color:" + qx.theme.manager.Color.getInstance().resolve(value) :
          null
      );
    },

    
    // property apply
    _applyTextAlign : function(value, old, name) {
      this.__store(name, value ? "text-align:" + value : null);
    },
    
    
    // property apply
    _applyFont : function(value, old, name) 
    {
      if (!value) {
        this.__store(name, null);
      } else {
        this.__store(name, qx.bom.Style.compile(value.getStyles()));
      }
    },
    
    
    // property apply
    _applyPadding : function(value, old, name) 
    {
      if (this.__isThemed) {
        var paddingStore = this.__themePaddings;
      } else {
        paddingStore = this.__userPaddings;
      }
      
      if (value == null) {
        delete paddingStore[name];
      } else {
        paddingStore[name] = value;
      }
      
      if (value === null) {
        this.__store(name, null)
      } else {
        var cssKey = qx.lang.String.hyphenate(name);
        this.__store(name, cssKey + ":" + value + "px");
      }
    },
    
    
    /**
     * Get the next unique CSS class name
     * 
     * @return {String} The next unique CSS class name 
     */
    __getNextClassname : function() {
      return "qx-cell-" + this.toHashCode() + "-" + (this.__classCounter++);    
    },
    __classCounter : 0,
    
    
    /*
    ---------------------------------------------------------------------------
      IMPLEMENT CELL API
    ---------------------------------------------------------------------------
    */    
    
    getCellProperties : function(value, states)
    {
      return {
        classes : this.getCssClasses(value, states),
        style : this.getStyles(value, states),
        attributes : this.getAttributes(value, states),
        content : this.getValue(value, states),
        insets : this.getInsets(value, states)
      };
    },
  
    getAttributes : function(value, states) {
      return "";
    },

    getValue : function(value, states) {
      return value;
    },

    // overridden
    getCssClasses : function(value, states)
    {
      var statesKey = qx.lang.Object.getKeys(states).join(" ") || "$default";
      if (this.__classes[statesKey]) {
        return "qx-cell " + this.__classes[statesKey]; 
      }
      
      var manager = qx.theme.manager.Appearance.getInstance();
      var styler = qx.core.Property.$$method.setThemed;
      var unstyler = qx.core.Property.$$method.resetThemed;      
      
      this.__themeStyles = {};
      
      this.__isThemed = true;
      
      var themableProperties = [
        "backgroundColor", "textColor", "font", "textAlign",
        "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"
      ];
      
      // reset old themed values
      for (var i=0; i<themableProperties.length; i++) {
        this[unstyler[themableProperties[i]]]();
      }
      
      // set new themed values
      var styles = manager.styleFrom(this.getAppearance(), states);      
      for (var prop in styles) 
      {
        if (styles[prop] !== undefined) { 
          this[styler[prop]](styles[prop]);
        }
      }
      this.__isThemed = false;
            
      var styleString = qx.lang.Object.getValues(this.__themeStyles).join(";");
      var cssClass = this.__styles[styleString];
      if (!cssClass)
      {
        // generate stylesheet rule
        var cssClass = this.__getNextClassname();
        qx.bom.Stylesheet.addRule(this.__stylesheet, "." + cssClass, styleString);
        this.__styles[styleString] = cssClass;
      }

      this.__classes[statesKey] = cssClass;
      return "qx-cell " + cssClass;
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
    this.__disposeFields("__stylesheet"); 
  }
});