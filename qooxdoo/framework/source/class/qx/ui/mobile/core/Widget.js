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

/* ************************************************************************

#use(qx.ui.mobile.core.EventHandler)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This is the base class for all mobile widgets.
 */
qx.Class.define("qx.ui.mobile.core.Widget",
{
  extend : qx.core.Object,
  include : [qx.locale.MTranslation],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._setContainerElement(this._createContainerElement());

    // Init member variables

    this.__children = [];

    this.setId(this.getId());
    this.initDefaultCssClass();
    this.initName();
    this.initAnonymous();
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired if the mouse cursor moves over the widget. */
    mousemove : "qx.event.type.Mouse",

    /** Fired if the mouse cursor enters the widget. */
    mouseover : "qx.event.type.Mouse",

    /** Fired if the mouse cursor leaves widget. */
    mouseout : "qx.event.type.Mouse",

    /** Mouse button is pressed on the widget. */
    mousedown : "qx.event.type.Mouse",

    /** Mouse button is released on the widget. */
    mouseup : "qx.event.type.Mouse",

    /** Widget is clicked using left or middle button.
        {@link qx.event.type.Mouse#getButton} for more details.*/
    click : "qx.event.type.Mouse",

    /** Widget is double clicked using left or middle button.
        {@link qx.event.type.Mouse#getButton} for more details.*/
    dblclick : "qx.event.type.Mouse",

    /** Widget is clicked using the right mouse button. */
    contextmenu : "qx.event.type.Mouse",

    /** Fired before the context menu is opened. */
    beforeContextmenuOpen : "qx.event.type.Mouse",

    /** Fired if the mouse wheel is used over the widget. */
    mousewheel : "qx.event.type.MouseWheel",

    /** Fired if a touch at the screen is started. */
    touchstart : "qx.event.type.Touch",

    /** Fired if a touch at the screen has ended. */
    touchend : "qx.event.type.Touch",

    /** Fired during a touch at the screen. */
    touchmove : "qx.event.type.Touch",

    /** Fired if a touch at the screen is cancled. */
    touchcancel : "qx.event.type.Touch",

    /** Fired when a finger taps on the screen. */
    tap : "qx.event.type.Touch",

    /** Fired when a finger swipes over the screen. */
    swipe : "qx.event.type.Touch",

    /**
     * This event if fired if a keyboard key is released.
     **/
    keyup : "qx.event.type.KeySequence",

    /**
     * This event if fired if a keyboard key is pressed down. This event is
     * only fired once if the user keeps the key pressed for a while.
     */
    keydown : "qx.event.type.KeySequence",

    /**
     * This event is fired any time a key is pressed. It will be repeated if
     * the user keeps the key pressed. The pressed key can be determined using
     * {@link qx.event.type.KeySequence#getKeyIdentifier}.
     */
    keypress : "qx.event.type.KeySequence",

    /**
     * This event is fired if the pressed key or keys result in a printable
     * character. Since the character is not necessarily associated with a
     * single physical key press, the event does not have a key identifier
     * getter. This event gets repeated if the user keeps pressing the key(s).
     *
     * The unicode code of the pressed key can be read using
     * {@link qx.event.type.KeyInput#getCharCode}.
     */
    keyinput : "qx.event.type.KeyInput",


    /**
     * Fired after a massive DOM manipulation, e.g. when DOM elements were
     * added or styles were changed. Listen to this event, if you need to
     * recalculate a layout or have to update your view.
     */
    domupdated : "qx.event.type.Event",

    /**
     * Fired after the widget appears on the screen.
     */
    appear : "qx.event.type.Event",

    /**
     * Fired after the widget disappears from the screen.
     */
    disappear : "qx.event.type.Event",


    /**
     * The event is fired when the widget gets focused.
     */
    focus : "qx.event.type.Focus",

    /**
     * The event is fired when the widget gets blurred.
     */
    blur : "qx.event.type.Focus",

    /**
     * When the widget itself or any child of the widget receive the focus.
     */
    focusin : "qx.event.type.Focus",

    /**
     * When the widget itself or any child of the widget lost the focus.
     */
    focusout : "qx.event.type.Focus",

    /**
     * When the widget gets active (receives keyboard events etc.)
     */
    activate : "qx.event.type.Focus",

    /**
     * When the widget gets inactive
     */
    deactivate : "qx.event.type.Focus"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The default CSS class used for this widget. The default CSS class
     * should contain the common appearance of the widget.
     * It is set to the container element of the widget. Use {@link #addCssClass}
     * to enhance the default appearance of the widget.
     */
    defaultCssClass :
    {
      check : "String",
      init : null,
      nullable : true,
      apply  : "_applyDefaultCssClass"
    },


    /**
     * The name attribute of the container element. Usefull when you want to find
     * an element by its name attribute.
     */
    name :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyAttribute"
    },


    /**
     * Whether the widget should be the target of an event. Set this property
     * to <code>false</code> when the widget is a child of another widget and
     * shouldn't react on events.
     */
    anonymous :
    {
      check : "Boolean",
      init : null,
      nullable : true,
      apply : "_applyStyle"
    },


    /**
     * The ID of the widget. When the ID is set to <code>null</code> an auto
     * id will be generated.
     */
    id :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyId",
      transform : "_transformId",
      event : "changeId"
    },


    /**
     * Controls the visibility. Valid values are:
     *
     * <ul>
     *   <li><b>visible</b>: Render the widget</li>
     *   <li><b>hidden</b>: Hide the widget. The space will be still available.</li>
     *   <li><b>excluded</b>: Hide the widget. The space will be released.</li>
     * </ul>
     */
    visibility :
    {
      check : ["visible", "hidden", "excluded"],
      init : "visible",
      apply : "_applyVisibility",
      event : "changeVisibility"
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {String} Prefix for the auto id */
    ID_PREFIX : "qx_id_",

    /** {Map} Internal data structure to store widgets */
    __registry : {},

    /** {Integer} Incremental counter of the current id */
    __idCounter : 0,

    /** {Integer} ID of the timeout for the DOM update */
    __domUpdatedScheduleId : null,

    /**
     * Event handler. Called when the application is in shutdown.
     * @internal
     */
    onShutdown : function()
    {
      window.clearTimeout(qx.ui.mobile.core.Widget.__domUpdatedScheduleId);
      delete qx.ui.mobile.core.Widget.__registry;
    },

    /**
     * Returns the current widget id of the registry.

     * @return {Integer} The current id
     * @internal
     */
    getCurrentId : function()
    {
      return qx.ui.mobile.core.Widget.__idCounter
    },


    /**
     * Registers a widget with its id for internal widget handling.
     *
     * @param widget {Widget} The widget to register
     *
     * @internal
     */
    registerWidget : function(widget)
    {
      var id = widget.getId();
      var registry = qx.ui.mobile.core.Widget.__registry;
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertUndefined(registry[id], "Widget with the id '" + id + "' is already registered");
      }
      registry[id] = widget;
    },


    /**
     * Unregisters the widget with the given id.
     *
     * @param id {String} The id of the widget to unregister
     *
     * @internal
     */
    unregisterWidget : function(id)
    {
      delete qx.ui.mobile.core.Widget.__registry[id];
    },


   /**
     * Returns the widget with the given id.
     *
     * @param id {String} The id of the widget
     * @return {Widget} The widget with the given id
     */
    getWidgetById : function(id) {
      return qx.ui.mobile.core.Widget.__registry[id];
    },


    /**
     * Schedules the {@link #domUpdated} method. The method will be called after a timeout
     * to prevent the triggered events to be fired to often, during massive DOM manipulations.
     *
     * @internal
     */
    scheduleDomUpdated : function()
    {
      if (qx.ui.mobile.core.Widget.__domUpdatedScheduleId == null)
      {
        qx.ui.mobile.core.Widget.__domUpdatedScheduleId = window.setTimeout(
          qx.ui.mobile.core.Widget.domUpdated,
          0
        );
      }
    },


    /**
     * Fires the DOM updated event directly. Triggers the {@link qx.event.handler.Appear#refresh} and
     * {@link qx.ui.mobile.core.DomUpdatedHandler#refresh} methods. Do not use this
     * method during massive DOM manipulations. Use {@link #scheduleDomUpdated} instead.
     *
     * @internal
     */
    domUpdated : qx.event.GlobalError.observeMethod(function()
    {
      var clazz = qx.ui.mobile.core.Widget;
      window.clearTimeout(clazz.__domUpdatedScheduleId);
      clazz.__domUpdatedScheduleId = null;
      qx.event.handler.Appear.refresh();
      qx.ui.mobile.core.DomUpdatedHandler.refresh();
    }),


    /**
     * Adds an attribute mapping entry. This entry is used by the {@link #_applyAttribute}
     * method. Shortcut when the property name differs from the real
     * attribute name. Use this method if you want to add an attribute entry to the mapping
     * from the defer function of a different widget.
     *
     * e.g.:
     * "selectable" :
     * {
     *   attribute : "data-selectable",
     *   values :
     *   {
     *     "true" : null,
     *     "false" : "false"
     *   }
     * }
     *
     * @param property {String} The property name
     * @param attribute {String} The real attribute name
     * @param values {Map} Values of the property to the real attribute value.
     *      Use null, when you want not to set the attribute.
     */
    addAttributeMapping : function(property, attribute, values)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var attributeMapping = qx.ui.mobile.core.Widget.ATTRIBUTE_MAPPING;
        qx.core.Assert.assertUndefined(attributeMapping[property], "Attribute mapping for " + property + " already exists");
      }

      qx.ui.mobile.core.Widget.ATTRIBUTE_MAPPING[property] = {
        attribute : attribute,
        values : values
      }
    },


    /**
     * Adds a style mapping entry. This entry is used by the {@link #_applyStyle}
     * method. Shortcut when the property name differs from the real
     * style name. Use this method if you want to add a style entry to the mapping
     * from the defer function of a different widget.
     *
     * e.g.:
     * "anonymous" :
     * {
     *  style : "pointer-events",
     *  values :
     *  {
     *    "true" : "none",
     *    "false" : null
     *  }
     * }
     *
     * @param property {String} The property name
     * @param style {String} The real style name
     * @param values {Map} Values of the property to the real style value.
     *      Use null, when you want not to set the style.
     */
    addStyleMapping : function(property, style, values)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        var styleMapping = qx.ui.mobile.core.Widget.STYLE_MAPPING;
        qx.core.Assert.assertUndefined(styleMapping[property], "Style mapping for " + property + " already exists");
      }

      qx.ui.mobile.core.Widget.STYLE_MAPPING[property] = {
        style : style,
        values : values
      }
    },


    /**
     * Mapping of attribute properties to their real attribute name.
     *
     * @internal
     */
    ATTRIBUTE_MAPPING :
    {
      "selectable" :
      {
        attribute : "data-selectable",
        values :
        {
          "true" : null,
          "false" : "false"
        }
      },
      "readOnly" :
      {
        attribute : "readonly"
      }
    },


    /**
     * Mapping of style properties to their real style name.
     *
     * @internal
     */
    STYLE_MAPPING :
    {
      "anonymous" :
      {
        style : "pointer-events",
        values :
        {
          "true" : "none",
          "false" : null
        }
      }
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __containerElement : null,
    __contentElement : null,

    __layoutParent : null,
    __children : null,
    __layoutManager : null,

    /*
    ---------------------------------------------------------------------------
      Basic Template
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the tag name of the container element of this widget.
     * Override this method if you want to create a custom widget.
     */
    _getTagName : function()
    {
      return "div";
    },


   /**
    * Creates the container DOM element of the widget.
    * Override this method if you want to create a custom widget.
    *
    * @return {Element} the container element.
    */
    _createContainerElement : function()
    {
      return qx.bom.Element.create(this._getTagName());
    },


    /**
     * Triggers the {@link #scheduleDomUpdated} method. This method needs to be called
     * when the DOM has changed, e.g. an element was added / removed / styled.
     */
    _domUpdated : function()
    {
      qx.ui.mobile.core.Widget.scheduleDomUpdated();
    },


    /*
    ---------------------------------------------------------------------------
      ID Handling
    ---------------------------------------------------------------------------
    */


    /**
     * Transforms the value of the ID property. When the value is null, an auto
     * generated ID is set. This makes shure that always an ID is set.
     *
     * @param value {String} The set id of the widget
     */
    _transformId : function(value)
    {
      if (value == null)
      {
        var clazz = qx.ui.mobile.core.Widget;
        value = clazz.ID_PREFIX + clazz.__idCounter++;
      }
      return value;
    },


    // property apply
    _applyId : function(value, old)
    {
      if (old != null)
      {
        // Unregister widget with old id
        qx.ui.mobile.core.Widget.unregisterWidget(old);
      }
      // Change the id of the DOM element
      var element = this.getContainerElement();
      element.id = value;
      // Register the widget
      qx.ui.mobile.core.Widget.registerWidget(this);

    },


    /*
    ---------------------------------------------------------------------------
      Child Handling
    ---------------------------------------------------------------------------
    */


    /**
     * Adds a new child widget.
     *
     * @param child {Widget} the widget to add.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    _add : function(child, layoutProperties)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (child.getLayoutParent() === this) {
          throw new Error("The widget is already added this widget. Please remove it first.")
        }
      }

      child.setLayoutParent(this);
      child.setLayoutProperties(layoutProperties);

      this.getContentElement().appendChild(child.getContainerElement());
      this.__children.push(child);

      this._domUpdated();
    },


    /**
     * Add a widget before another already inserted widget
     *
     * @param child {Widget} widget to add
     * @param beforeWidget {Widget} widget before the new widget will be inserted.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     * @return {void}
     */
    _addBefore : function(child, beforeWidget, layoutProperties)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (child.getLayoutParent() === this) {
          throw new Error("The widget is already added this widget. Please remove it first.")
        }

        this.assertInArray(beforeWidget, this._getChildren(), "The 'before' widget is not a child of this widget!");
      }

      if (child == beforeWidget) {
        return;
      }

      child.setLayoutParent(this);
      child.setLayoutProperties(layoutProperties);

      this.getContentElement().insertBefore(child.getContainerElement(), beforeWidget.getContainerElement());
      qx.lang.Array.insertBefore(this.__children, child, beforeWidget);

      this._domUpdated();
    },


    /**
     * Add a widget after another already inserted widget.
     *
     * @param child {Widget} The widget to add.
     * @param afterWidget {Widget} Widget, after which the new widget will be inserted.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    _addAfter : function(child, afterWidget, layoutProperties)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (child.getLayoutParent() === this) {
          throw new Error("The child is already added to this widget. Please remove it first.")
        }

        this.assertInArray(afterWidget, this._getChildren(), "The 'after' widget is not a child of this widget!");
      }

      if (child == afterWidget) {
        return;
      }

      child.setLayoutParent(this);
      child.setLayoutProperties(layoutProperties);

      var length = this._getChildren().length;
      var index = this._indexOf(afterWidget);

      if (index == length - 1) {
        this.getContentElement().appendChild(child.getContainerElement());
      }
      else
      {
        var beforeWidget = this._getChildren()[index+1];
        this.getContentElement().insertBefore(child.getContainerElement(), beforeWidget.getContainerElement());
      }

      qx.lang.Array.insertAfter(this.__children, child, afterWidget);

      this._domUpdated();
    },



    /**
     * Removes a given child from the widget.
     *
     * @param child {Widget} The widget to remove.
     */
    _remove : function(child)
    {
      child.setLayoutParent(null);
      this._domUpdated();
    },


    /**
     * Remove the widget at the specified index.
     *
     * @param index {Integer} Index of the widget to remove.
     */
    _removeAt : function(index)
    {
      if (!this.__children) {
        throw new Error("This widget has no children!");
      }

      var child = this.__children[index];
      this._remove(child);
    },


    /**
     * Removes all children from the widget.
     */
    _removeAll : function()
    {
      // create a copy of the array
      var children = this.__children.concat();
      for (var i = 0, l=children.length; i < l; i++) {
        this._remove(children[i]);
      }
    },


    /**
     * Returns the index position of the given widget if it is
     * a child widget. Otherwise it returns <code>-1</code>.
     *
     * @param child {Widget} the widget to query for
     * @return {Integer} The index position or <code>-1</code> when
     *   the given widget is no child of this layout.
     */
    _indexOf : function(child)
    {
      var children = this.__children;
      if (!children) {
        return -1;
      }

      return children.indexOf(child);
    },


    /**
     * Internal method. Sets the layout parent.
     *
     * @param parent {qx.ui.mobile.Widget} The parent widget
     *
     * @internal
     */
    setLayoutParent : function(parent)
    {
      if (this.__layoutParent === parent) {
        return;
      }

      var oldParent = this.__layoutParent;
      if (oldParent && !oldParent.$$disposed) {
        this.__layoutParent.removeChild(this);
      }

      this.__layoutParent = parent || null;
    },


    /**
     * Internal method. Removes a given child widget and the corresponding DOM element.
     *
     * @param child {Widget} The widget to remove
     *
     * @internal
     */
    removeChild : function(child)
    {
      qx.lang.Array.remove(this.__children, child);
      this.getContentElement().removeChild(child.getContainerElement());
    },


    /**
     * Returns the parent widget of this widget.
     *
     * @return {Widget} The parent of the widget
     */
    getLayoutParent : function()
    {
      return this.__layoutParent;
    },


    /**
     * Returns the children of the widget.
     *
     * @return {Widget[]} The children of the widget
     */
    _getChildren : function() {
      return this.__children;
    },


    /**
     * Whether the widget has child widgets.
     *
     * @return {Boolean} Whether the widget has children or not.
     */
    _hasChildren : function() {
      return this.__children && this.__children.length > 0;
    },


   /*
    ---------------------------------------------------------------------------
      Layout handling
    ---------------------------------------------------------------------------
    */

    /**
     * Set a layout manager for the widget. A layout manager can only be connected
     * with one widget. Reset the connection with a previous widget first, if you
     * like to use it in another widget instead.
     *
     * @param layout {qx.ui.mobile.layout.Abstract} The new layout or
     *     <code>null</code> to reset the layout.
     */
    _setLayout : function(layout)
    {
      if (qx.core.Environment.get("qx.debug")) {
        if (layout) {
          this.assertInstance(layout, qx.ui.mobile.layout.Abstract);
        }
      }

      if (this.__layoutManager) {
        this.__layoutManager.connectToWidget(null);
      }

      if (layout) {
        layout.connectToWidget(this);
      }
      this.__layoutManager = layout;
    },


    /**
     * Returns the set layout manager for the widget.
     *
     * @return  {qx.ui.mobile.layout.Abstract} the layout manager of the widget.
     */
    _getLayout : function() {
      return this.__layoutManager;
    },


    /**
     * Stores the given layout properties.
     *
     * @param properties {Map} Incoming layout property data
     */
    setLayoutProperties : function(properties)
    {
      if (properties == null) {
        return;
      }
      // Check values through parent
      var parent = this.getLayoutParent();
      if (parent) {
        parent.updateLayoutProperties(this, properties);
      }
    },


    /**
     * Updates the layout properties of a given widget.
     *
     * @param widget {qx.ui.mobile.core.Widget} The widget that should be updated
     * @param properties {Map} Incoming layout property data
     *
     * @internal
     */
    updateLayoutProperties : function(widget, properties)
    {
      var layout = this._getLayout();
      if (layout) {
        layout.setLayoutProperties(widget, properties);
      }
    },


    /*
    ---------------------------------------------------------------------------
      Content handling
    ---------------------------------------------------------------------------
    */


     /**
      * Sets the innerHTML of the content element and calls the {@link #_domUpdated}
      * method.
      *
      * @param value {String?""} The html to set in the content element.
      */
     _setHtml : function(value)
     {
       this.getContentElement().innerHTML = value || "";
       this._domUpdated();
     },


    /*
    ---------------------------------------------------------------------------
      Attributes handling
    ---------------------------------------------------------------------------
    */

    /**
     * Shortcut for each property that should change a certain attribute of the
     * container element.
     * Use the {@link #addAttributeMapping} method to add a property to attribute
     * mapping when the attribute name or value differs from the property name or
     * value.
     *
     * @param value {var} The set value
     * @param old {var} The old value
     * @param attribute {String} The property name
     */
    _applyAttribute : function(value, old, attribute)
    {
      this._setAttribute(attribute, value);
    },


    /**
     * Sets an attribute with the given value of the container element. The
     * <code>null</code> value resets the attribute.
     *
     * @param attribute {String} The attribute name.
     * @param value {var} The attribute value. <code>Null</code> will reset the attribute.
     */
    _setAttribute : function(attribute, value)
    {
      var mapping = qx.ui.mobile.core.Widget.ATTRIBUTE_MAPPING[attribute]
      if (mapping)
      {
        attribute = mapping.attribute || attribute;
        var values = mapping.values;
        value = values && typeof values[value] !== "undefined" ? values[value] : value;
      }

      var element = this.getContainerElement();
      if (value != null) {
        qx.bom.element.Attribute.set(element, attribute, value);
      }
      else
      {
        qx.bom.element.Attribute.reset(element, attribute);
      }
    },


    /**
     * Returns the set value of the given attribute.
     *
     * @param attribute {String} The attribute name
     */
    _getAttribute : function(attribute)
    {
      var element = this.getContainerElement();
      return qx.bom.element.Attribute.get(element, attribute);
    },


    /*
    ---------------------------------------------------------------------------
      Styles handling
    ---------------------------------------------------------------------------
    */


    /**
     * Shortcut for each property that should change a certain style of the container
     * element.
     * Use the {@link #addStyleMapping} method to add a property to style
     * mapping when the style name or value differs from the property name or
     * value.
     */
    _applyStyle : function(value, old, style)
    {
      this._setStyle(style, value);
    },


    /**
     * Sets the value of a certain style of the container element. The
     * <code>null</code> value resets the attribute.
     *
     * @param style {String} The style of which the value should be set
     * @param value {var} The value of the style. <code>Null</code> will reset the attribute.
     */
    _setStyle : function(style, value)
    {
      var mapping = qx.ui.mobile.core.Widget.STYLE_MAPPING[style]
      if (mapping)
      {
        style = mapping.style || style;
        value = mapping.values[value];
      }

      var element = this.getContainerElement();
      if (value != null) {
        qx.bom.element.Style.set(element, style, value);
      }
      else
      {
        qx.bom.element.Style.reset(element, style);
      }
      this._domUpdated();
    },


    /**
     * Returns the value of a certain style of the container element.
     *
     * @param style {String} The style name of which the value should be returned
     * @return {var} The value of the style
     */
    _getStyle : function(style)
    {
      var element = this.getContainerElement();
      return qx.bom.element.Style.get(element, style);
    },

    /*
    ---------------------------------------------------------------------------
      CSS Handling
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyDefaultCssClass : function(value, old)
    {
      if (old) {
        this.removeCssClass(old);
      }
      if (value) {
        this.addCssClass(value);
      }
    },


    /**
     * Adds a CSS class to the container element of the widget. Use this method
     * to enhance the default appearance of the widget.
     *
     * @param cssClass {String} The CSS class to add
     */
    addCssClass : function(cssClass) {
      var element = this.getContainerElement();
      qx.bom.element.Class.add(element, cssClass);
    },


    /**
     * Removes a CSS class from the container element of the widget.
     *
     * @param cssClass {String} The CSS class to remove
     */
    removeCssClass : function(cssClass) {
      var element = this.getContainerElement();
      qx.bom.element.Class.remove(element, cssClass);
    },


    /*
    ---------------------------------------------------------------------------
      Visibility handling
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyVisibility : function(value, old)
    {
      if (value == "excluded") {
        this._setStyle("display", "none");
      }
      else if(value == "visible")
      {
        this._setStyle("display", null);
        this._setStyle("visibility", null);
      }
      else if (value == "hidden") {
        this._setStyle("visibility", "hidden");
      }
    },


    /**
     * Make this widget visible.
     *
     * @return {void}
     */
    show : function() {
      this.setVisibility("visible");
    },


    /**
     * Hide this widget.
     *
     * @return {void}
     */
    hide : function() {
      this.setVisibility("hidden");
    },


    /**
     * Hide this widget and exclude it from the underlying layout.
     *
     * @return {void}
     */
    exclude : function() {
      this.setVisibility("excluded");
    },


    /**
     * Whether the widget is locally visible.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @return {Boolean} Returns <code>true</code> when the widget is visible
     */
    isVisible : function() {
      return this.getVisibility() === "visible";
    },


    /**
     * Whether the widget is locally hidden.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @return {Boolean} Returns <code>true</code> when the widget is hidden
     */
    isHidden : function() {
      return this.getVisibility() !== "visible";
    },


    /**
     * Whether the widget is locally excluded.
     *
     * Note: This method does not respect the hierarchy.
     *
     * @return {Boolean} Returns <code>true</code> when the widget is excluded
     */
    isExcluded : function() {
      return this.getVisibility() === "excluded";
    },


    /**
     * isSeeable
     * Warning: forces rendering of the browser. Do not use this method during
     * animations or performance critical tasks.
     */
    isSeeable : function()
    {
      return this.getContainerElement().offsetWidth > 0;
    },


    /*
    ---------------------------------------------------------------------------
     Element handling
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the container DOM element of the widget.
     *
     * @param element {Element} The container DOM element of the widet
     */
    _setContainerElement : function(element)
    {
      this.__containerElement = element;
    },


    /**
     * Returns the container DOM element of the widget.
     *
     * @return {Element} the container DOM element of the widget
     *
     * @internal
     */
    getContainerElement : function()
    {
      return this.__containerElement;
    },


    /**
     * Returns the content DOM element of the widget.
     *
     * @return {Element} the content DOM element of the widget
     *
     * @internal
     */
    getContentElement : function()
    {
      if (!this.__contentElement) {
        this.__contentElement = this._getContentElement();
      }
      return this.__contentElement;
    },


    /**
     * Returns the content DOM element of the widget.
     * Override this method, to define another element as the content element.
     *
     * Note: Most times this element points to to the container element.
     * When the widget has a more complex element structure,
     * the function should return the element that should contain the content.
     *
     * @return {Element} the content DOM element of the widget
     */
    _getContentElement : function()
    {
      return this.getContainerElement();
    },


    /*
    ---------------------------------------------------------------------------
      ENHANCED DISPOSE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Removes this widget from its parent and disposes it.
     */
    destroy : function()
    {
      if (this.$$disposed) {
        return;
      }

      var parent = this.__layoutParent;
      if (parent) {
        parent._remove(this);
      }
      this.dispose();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (!qx.core.ObjectRegistry.inShutDown)
    {
      // Cleanup event listeners
      // Needed as we rely on the containerElement in the qx.ui.mobile.core.EventHandler
      qx.event.Registration.removeAllListeners(this);

      if (this.getId())
      {
        qx.ui.mobile.core.Widget.unregisterWidget(this.getId());
      }
    }

    this.__layoutParent = this.__containerElement = this.__contentElement = null;

    this.__layoutManager = null;
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.bom.Lifecycle.onShutdown(statics.onShutdown, statics);
  }
});