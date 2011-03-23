/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.layout.AbstractBox",
{
  extend : qx.ui.mobile.layout.Abstract,
  type : "abstract",


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(alignX, alignY, reverse)
  {
    this.base(arguments);
    if (alignX) {
      this.setAlignX(alignX);
    }
    if (alignY) {
      this.setAlignY(alignY);
    }
    if (reverse) {
      this.setReverse(reverse);
    }
  },




 /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Horizontal alignment of the whole children block.
     */
    alignX :
    {
      check : [ "left", "center", "right" ],
      nullable : true,
      init : null,
      apply : "_applyLayoutChange"
    },


    /**
     * Vertical alignment of each child.
     */
    alignY :
    {
      check : [ "top", "middle", "bottom" ],
      nullable : true,
      init : null,
      apply : "_applyLayoutChange"
    },


    reverse :
    {
      check : "Boolean",
      nullable : true,
      init : null,
      apply : "_applyLayoutChange"
    }
  },




 /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    PROPERTY_CSS_MAPPING :
    {
      "alignX":
      {
        "hbox" :
        {
          "left" : "boxPackStart",
          "center" : "boxPackCenter",
          "right" : "boxPackEnd"
        },
        "vbox" :
        {
          "left" : "boxAlignStart",
          "center" : "boxAlignCenter",
          "right" : "boxAlignEnd"
        }
      },
      "alignY" :
      {
        "hbox" :
        {
          "top" : "boxAlignStart",
          "middle" : "boxAlignCenter",
          "bottom" : "boxAlignEnd"
        },
        "vbox" :
        {
          "top" : "boxPackStart",
          "middle" : "boxPackCenter",
          "bottom" : "boxPackEnd"
        }
      },
      "reverse" :
      {
        "hbox" :
        {
          "true" : "reverse",
          "false" : null
        },
        "vbox" :
        {
          "true" : "reverse",
          "false" : null
        }
      }
    },

    SUPPORTED_CHILD_LAYOUT_PROPERTIES : {
      "flex" : 1
    }
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getSupportedChildLayoutProperties : function() {
      return qx.ui.mobile.layout.AbstractBox.SUPPORTED_CHILD_LAYOUT_PROPERTIES;
    },


    _setLayoutProperty : function(widget, property, value)
    {
      if (property == "flex") {
        var old = this._getChildLayoutProperty(widget, property, value);
        if (old != null) {
          widget.removeCssClass("boxFlex" + value);
        }
        widget.addCssClass("boxFlex" + value);
      }
    },


    // overridden
    connectToWidget : function(widget)
    {
      if (this._widget) {
        this.resetAlignX();
        this.resetAlignY();
        this.resetReverse();
      }
      this.base(arguments, widget);
    },


    _applyLayoutChange : function(value, old, property)
    {
      if (this._widget)
      {
        var layoutCss = this.getCssClass();
        var CSS_MAPPING = qx.ui.mobile.layout.AbstractBox.PROPERTY_CSS_MAPPING[property][layoutCss];
        if (old)
        {
          var oldCssClass = CSS_MAPPING[old];
          if (oldCssClass) {
            this._widget.removeCssClass(oldCssClass);
          }
        }
        if (value)
        {
          var cssClass = CSS_MAPPING[value];
          if (cssClass) {
            this._widget.addCssClass(cssClass);
          }
        }
      } else {
        // remember the state until the widget is connected
        if (value) {
          this._addCachedProperty(property, value);
        }
      }
    }
  }
});
