/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * This is the base class for all mobile widgets.
 *
 * @use(qx.ui.mobile.core.EventHandler)
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
    this.initActivatable();
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

    /** Fired if a touch at the screen is canceled. */
    touchcancel : "qx.event.type.Touch",

    /** Fired when a finger taps on the screen. */
    tap : "qx.event.type.Tap",

    /** Fired when a finger holds on the screen. */
    longtap : "qx.event.type.Tap",

    /** Fired when a finger swipes over the screen. */
    swipe : "qx.event.type.Touch",

    /** Fired when two pointers performing a rotate gesture on the screen. */
    rotate : "qx.event.type.Rotate",

    /** Fired when two pointers performing a pinch in/out gesture on the screen. */
    pinch : "qx.event.type.Pinch",

    /** Fired when an active pointer moves on the screen (after pointerdown till pointerup). */
    track : "qx.event.type.Track",

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
    deactivate : "qx.event.type.Focus",

    /**
     * Fired when an active pointer moves on the screen or the mouse wheel is used.
     */
    roll : "qx.event.type.Roll"
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
     * Whether this widget is enabled or not
     */
    enabled :
    {
      init: true,
      check : "Boolean",
      nullable: false,
      event : "changeEnabled",
      apply: "_applyEnabled"
    },


    /**
     * The name attribute of the container element. Useful when you want to find
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
    },


    /**
     * Whether the widget can be activated or not. When the widget is activated
     * a css class <code>active</code> is automatically added to the widget, which
     * can indicate the activation status.
     */
    activatable :
    {
      check : "Boolean",
      init : false,
      apply : "_applyAttribute"
    },


    /**
     * Rotates the widget. Negative and positive values are allowed.
     */
    rotation :
    {
      check : "Number",
      nullable : true,
      init : null,
      apply : "_transform"
    },


    /**
    * This property controls whether the transformation uses the length unit <code>px<code> or <code>rem</code>.
    * This feature is important for creating a resolution independent transformation.
    */
    transformUnit :
    {
      check : ["rem", "px"],
      nullable : false,
      init : "rem",
      apply : "_transform"
    },


    /**
     * Scales the widget in X direction (width).
     */
    scaleX :
    {
      check : "Number",
      nullable : true,
      init : null,
      apply : "_transform"
    },


    /**
     * Scales the widget in Y direction (height).
     */
    scaleY :
    {
      check : "Number",
      nullable : true,
      init : null,
      apply : "_transform"
    },


    /**
     * Moves the widget on X axis.
     */
    translateX :
    {
      check : "Number",
      nullable : true,
      init : 0,
      apply : "_transform"
    },


    /**
     * Moves the widget on Y axis.
     */
    translateY :
    {
      check : "Number",
      nullable : true,
      init : 0,
      apply : "_transform"
    },


    /**
     * Moves the widget on Z axis.
     */
    translateZ :
    {
      check : "Number",
      nullable : true,
      init : 0,
      apply : "_transform"
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {String} Prefix for the auto id */
    ID_PREFIX : "qx_id_",

    /** @type {Map} Internal data structure to store widgets */
    __registry : {},

    /** @type {Integer} Incremental counter of the current id */
    __idCounter : 0,

    /** @type {Integer} ID of the timeout for the DOM update */
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
      return qx.ui.mobile.core.Widget.__idCounter;
    },


    /**
     * Registers a widget with its id for internal widget handling.
     *
     * @param widget {qx.ui.core.Widget} The widget to register
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
     * @return {qx.ui.core.Widget} The widget with the given id
     */
    getWidgetById : function(id) {
      return qx.ui.mobile.core.Widget.__registry[id];
    },


    /**
     * Schedules the {@link #domUpdated} method. The method will be called after a timeout
     * to prevent the triggered events to be fired too often, during massive DOM manipulations.
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
      };
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
      };
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
      "activatable" :
      {
        attribute : "data-activatable",
        values :
        {
          "true" :"true",
          "false" : null
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
        style : "pointerEvents",
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
     * @return {String} The container element's tag name
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
      return qx.dom.Element.create(this._getTagName());
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
     * generated ID is set. This makes sure that an ID is always set.
     *
     * @param value {String} The set id of the widget
     * @return {String} The transformed ID
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

    /**
     * Sets the enable property to the new value
     * @param value {Boolean}, the new value of the widget
     * @param old {Boolean?}, the old value of the widget
     *
     */
    _applyEnabled : function(value,old)
    {
      if(value)
      {
        this.removeCssClass("disabled");
        this._setStyle('anonymous',this.getAnonymous());
      }
      else
      {
        this.addCssClass("disabled");
        this._setStyle('anonymous',true);
      }
    },


    /*
    ---------------------------------------------------------------------------
      Child Handling
    ---------------------------------------------------------------------------
    */


    /**
     * Adds a new child widget.
     *
     * @param child {qx.ui.core.Widget} the widget to add.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    _add : function(child, layoutProperties)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (child.getLayoutParent() === this) {
          throw new Error("The widget is already added this widget. Please remove it first.");
        }
      }

      this._initializeChildLayout(child, layoutProperties);

      this.getContentElement().appendChild(child.getContainerElement());
      this.__children.push(child);

      this._domUpdated();
    },


    /**
     * Add a child widget at the specified index
     *
     * @param child {qx.ui.core.Widget} widget to add
     * @param index {Integer} Index, at which the widget will be inserted. If no
     *   widget exists at the given index, the new widget gets appended to the
     *   current list of children.
     * @param options {Map?null} Optional layout data for widget.
     */
    _addAt : function(child, index, options)
    {
      // When moving in the same widget, remove widget first
      if (child.getLayoutParent() == this) {
        qx.lang.Array.remove(this.__children, child);
      }

      var ref = this.__children[index];

      if (ref) {
        this._addBefore(child, ref, options);
      } else {
        this._add(child, options);
      }
    },


    /**
     * Add a widget before another already inserted widget
     *
     * @param child {qx.ui.core.Widget} widget to add
     * @param beforeWidget {qx.ui.core.Widget} widget before the new widget will be inserted.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    _addBefore : function(child, beforeWidget, layoutProperties)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (child.getLayoutParent() === this) {
          throw new Error("The widget is already added this widget. Please remove it first.");
        }

        this.assertInArray(beforeWidget, this._getChildren(), "The 'before' widget is not a child of this widget!");
      }

      if (child == beforeWidget) {
        return;
      }

      this._initializeChildLayout(child, layoutProperties);

      this.getContentElement().insertBefore(child.getContainerElement(), beforeWidget.getContainerElement());
      qx.lang.Array.insertBefore(this.__children, child, beforeWidget);

      this._domUpdated();
    },


    /**
     * Add a widget after another already inserted widget.
     *
     * @param child {qx.ui.core.Widget} The widget to add.
     * @param afterWidget {qx.ui.core.Widget} Widget, after which the new widget will be inserted.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    _addAfter : function(child, afterWidget, layoutProperties)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (child.getLayoutParent() === this) {
          throw new Error("The child is already added to this widget. Please remove it first.");
        }

        this.assertInArray(afterWidget, this._getChildren(), "The 'after' widget is not a child of this widget!");
      }

      if (child == afterWidget) {
        return;
      }

      this._initializeChildLayout(child, layoutProperties);

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
     * @param child {qx.ui.core.Widget} The widget to remove.
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
     * @return {Array} An Array including the removed children.
     */
    _removeAll : function()
    {
      // create a copy of the array
      var children = this.__children.concat();
      for (var i = 0, l=children.length; i < l; i++) {
        this._remove(children[i]);
      }
      return children;
    },


    /**
     * Returns the index position of the given widget if it is
     * a child widget. Otherwise it returns <code>-1</code>.
     *
     * @param child {qx.ui.core.Widget} the widget to query for
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
     * @param parent {qx.ui.mobile.core.Widget} The parent widget
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
     * @param child {qx.ui.core.Widget} The widget to remove
     *
     * @internal
     */
    removeChild : function(child)
    {
      qx.lang.Array.remove(this.__children, child);
      this.getContentElement().removeChild(child.getContainerElement());
      var layout = this._getLayout();
      if (layout) {
        layout.disconnectFromChildWidget(child);
      }
    },


    /**
     * Returns the parent widget of this widget.
     *
     * @return {qx.ui.core.Widget} The parent of the widget
     */
    getLayoutParent : function()
    {
      return this.__layoutParent;
    },


    /**
     * Returns the children of the widget.
     *
     * @return {qx.ui.core.Widget[]} The children of the widget
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
        for (var i=0; i < this._getChildren().length; i++) {
          var child = this._getChildren()[i];
          this.__layoutManager.disconnectFromChildWidget(child);
        }
      }

      if (layout) {
        layout.connectToWidget(this);
      }
      this.__layoutManager = layout;
      this._domUpdated();
    },



    /**
     * Initializes the layout of the given child widget.
     *
     * @param child {qx.ui.core.Widget} The child widget
     * @param layoutProperties {Map?null} Optional layout data for widget
     */
    _initializeChildLayout : function(child, layoutProperties)
    {
      child.setLayoutParent(this);
      child.setLayoutProperties(layoutProperties);
      var layout = this._getLayout();
      if (layout) {
        layout.connectToChildWidget(child);
      }
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
      this._domUpdated();
    },


    /**
     * Updates the layout with the given arguments.
     *
     * @param widget {qx.ui.mobile.core.Widget} The target widget
     * @param action {String} The causing action that triggered the layout update.
     * @param properties {Map} The animation properties to set. Key / value pairs.
     *
     * @internal
     */
    updateLayout : function(widget, action, properties) {
      var layout = this._getLayout();
      if (layout) {
        layout.updateLayout(widget, action, properties);
      }
      this._domUpdated();
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


    /**
     * Transforms this widget (rotate, scale, translate3d)
     */
    _transform : function() {
      var propertyValue = "";
      if(this.getRotation() != null) {
        propertyValue = propertyValue + "rotate("+this.getRotation()+"deg) ";
      }

      if(this.getScaleX() != null && this.getScaleY() != null) {
        propertyValue = propertyValue + "scale("+this.getScaleX()+","+this.getScaleY()+") ";
      }

      var resolutionFactor = 1;
      if (this.getTransformUnit() == "rem") {
        resolutionFactor = 16;
      }

      if (this.getTranslateX() != null && this.getTranslateY() != null) {
        var isTransform3d = qx.core.Environment.get("css.transform.3d");
        if (isTransform3d && this.getTranslateZ() != null) {
          propertyValue = propertyValue + "translate3d(" + (this.getTranslateX()/resolutionFactor) + this.getTransformUnit() + "," + (this.getTranslateY()/resolutionFactor) + this.getTransformUnit() + "," + (this.getTranslateZ()/resolutionFactor) + this.getTransformUnit() + ") ";
        } else {
          propertyValue = propertyValue + "translate(" + (this.getTranslateX()/resolutionFactor) + this.getTransformUnit() + "," + (this.getTranslateY()/resolutionFactor) + this.getTransformUnit() + ") ";
        }
      }

      qx.bom.element.Style.set(this.getContainerElement(),"transform", propertyValue);
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
      var mapping = qx.ui.mobile.core.Widget.ATTRIBUTE_MAPPING[attribute];
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
      this._domUpdated();
    },


    /**
     * Returns the set value of the given attribute.
     *
     * @param attribute {String} The attribute name
     * @return {var} The attribute's value
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
      var mapping = qx.ui.mobile.core.Widget.STYLE_MAPPING[style];
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
      qx.bom.element.Class.add(this.getContainerElement(), cssClass);
      this._domUpdated();
    },


    /**
     * Adds an array of CSS classes to the container element of the widget. Use this method
     * to enhance the default appearance of the widget.
     *
     * @param cssClasses {String[]} The CSS classes to add, wrapped by an array.
     */
    addCssClasses : function(cssClasses) {
      if(cssClasses){
        qx.bom.element.Class.addClasses(this.getContainerElement(), cssClasses);
        this._domUpdated();
      }
    },


    /**
     * Removes a CSS class from the container element of the widget.
     *
     * @param cssClass {String} The CSS class to remove
     */
    removeCssClass : function(cssClass) {
      if (this.hasCssClass(cssClass)) {
        qx.bom.element.Class.remove(this.getContainerElement(), cssClass);
        this._domUpdated();
      }
    },


    /**
     * Removes an array of CSS classes from the container element of the widget.
     *
     * @param cssClasses {String[]} The CSS classes to remove from widget.
     */
    removeCssClasses : function(cssClasses) {
       if(cssClasses){
         qx.bom.element.Class.removeClasses(this.getContainerElement(), cssClasses);
         this._domUpdated();
       }
    },


    /**
     * Toggles the given CSS. Adds or removes the CSS class from the container element of the widget.
     *
     * @param cssClass {String} The CSS class to toggle
     */
    toggleCssClass : function(cssClass) {
      if (this.hasCssClass(cssClass)) {
        this.removeCssClass(cssClass);
      } else {
        this.addCssClass(cssClass);
      }
    },


    /**
     * Checks if the widget has a certain CSS class set.
     *
     * @param cssClass {String} The CSS class to check
     * @return {Boolean} Whether the CSS class is set or not
     */
    hasCssClass : function(cssClass) {
      return qx.bom.element.Class.has(this.getContainerElement(), cssClass);
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
        this.addCssClass("exclude");
      }
      else if(value == "visible")
      {
        this.removeCssClass("exclude");
        this._setStyle("visibility", "visible");
      }
      else if (value == "hidden") {
        this._setStyle("visibility", "hidden");
      }
      this._domUpdated();
    },


    /**
     * Sets the visibility of the widget.
     *
     * @param action {String} The causing action that triggered the layout update.
     * @param properties {Map} The animation properties to set. Key / value pairs.
     */
    __setVisibility : function(action, properties) {
      this.setVisibility(action);

      var parent = this.getLayoutParent();
      if (parent) {
        parent.updateLayout(this, action, properties);
      }
    },


    /**
     * Make this widget visible.
     *
     * @param properties {Map} The animation properties to set. Key / value pairs.
     *
     */
    show : function(properties) {
      this.__setVisibility("visible", properties);
    },


    /**
     * Hide this widget.
     *
     * @param properties {Map} The animation properties to set. Key / value pairs.
     *
     */
    hide : function(properties) {
      this.__setVisibility("hidden", properties);
    },


    /**
     * Hide this widget and exclude it from the underlying layout.
     *
     * @param properties {Map} The animation properties to set. Key / value pairs.
     *
     */
    exclude : function(properties) {
      this.__setVisibility("excluded", properties);
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
     * Detects if the widget and all its parents are visible.
     *
     * Warning: forces rendering of the browser. Do not use this method during
     * animations or performance critical tasks.
     * @return {Boolean} <code>true</code>if the widget is seeable
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
     * @param element {Element} The container DOM element of the widget
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
     * the function should return a reference of the element that should contain
     * the content.
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
    if(this.__layoutManager) {
      this.__layoutManager.dispose();
    }
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
