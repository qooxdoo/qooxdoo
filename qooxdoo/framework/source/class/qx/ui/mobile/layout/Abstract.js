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
 * 
 * Base class for all layout managers.
 *
 * Custom layout manager must derive from
 * this class.
 */
qx.Class.define("qx.ui.mobile.layout.Abstract",
{
  extend : qx.core.Object,
  type : "abstract",


 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members:
  {
    _widget : null,
    __cachedProperties : null,
    __cachedChildLayoutProperties : null,

    getCssClass: function() {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },


    _getSupportedChildLayoutProperties : function() {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },


    setLayoutProperties : function(widget, properties)
    {
      var supportedChildLayoutProperties = this._getSupportedChildLayoutProperties();
      for (var property in properties) {
        if (!supportedChildLayoutProperties[property]) {
          throw new Error("The layout does not support the " + property + " property");
        }
        var value = properties[property];
        this._setLayoutProperty(widget, property, value);
        this._addChildLayoutProperty(widget,  property, value);
      }
    },


    _setLayoutProperty : function(widget, property, value) {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },


    connectToWidget : function(widget)
    {
      if (this._widget) {
         this._widget.removeCssClass(this.getCssClass());
      }

      this._widget = widget;
      if (widget)
      {
        widget.addCssClass(this.getCssClass());
        if (this.__cachedProperties) {
          for (var property in this.__cachedProperties)
          {
            this.reset(property)
            this.set(property, this.__cachedProperties[property]);
          }
        }
      } else {
        this.__cachedProperties = null;
      }
    },


    _addCachedProperty : function(property, value) {
      if (!this.__cachedProperties) {
        this.__cachedProperties = {};
      }
      this.__cachedProperties[property] = value;
    },


    _getChildLayoutProperty : function(widget, property, value) {
      var cache = this.__getChildLayoutPropertyCache(widget, property, value);
      return cache[property];
    },


    _addChildLayoutProperty : function(widget, property, value) {
      var cache = this.__getChildLayoutPropertyCache(widget, property, value);
      if (value == null) {
        delete cache[property];
      } else {
        cache[property] = value;
      }
    },


    __getChildLayoutPropertyCache : function(widget, property, value) {
      if (!this.__cachedChildLayoutProperties) {
        this.__cachedChildLayoutProperties = {};
      }

      var cache = this.__cachedChildLayoutProperties;
      var hash = widget.toHashCode();
      if (!cache[hash]) {
        cache[hash] = {};
      }
      return cache[hash];
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._widget = null;
  }
});
