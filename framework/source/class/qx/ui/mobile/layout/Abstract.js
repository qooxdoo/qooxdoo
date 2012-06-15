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
 * TODOs:
 * * cleanUp Method for layoutProperties when layout is removed / changed
 * * Flag methods internal
 * * Define actions as statics
 */

/**
 * Base class for all layout managers.
 *
 * Custom layout managers must derive from
 * this class and implement the methods {@link #_getCssClasses},
 * {@link #_getSupportedChildLayoutProperties} and {@link #_setLayoutProperty}.
 */
qx.Class.define("qx.ui.mobile.layout.Abstract",
{
  extend : qx.core.Object,
  type : "abstract",


 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the layout is updated. Data contains the "widget", "action", "properties" */
    updateLayout : "qx.event.type.Data"
  },



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


    /**
     * Returns the css classes in an array that the layout is using.
     *
     * @return {Array} The css classes that the layout is using
     */
    _getCssClasses: function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },


    /**
     * Returns the supported child layout properites. Needed to validate
     * the incoming layout properites. Override this function in your implementation.
     *
     * @return {Map} The supported child layout properties, e.g. <code>{"property":1}</code>
     */
    _getSupportedChildLayoutProperties : function()
    {
      return null;
    },


    /**
     * Abstracts method. Override this in your implementation.
     * The function is called for all given layout properties once.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @param property {String?null} Optional. The layout property to set.
     * @param value {var?} Optional. The value of the layout property.
     */
    _setLayoutProperty : function(widget, property, value)
    {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },


    /**
     * Sets the given layout properties to a widget.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @param properties {Map} The layout properties to set. Key / value pairs.
     */
    setLayoutProperties : function(widget, properties)
    {
      if (properties == null) {
        return;
      }

      var supportedChildLayoutProperties = this._getSupportedChildLayoutProperties();
      if (!supportedChildLayoutProperties) {
        return;
      }

      for (var property in properties) {
        if (!supportedChildLayoutProperties[property]) {
          throw new Error("The layout does not support the " + property + " property");
        }
        var value = properties[property];
        this._setLayoutProperty(widget, property, value);
        this._addPropertyToChildLayoutCache(widget,  property, value);
      }
    },


    /**
     * This method is called by the widget to connect the widget with the layout.
     *
     * @param widget {qx.ui.mobile.core.Widget} The widget to connect to
     */
    connectToWidget : function(widget)
    {
      if (this._widget) {
        this._widget.removeCssClasses(this._getCssClasses());
      }

      this._widget = widget;
      if (widget)
      {
        widget.addCssClasses(this._getCssClasses());
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



    /**
     * Connects the layout to a given child widget. Can be overridden in a concrete
     * interface implementation.
     *
     * @param widget {qx.ui.mobile.core.Widget} The widget to connect to
     */
    connectToChildWidget : function(widget)
    {

    },


    /**
     * Disconnects the layout from a given child widget. Can be overridden in a concrete
     * interface implementation.
     *
     * @param widget {qx.ui.mobile.core.Widget} The widget to connect to
     */
    disconnectFromChildWidget : function(widget)
    {

    },


    /**
     * Updates the layout. Method is called by a widget, when it changes its state.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @param action {String} The causing action that triggered the layout update.
     * @param properties {Map} The animation properties to set. Key / value pairs.
     */
    updateLayout : function(widget, action, properties) {
      this.fireDataEvent("updateLayout", {
        widget : widget,
        action : action,
        properties : properties
      });
    },


    /**
     * Adds a property to the cache. Needed when the layout is not yet
     * connected with the widget.
     *
     * @param property {String} The property to add
     * @param value {var} The value of the property to add
     */
    _addCachedProperty : function(property, value)
    {
      if (!this.__cachedProperties) {
        this.__cachedProperties = {};
      }
      this.__cachedProperties[property] = value;
    },


    /**
     * Returns a child layout property value.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @param property {String} The property to retrieve the value from
     * @return {var} The value of the given property
     */
    _getChildLayoutPropertyValue : function(widget, property)
    {
      var cache = this.__getChildLayoutPropertyCache(widget);
      return cache[property];
    },


    /**
     * Adds a child layout property to the cache. When the value is
     * <code>null</code> the property will be deleted from the cache.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @param property {String} The property to add
     * @param value {var} The value of the property to add
     */
    _addPropertyToChildLayoutCache : function(widget, property, value)
    {
      var cache = this.__getChildLayoutPropertyCache(widget);
      if (value == null) {
        delete cache[property];
      } else {
        cache[property] = value;
      }
    },



    /**
     * Returns the child layout property cache.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @return {Map} The child layout property cache for the given widget.
     *     Key / value pairs.
     */
    __getChildLayoutPropertyCache : function(widget)
    {
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