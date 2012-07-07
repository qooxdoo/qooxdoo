/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.ui.core.EventHandler)
#use(qx.event.handler.DragDrop)

#asset(qx/static/blank.gif)

************************************************************************ */

/**
 * This is the base class for all widgets.
 *
 * A widget consists of at least three HTML elements. The container element,
 * which is
 * added to the parent widget has two child Element: The "decoration" and the
 * "content" element. The decoration element has a lower z-Index and contains
 * markup to render the widget's background and border using an implementation
 * of {@link qx.ui.decoration.IDecorator}.The content element is positioned
 * inside the "container" element to respect paddings and contains the "real"
 * widget element.
 *
 * <pre>
 * -container------------
 * |                    |
 * |  -decoration----   |
 * |  | -content----|-  |
 * |  | |           ||  |
 * |  --|------------|  |
 * |    --------------  |
 * |                    |
 * ----------------------
 * </pre>
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/widget.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 *
 * @state disabled set by {@link #enabled}
 */
qx.Class.define("qx.ui.core.Widget",
{
  extend : qx.ui.core.LayoutItem,
  include : [qx.locale.MTranslation],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Create basic element structure
    this.__containerElement = this._createContainerElement();
    this.__contentElement = this.__createContentElement();
    this.__containerElement.add(this.__contentElement);

    // Initialize properties
    this.initFocusable();
    this.initSelectable();
    this.initNativeContextMenu();

  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired after the widget appears on the screen.
     */
    appear : "qx.event.type.Event",

    /**
     * Fired after the widget disappears from the screen.
     */
    disappear : "qx.event.type.Event",

    /**
     * Fired after the creation of a child control. The passed data is the
     * newly created child widget.
     */
    createChildControl : "qx.event.type.Data",


    /**
     * Fired on resize (after layout) of the widget.
     * The data property of the event contains the widget's computed location
     * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
     */
    resize : "qx.event.type.Data",

    /**
     * Fired on move (after layout) of the widget.
     * The data property of the event contains the widget's computed location
     * and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
     */
    move : "qx.event.type.Data",

    /**
     * Fired after the appearance has been applied. This happens before the
     * widget becomes visible, on state and appearance changes. The data field
     * contains the state map. This can be used to react on state changes or to
     * read properties set by the appearance.
     */
    syncAppearance : "qx.event.type.Data",



    /** Fired if the mouse cursor moves over the widget.
     *  The data property of the event contains the widget's computed location
     *  and dimension as returned by {@link qx.ui.core.LayoutItem#getBounds}
     */
    mousemove : "qx.event.type.Mouse",

    /**
     * Fired if the mouse cursor enters the widget.
     *
     * Note: This event is also dispatched if the widget is disabled!
     */
    mouseover : "qx.event.type.Mouse",

    /**
     * Fired if the mouse cursor leaves widget.
     *
     * Note: This event is also dispatched if the widget is disabled!
     */
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
    beforeContextmenuOpen : "qx.event.type.Data",

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
     * The event is fired when the widget gets focused. Only widgets which are
     * {@link #focusable} receive this event.
     */
    focus : "qx.event.type.Focus",

    /**
     * The event is fired when the widget gets blurred. Only widgets which are
     * {@link #focusable} receive this event.
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
     * Fired if the widget becomes the capturing widget by a call to {@link #capture}.
     */
    capture : "qx.event.type.Event",

    /**
     * Fired if the widget looses the capturing mode by a call to
     * {@link #releaseCapture} or a mouse click.
     */
    losecapture : "qx.event.type.Event",



    /**
     * Fired on the drop target when the drag&drop action is finished
     * successfully. This event is normally used to transfer the data
     * from the drag to the drop target.
     *
     * Modeled after the WHATWG specification of Drag&Drop:
     * http://www.whatwg.org/specs/web-apps/current-work/#dnd
     */
    drop : "qx.event.type.Drag",

    /**
     * Fired on a potential drop target when leaving it.
     *
     * Modeled after the WHATWG specification of Drag&Drop:
     * http://www.whatwg.org/specs/web-apps/current-work/#dnd
     */
    dragleave : "qx.event.type.Drag",

    /**
     * Fired on a potential drop target when reaching it via the mouse.
     * This event can be canceled if none of the incoming data types
     * are supported.
     *
     * Modeled after the WHATWG specification of Drag&Drop:
     * http://www.whatwg.org/specs/web-apps/current-work/#dnd
     */
    dragover : "qx.event.type.Drag",

    /**
     * Fired during the drag. Contains the current mouse coordinates
     * using {@link qx.event.type.Drag#getDocumentLeft} and
     * {@link qx.event.type.Drag#getDocumentTop}
     *
     * Modeled after the WHATWG specification of Drag&Drop:
     * http://www.whatwg.org/specs/web-apps/current-work/#dnd
     */
    drag : "qx.event.type.Drag",

    /**
     * Initiate the drag-and-drop operation. This event is cancelable
     * when the drag operation is currently not allowed/possible.
     *
     * Modeled after the WHATWG specification of Drag&Drop:
     * http://www.whatwg.org/specs/web-apps/current-work/#dnd
     */
    dragstart : "qx.event.type.Drag",

    /**
     * Fired on the source (drag) target every time a drag session was ended.
     */
    dragend : "qx.event.type.Drag",

    /**
     * Fired when the drag configuration has been modified e.g. the user
     * pressed a key which changed the selected action.
     */
    dragchange : "qx.event.type.Drag",

    /**
     * Fired when the drop was successfully done and the target widget
     * is now asking for data. The listener should transfer the data,
     * respecting the selected action, to the event. This can be done using
     * the event's {@link qx.event.type.Drag#addData} method.
     */
    droprequest : "qx.event.type.Drag"
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
      init : 0,
      apply : "_applyPadding",
      themeable : true
    },


    /** Padding of the widget (bottom) */
    paddingBottom :
    {
      check : "Integer",
      init : 0,
      apply : "_applyPadding",
      themeable : true
    },


    /** Padding of the widget (left) */
    paddingLeft :
    {
      check : "Integer",
      init : 0,
      apply : "_applyPadding",
      themeable : true
    },


    /**
     * The 'padding' property is a shorthand property for setting 'paddingTop',
     * 'paddingRight', 'paddingBottom' and 'paddingLeft' at the same time.
     *
     * If four values are specified they apply to top, right, bottom and left respectively.
     * If there is only one value, it applies to all sides, if there are two or three,
     * the missing values are taken from the opposite side.
     */
    padding :
    {
      group : [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ],
      mode  : "shorthand",
      themeable : true
    },






    /*
    ---------------------------------------------------------------------------
      STYLING PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * The z-index property sets the stack order of an element. An element with
     * greater stack order is always in front of another element with lower stack order.
     */
    zIndex :
    {
      nullable : true,
      init : null,
      apply : "_applyZIndex",
      event : "changeZIndex",
      check : "Integer",
      themeable : true
    },


    /**
     * The decorator property points to an object, which is responsible
     * for drawing the widget's decoration, e.g. border, background or shadow.
     *
     * This can be a decorator object or a string pointing to a decorator
     * defined in the decoration theme.
     */
    decorator :
    {
      nullable : true,
      init : null,
      apply : "_applyDecorator",
      event : "changeDecorator",
      check : "Decorator",
      themeable : true
    },


    /**
     * The decorator used to render the widget's outline/shadow. The decorator's
     * insets are interpreted as the amount of pixels the shadow extends the
     * widget's size.
     *
     * This can be a decorator object or a string pointing to a decorator
     * defined in the decoration theme.
     *
     * Note that shadows work only properly in top level widgets like menus, windows
     * or tooltips. If used in inner widgets the shadow may not be cut by the
     * parent widget.
     */
    shadow :
    {
      nullable : true,
      init : null,
      apply : "_applyShadow",
      event : "changeShadow",
      check : "Decorator",
      themeable : true
    },


    /**
     * The background color the rendered widget.
     */
    backgroundColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBackgroundColor",
      event : "changeBackgroundColor",
      themeable : true
    },


    /**
     * The text color the rendered widget.
     */
    textColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyTextColor",
      event : "changeTextColor",
      themeable : true,
      inheritable : true
    },


    /**
     * The widget's font. The value is either a font name defined in the font
     * theme or an instance of {@link qx.bom.Font}.
     */
    font :
    {
      nullable : true,
      apply : "_applyFont",
      check : "Font",
      event : "changeFont",
      themeable : true,
      inheritable : true,
      dereference : true
    },


    /**
     * Mapping to native style property opacity.
     *
     * The uniform opacity setting to be applied across an entire object.
     * Behaves like the new CSS-3 Property.
     * Any values outside the range 0.0 (fully transparent) to 1.0
     * (fully opaque) will be clamped to this range.
     */
    opacity :
    {
      check : "Number",
      apply : "_applyOpacity",
      themeable : true,
      nullable : true,
      init : null
    },


    /**
     * Mapping to native style property cursor.
     *
     * The name of the cursor to show when the mouse pointer is over the widget.
     * This is any valid CSS2 cursor name defined by W3C.
     *
     * The following values are possible crossbrowser:
     * <ul><li>default</li>
     * <li>crosshair</li>
     * <li>pointer</li>
     * <li>move</li>
     * <li>n-resize</li>
     * <li>ne-resize</li>
     * <li>e-resize</li>
     * <li>se-resize</li>
     * <li>s-resize</li>
     * <li>sw-resize</li>
     * <li>w-resize</li>
     * <li>nw-resize</li>
     * <li>text</li>
     * <li>wait</li>
     * <li>help </li>
     * </ul>
     */
    cursor :
    {
      check : "String",
      apply : "_applyCursor",
      themeable : true,
      inheritable : true,
      nullable : true,
      init : null
    },


    /**
     * Sets the tooltip instance to use for this widget. If only the tooltip
     * text and icon have to be set its better to use the {@link #toolTipText}
     * and {@link #toolTipIcon} properties since they use a shared tooltip
     * instance.
     *
     * If this property is set the {@link #toolTipText} and {@link #toolTipIcon}
     * properties are ignored.
     */
    toolTip :
    {
      check : "qx.ui.tooltip.ToolTip",
      nullable : true
    },


    /**
     * The text of the widget's tooltip. This text can contain HTML markup.
     * The text is displayed using a shared tooltip instance. If the tooltip
     * must be customized beyond the text and an icon {@link #toolTipIcon}, the
     * {@link #toolTip} property has to be used
     */
    toolTipText :
    {
      check : "String",
      nullable : true,
      event : "changeToolTipText",
      apply : "_applyToolTipText"
    },


    /**
    * The icon URI of the widget's tooltip. This icon is displayed using a shared
    * tooltip instance. If the tooltip must be customized beyond the tooltip text
    * {@link #toolTipText} and the icon, the {@link #toolTip} property has to be
    * used.
    */
    toolTipIcon :
    {
      check : "String",
      nullable : true,
      event : "changeToolTipText"
    },

    /**
     * Controls if a tooltip should shown or not.
     */
    blockToolTip :
    {
      check : "Boolean",
      init : false
    },


    /*
    ---------------------------------------------------------------------------
      MANAGEMENT PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Controls the visibility. Valid values are:
     *
     * <ul>
     *   <li><b>visible</b>: Render the widget</li>
     *   <li><b>hidden</b>: Hide the widget but don't relayout the widget's parent.</li>
     *   <li><b>excluded</b>: Hide the widget and relayout the parent as if the
     *     widget was not a child of its parent.</li>
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
     * Whether the widget is enabled. Disabled widgets are usually grayed out
     * and do not process user created events. While in the disabled state most
     * user input events are blocked. Only the {@link #mouseover} and
     * {@link #mouseout} events will be dispatched.
     */
    enabled :
    {
      init : true,
      check : "Boolean",
      inheritable : true,
      apply : "_applyEnabled",
      event : "changeEnabled"
    },


    /**
     * Whether the widget is anonymous.
     *
     * Anonymous widgets are ignored in the event hierarchy. This is useful
     * for combined widgets where the internal structure do not have a custom
     * appearance with a different styling from the element around. This is
     * especially true for widgets like checkboxes or buttons where the text
     * or icon are handled synchronously for state changes to the outer widget.
     */
    anonymous :
    {
      init : false,
      check : "Boolean"
    },


    /**
     * Defines the tab index of an widget. If widgets with tab indexes are part
     * of the current focus root these elements are sorted in first priority. Afterwards
     * the sorting continues by rendered position, zIndex and other criteria.
     *
     * Please note: The value must be between 1 and 32000.
     */
    tabIndex :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyTabIndex"
    },


    /**
     * Whether the widget is focusable e.g. rendering a focus border and visualize
     * as active element.
     *
     * See also {@link #isTabable} which allows runtime checks for
     * <code>isChecked</code> or other stuff to test whether the widget is
     * reachable via the TAB key.
     */
    focusable :
    {
      check : "Boolean",
      init : false,
      apply : "_applyFocusable"
    },


    /**
     * If this property is enabled, the widget and all of its child widgets
     * will never get focused. The focus keeps at the currently
     * focused widget.
     *
     * This only works for widgets which are not {@link #focusable}.
     *
     * This is mainly useful for widget authors. Please use with caution!
     */
    keepFocus :
    {
      check : "Boolean",
      init : false,
      apply : "_applyKeepFocus"
    },


    /**
     * If this property if enabled, the widget and all of its child widgets
     * will never get activated. The activation keeps at the currently
     * activated widget.
     *
     * This is mainly useful for widget authors. Please use with caution!
     */
    keepActive :
    {
      check : "Boolean",
      init : false,
      apply : "_applyKeepActive"
    },


    /** Whether the widget acts as a source for drag&drop operations */
    draggable :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDraggable"
    },


    /** Whether the widget acts as a target for drag&drop operations */
    droppable :
    {
      check : "Boolean",
      init : false,
      apply : "_applyDroppable"
    },


    /**
     * Whether the widget contains content which may be selected by the user.
     *
     * If the value set to <code>true</code> the native browser selection can
     * be used for text selection. But it is normally useful for
     * forms fields, longer texts/documents, editors, etc.
     */
    selectable :
    {
      check : "Boolean",
      init : false,
      event : "changeSelectable",
      apply : "_applySelectable"
    },


    /**
     * Whether to show a context menu and which one
     */
    contextMenu :
    {
      check : "qx.ui.menu.Menu",
      apply : "_applyContextMenu",
      nullable : true,
      event : "changeContextMenu"
    },


    /**
     * Whether the native context menu should be enabled for this widget. To
     * globally enable the native context menu set the {@link #nativeContextMenu}
     * property of the root widget ({@link qx.ui.root.Abstract}) to
     * <code>true</code>.
     */
    nativeContextMenu :
    {
      check : "Boolean",
      init : false,
      themeable : true,
      event : "changeNativeContextMenu",
      apply : "_applyNativeContextMenu"
    },


    /**
     * The appearance ID. This ID is used to identify the appearance theme
     * entry to use for this widget. This controls the styling of the element.
     */
    appearance :
    {
      check : "String",
      init : "widget",
      apply : "_applyAppearance",
      event : "changeAppearance"
    }
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Whether the widget should print out hints and debug messages */
    DEBUG : false,

    /**
     * Returns the widget, which contains the given DOM element.
     *
     * @param element {Element} The DOM element to search the widget for.
     * @param considerAnonymousState {Boolean?false} If true, anonymous widget
     *   will not be returned.
     * @return {qx.ui.core.Widget} The widget containing the element.
     */
    getWidgetByElement : function(element, considerAnonymousState)
    {
      while(element)
      {
        var widgetKey = element.$$widget;

        // dereference "weak" reference to the widget.
        if (widgetKey != null) {
          var widget = qx.core.ObjectRegistry.fromHashCode(widgetKey);
          // check for anonymous widgets
          if (!considerAnonymousState || !widget.getAnonymous()) {
            return widget;
          }
        }

        // Fix for FF, which occasionally breaks (BUG#3525)
        try {
          element = element.parentNode;
        } catch (e) {
          return null;
        }
      }
      return null;
    },


    /**
     * Whether the "parent" widget contains the "child" widget.
     *
     * @param parent {qx.ui.core.Widget} The parent widget
     * @param child {qx.ui.core.Widget} The child widget
     * @return {Boolean} Whether one of the "child"'s parents is "parent"
     */
    contains : function(parent, child)
    {
      while (child)
      {
        if (parent == child) {
          return true;
        }

        child = child.getLayoutParent();
      }

      return false;
    },


    /** {Map} Contains all pooled decorators for reuse */
    __decoratorPool : new qx.ui.core.DecoratorFactory(),

    /** {Map} Contains all pooled shadows for reuse */
    __shadowPool : new qx.ui.core.DecoratorFactory()
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
    __decoratorElement : null,
    __shadowElement : null,
    __protectorElement : null,
    __initialAppearanceApplied : null,
    __toolTipTextListenerId : null,


    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * {qx.ui.layout.Abstract} The connected layout manager
     */
    __layoutManager : null,


    // overridden
    _getLayout : function() {
      return this.__layoutManager;
    },


    /**
     * Set a layout manager for the widget. A a layout manager can only be connected
     * with one widget. Reset the connection with a previous widget first, if you
     * like to use it in another widget instead.
     *
     * @param layout {qx.ui.layout.Abstract} The new layout or
     *     <code>null</code> to reset the layout.
     * @return {void}
     */
    _setLayout : function(layout)
    {
      if (qx.core.Environment.get("qx.debug")) {
        if (layout) {
          this.assertInstance(layout, qx.ui.layout.Abstract);
        }
      }

      if (this.__layoutManager) {
        this.__layoutManager.connectToWidget(null);
      }

      if (layout) {
        layout.connectToWidget(this);
      }

      this.__layoutManager = layout;
      qx.ui.core.queue.Layout.add(this);
    },


    // overridden
    setLayoutParent : function(parent)
    {
      if (this.$$parent === parent) {
        return;
      }

      var container = this.getContainerElement();

      if (this.$$parent && !this.$$parent.$$disposed) {
        this.$$parent.getContentElement().remove(container);
      }

      this.$$parent = parent || null;

      if (parent && !parent.$$disposed) {
        this.$$parent.getContentElement().add(container);
      }

      // Update inheritable properties
      this.$$refreshInheritables();

      // Update visibility cache
      qx.ui.core.queue.Visibility.add(this);
    },


    /** {Boolean} Whether insets have changed and must be updated */
    _updateInsets : null,


    /**
     * Detects whether the move from decorator <code>a</code> to <code>b</code>
     * results into modified insets.
     *
     * @param a {Decorator} Old decorator or <code>null</code>
     * @param b {Decorator} New decorator or <code>null</code>
     * @return {Boolean} Whether the insets have been modified
     */
    __checkInsetsModified : function(a, b)
    {
      if (a == b) {
        return false;
      }

      if (a == null || b == null) {
        return true;
      }

      var manager = qx.theme.manager.Decoration.getInstance();

      var first = manager.resolve(a).getInsets();
      var second = manager.resolve(b).getInsets();

      if (first.top != second.top ||
          first.right != second.right ||
          first.bottom != second.bottom ||
          first.left != second.left
      ) {
        return true;
      }

      return false;
    },


    // overridden
    renderLayout : function(left, top, width, height)
    {
      var changes = this.base(arguments, left, top, width, height);

      // Directly return if superclass has detected that no
      // changes needs to be applied
      if (!changes) {
        return null;
      }

      if (qx.lang.Object.isEmpty(changes) && !this._updateInsets) {
        return null;
      }

      var container = this.getContainerElement();
      var content = this.getContentElement();
      var inner = changes.size || this._updateInsets;
      var pixel = "px";

      var containerStyles = {};

      // Move container to new position
      if (changes.position)
      {
        containerStyles.left = left + pixel;
        containerStyles.top = top + pixel;
      }

      // Update container size
      if (changes.size)
      {
        containerStyles.width = width + pixel;
        containerStyles.height = height + pixel;
      }

      if (changes.position || changes.size) {
        container.setStyles(containerStyles);
      }

      if (inner || changes.local || changes.margin)
      {
        var insets = this.getInsets();
        var innerWidth = width - insets.left - insets.right;
        var innerHeight = height - insets.top - insets.bottom;
        // ensure that the width and height never get negative
        innerWidth = innerWidth < 0 ? 0 : innerWidth;
        innerHeight = innerHeight < 0 ? 0 : innerHeight;
      }

      var contentStyles = {};

      if (this._updateInsets)
      {
        contentStyles.left = insets.left + pixel;
        contentStyles.top = insets.top + pixel;
      }

      if (inner)
      {
        contentStyles.width = innerWidth + pixel;
        contentStyles.height = innerHeight + pixel;
      }

      if (inner || this._updateInsets) {
        content.setStyles(contentStyles);
      }

      if (changes.size)
      {
        var protector = this.__protectorElement;
        if (protector)
        {
          protector.setStyles({
            width : width + "px",
            height : height + "px"
          });
        }
      }

      if (changes.size || this._updateInsets)
      {
        if (this.__decoratorElement) {
          this.__decoratorElement.resize(width, height);
        }
      }

      if (changes.size)
      {
        if (this.__shadowElement)
        {
          var insets = this.__shadowElement.getInsets();

          var shadowWidth = width + insets.left + insets.right;
          var shadowHeight = height + insets.top + insets.bottom;

          this.__shadowElement.resize(shadowWidth, shadowHeight);
        }
      }

      if (inner || changes.local || changes.margin)
      {
        if (this.__layoutManager && this.hasLayoutChildren()) {
          this.__layoutManager.renderLayout(innerWidth, innerHeight);
        } else if (this.hasLayoutChildren()) {
          throw new Error("At least one child in control " +
            this._findTopControl() +
            " requires a layout, but no one was defined!");
        }
      }

      // Fire events
      if (changes.position && this.hasListener("move")) {
        this.fireDataEvent("move", this.getBounds());
      }

      if (changes.size && this.hasListener("resize")) {
        this.fireDataEvent("resize", this.getBounds());
      }

      // Cleanup flags
      delete this._updateInsets;

      return changes;
    },










    /*
    ---------------------------------------------------------------------------
      SEPARATOR SUPPORT
    ---------------------------------------------------------------------------
    */

    __separators : null,

    // overridden
    clearSeparators : function()
    {
      var reg = this.__separators;
      if (!reg) {
        return;
      }

      var pool = qx.ui.core.Widget.__decoratorPool;
      var content = this.getContentElement();
      var elem;

      for (var i=0, l=reg.length; i<l; i++)
      {
        elem = reg[i];
        pool.poolDecorator(elem);
        content.remove(elem);
      }

      // Clear registry
      reg.length = 0;
    },


    // overridden
    renderSeparator : function(separator, bounds)
    {
      // Insert
      var elem = qx.ui.core.Widget.__decoratorPool.getDecoratorElement(separator);
      this.getContentElement().add(elem);

      // Resize
      elem.resize(bounds.width, bounds.height);

      // Move
      var domEl = elem.getDomElement();
      // use the DOM element because the cache of the qx.html.Element could be 
      // wrong due to changes made by the decorators which work on the DOM element too
      if (domEl) {
        domEl.style.top = bounds.top + "px";
        domEl.style.left = bounds.left + "px";
      } else {
        elem.setStyles({
          left : bounds.left + "px",
          top : bounds.top + "px"
        });
      }

      // Remember element
      if (!this.__separators) {
        this.__separators = [elem];
      } else {
        this.__separators.push(elem);
      }
    },







    /*
    ---------------------------------------------------------------------------
      SIZE HINTS
    ---------------------------------------------------------------------------
    */

    // overridden
    _computeSizeHint : function()
    {
      // Start with the user defined values
      var width = this.getWidth();
      var minWidth = this.getMinWidth();
      var maxWidth = this.getMaxWidth();

      var height = this.getHeight();
      var minHeight = this.getMinHeight();
      var maxHeight = this.getMaxHeight();

      if (qx.core.Environment.get("qx.debug"))
      {
        if (minWidth !== null && maxWidth !== null) {
          this.assert(minWidth <= maxWidth, "minWidth is larger than maxWidth!");
        }
        if (minHeight !== null && maxHeight !== null) {
          this.assert(minHeight <= maxHeight, "minHeight is larger than maxHeight!");
        }
      }

      // Ask content
      var contentHint = this._getContentHint();

      var insets = this.getInsets();
      var insetX = insets.left + insets.right;
      var insetY = insets.top + insets.bottom;

      if (width == null) {
        width = contentHint.width + insetX;
      }

      if (height == null) {
        height = contentHint.height + insetY;
      }

      if (minWidth == null)
      {
        minWidth = insetX;

        if (contentHint.minWidth != null) {
          minWidth += contentHint.minWidth;
          // do not apply bigger min width than max width [BUG #5008]
          if (minWidth > maxWidth && maxWidth != null) {
            minWidth = maxWidth;
          }
        }
      }

      if (minHeight == null)
      {
        minHeight = insetY;

        if (contentHint.minHeight != null) {
          minHeight += contentHint.minHeight;
          // do not apply bigger min height than max height [BUG #5008]
          if (minHeight > maxHeight && maxHeight != null) {
            minHeight = maxHeight;
          }
        }
      }

      if (maxWidth == null)
      {
        if (contentHint.maxWidth == null) {
          maxWidth = Infinity;
        } else {
          maxWidth = contentHint.maxWidth + insetX;
          // do not apply bigger min width than max width [BUG #5008]
          if (maxWidth < minWidth && minWidth != null) {
            maxWidth = minWidth;
          }
        }
      }

      if (maxHeight == null)
      {
        if (contentHint.maxHeight == null) {
          maxHeight = Infinity;
        } else {
          maxHeight = contentHint.maxHeight + insetY;
          // do not apply bigger min width than max width [BUG #5008]
          if (maxHeight < minHeight && minHeight != null) {
            maxHeight = minHeight;
          }
        }
      }


      // Build size hint and return
      return {
        width : width,
        minWidth : minWidth,
        maxWidth : maxWidth,
        height : height,
        minHeight : minHeight,
        maxHeight : maxHeight
      };
    },


    // overridden
    invalidateLayoutCache : function()
    {
      this.base(arguments);

      if (this.__layoutManager) {
        this.__layoutManager.invalidateLayoutCache();
      }
    },


    /**
     * Returns the recommended/natural dimensions of the widget's content.
     *
     * For labels and images this may be their natural size when defined without
     * any dimensions. For containers this may be the recommended size of the
     * underlying layout manager.
     *
     * Developer note: This can be overwritten by the derived classes to allow
     * a custom handling here.
     *
     * @return {Map}
     */
    _getContentHint : function()
    {
      var layout = this.__layoutManager;
      if (layout)
      {
        if (this.hasLayoutChildren())
        {
          var hint = layout.getSizeHint();

          if (qx.core.Environment.get("qx.debug"))
          {
            var msg = "The layout of the widget" + this.toString() +
              " returned an invalid size hint!";
            this.assertInteger(hint.width, "Wrong 'left' argument. " + msg);
            this.assertInteger(hint.height, "Wrong 'top' argument. " + msg);
          }

          return hint;
        }
        else
        {
          return {
            width : 0,
            height : 0
          };
        }
      }
      else
      {
        return {
          width : 100,
          height : 50
        };
      }
    },


    // overridden
    _getHeightForWidth : function(width)
    {
      // Prepare insets
      var insets = this.getInsets();

      var insetX = insets.left + insets.right;
      var insetY = insets.top + insets.bottom;

      // Compute content width
      var contentWidth = width - insetX;

      // Compute height
      var layout = this._getLayout();
      if (layout && layout.hasHeightForWidth()) {
        var contentHeight =  layout.getHeightForWidth(width);
      } else {
        contentHeight = this._getContentHeightForWidth(contentWidth);
      }

      // Computed box height
      var height = contentHeight + insetY;

      return height;
    },


    /**
     * Returns the computed height for the given width.
     *
     * @abstract
     * @param width {Integer} Incoming width (as limitation)
     * @return {Integer} Computed height while respecting the given width.
     */
    _getContentHeightForWidth : function(width) {
      throw new Error("Abstract method call: _getContentHeightForWidth()!");
    },






    /*
    ---------------------------------------------------------------------------
      INSET CALCULATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Return the insets of the widget's inner element relative to its
     * container element. The inset is the sum of the padding and border width.
     *
     * @return {Map} Contains the keys <code>top</code>, <code>right</code>,
     *   <code>bottom</code> and <code>left</code>. All values are integers.
     */
    getInsets : function()
    {
      var top = this.getPaddingTop();
      var right = this.getPaddingRight();
      var bottom = this.getPaddingBottom();
      var left = this.getPaddingLeft();
      if (this.__decoratorElement)
      {
        var inset = this.__decoratorElement.getInsets();

        if (qx.core.Environment.get("qx.debug"))
        {
          this.assertNumber(
            inset.top,
            "Invalid top decorator inset detected: " + inset.top
          );
          this.assertNumber(
            inset.right,
            "Invalid right decorator inset detected: " + inset.right
          );
          this.assertNumber(
            inset.bottom,
            "Invalid bottom decorator inset detected: " + inset.bottom
          );
          this.assertNumber(
            inset.left,
            "Invalid left decorator inset detected: " + inset.left
          );
        }

        top += inset.top;
        right += inset.right;
        bottom += inset.bottom;
        left += inset.left;
      }

      return {
        "top" : top,
        "right" : right,
        "bottom" : bottom,
        "left" : left
      };
    },





    /*
    ---------------------------------------------------------------------------
      COMPUTED LAYOUT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the widget's computed inner size as available
     * through the layout process.
     *
     * This function is guaranteed to return a correct value
     * during a {@link #resize} or {@link #move} event dispatch.
     *
     * @return {Map} The widget inner dimension in pixel (if the layout is
     *    valid). Contains the keys <code>width</code> and <code>height</code>.
     */
    getInnerSize : function()
    {
      var computed = this.getBounds();
      if (!computed) {
        return null;
      }

      // Return map data
      var insets = this.getInsets();
      return {
        width : computed.width - insets.left - insets.right,
        height : computed.height - insets.top - insets.bottom
      };
    },






    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT: USER API
    ---------------------------------------------------------------------------
    */

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
     * Detects if the widget and all its parents are visible.
     *
     * WARNING: Please use this method with caution becuase it flushes the
     * internal queues which might be an expensive operation.
     *
     * @return {Boolean} true, if the widget is currently on the screen
     */
    isSeeable : function()
    {
      // Flush the queues because to detect if the widget ins visible, the
      // queues need to be flushed (see bug #5254)
      qx.ui.core.queue.Manager.flush();
      // if the element is already rendered, a check for the offsetWidth is enough
      var element = this.getContainerElement().getDomElement();
      if (element) {
        // will also be 0 if the parents are not visible
        return element.offsetWidth > 0;
      }
      // if no element is available, it can not be visible
      return false;
    },




    /*
    ---------------------------------------------------------------------------
      CREATION OF HTML ELEMENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Create the widget's container HTML element.
     *
     * @return {qx.html.Element} The container HTML element
     */
    _createContainerElement : function()
    {
      var attributes = {
        "$$widget": this.toHashCode()
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        attributes.qxType = "container";
        attributes.qxClass = this.classname;
      }

      var styles = {
        zIndex: 0,
        position: "absolute"
      };

      return new qx.html.Element("div", styles, attributes);
    },


    /**
     * Create the widget's content HTML element.
     *
     * @return {qx.html.Element} The content HTML element
     */
    __createContentElement : function()
    {
      var el = this._createContentElement();

      if (qx.core.Environment.get("qx.debug")) {
        el.setAttribute("qxType", "content");
      }

      el.setStyles({
        "position": "absolute",
        "zIndex": 10
      });

      return el;
    },


    /**
     * Creates the content element. The style properties
     * position and zIndex are modified from the Widget
     * core.
     *
     * This function may be overridden to customize a class
     * content.
     */
    _createContentElement : function()
    {
      return new qx.html.Element("div", {
        overflowX: "hidden",
        overflowY: "hidden"
      });
    },


    /**
     * Returns the element wrapper of the widget's container element.
     * This method exposes widget internal and must be used with caution!
     *
     * @return {qx.html.Element} The widget's container element
     */
    getContainerElement : function() {
      return this.__containerElement;
    },


    /**
     * Returns the element wrapper of the widget's content element.
     * This method exposes widget internal and must be used with caution!
     *
     * @return {qx.html.Element} The widget's content element
     */
    getContentElement : function() {
      return this.__contentElement;
    },


    /**
     * Returns the element wrapper of the widget's decorator element.
     * This method exposes widget internals and must be used with caution!
     *
     * @return {qx.html.Decorator|null} The widget's decorator element (may be null)
     */
    getDecoratorElement : function() {
      return this.__decoratorElement || null;
    },


    /**
     * Returns the element wrapper of the widget's shadow element.
     * This method exposes widget internals and must be used with caution!
     *
     * @return {qx.html.Decorator|null} The widget's shadow element (may be null)
     */
    getShadowElement : function() {
      return this.__shadowElement || null;
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    /** {qx.ui.core.LayoutItem[]} List of all child widgets */
    __widgetChildren : null,


    /**
     * Returns all children, which are layout relevant. This excludes all widgets,
     * which have a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>.
     *
     * @internal
     * @return {qx.ui.core.Widget[]} All layout relevant children.
     */
    getLayoutChildren : function()
    {
      var children = this.__widgetChildren;
      if (!children) {
        return this.__emptyChildren;
      }

      var layoutChildren;
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        if (child.hasUserBounds() || child.isExcluded())
        {
          if (layoutChildren == null) {
            layoutChildren = children.concat();
          }

          qx.lang.Array.remove(layoutChildren, child);
        }
      }

      return layoutChildren || children;
    },


    /**
     * Marks the layout of this widget as invalid and triggers a layout update.
     * This is a shortcut for <code>qx.ui.core.queue.Layout.add(this);</code>.
     */
    scheduleLayoutUpdate : function() {
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Resets the cache for children which should be laid out.
     */
    invalidateLayoutChildren : function()
    {
      var layout = this.__layoutManager;
      if (layout) {
        layout.invalidateChildrenCache();
      }

      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Returns whether the layout has children, which are layout relevant. This
     * excludes all widgets, which have a {@link qx.ui.core.Widget#visibility}
     * value of <code>exclude</code>.
     *
     * @return {Boolean} Whether the layout has layout relevant children
     */
    hasLayoutChildren : function()
    {
      var children = this.__widgetChildren;
      if (!children) {
        return false;
      }

      var child;
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        if (!child.hasUserBounds() && !child.isExcluded()) {
          return true;
        }
      }

      return false;
    },


    /**
     * Returns the widget which contains the children and
     * is relevant for laying them out. This is from the user point of
     * view and may not be identical to the technical structure.
     *
     * @return {qx.ui.core.Widget} Widget which contains the children.
     */
    getChildrenContainer : function() {
      return this;
    },


    /**
     * {Array} Placeholder for children list in empty widgets.
     *     Mainly to keep instance number low.
     *
     * @lint ignoreReferenceField(__emptyChildren)
     */
    __emptyChildren : [],


    /**
     * Returns the children list
     *
     * @return {LayoutItem[]} The children array (Arrays are
     *   reference types, so please do not modify it in-place).
     */
    _getChildren : function() {
      return this.__widgetChildren || this.__emptyChildren;
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
      var children = this.__widgetChildren;
      if (!children) {
        return -1;
      }

      return children.indexOf(child);
    },


    /**
     * Whether the widget contains children.
     *
     * @return {Boolean} Returns <code>true</code> when the widget has children.
     */
    _hasChildren : function()
    {
      var children = this.__widgetChildren;
      return children != null && (!!children[0]);
    },


    /**
     * Recursively adds all children to the given queue
     *
     * @param queue {Array} The queue to add widgets to
     */
    addChildrenToQueue : function(queue)
    {
      var children = this.__widgetChildren;
      if (!children) {
        return;
      }

      var child;
      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        queue.push(child);

        child.addChildrenToQueue(queue);
      }
    },


    /**
     * Adds a new child widget.
     *
     * The supported keys of the layout options map depend on the layout manager
     * used to position the widget. The options are documented in the class
     * documentation of each layout manager {@link qx.ui.layout}.
     *
     * @param child {LayoutItem} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     * @return {void}
     */
    _add : function(child, options)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(child, qx.ui.core.LayoutItem.constructor, "'Child' must be an instance of qx.ui.core.LayoutItem!")
      }

      // When moving in the same widget, remove widget first
      if (child.getLayoutParent() == this) {
        qx.lang.Array.remove(this.__widgetChildren, child);
      }

      if (this.__widgetChildren) {
        this.__widgetChildren.push(child);
      } else {
        this.__widgetChildren = [ child ];
      }

      this.__addHelper(child, options);
    },


    /**
     * Add a child widget at the specified index
     *
     * @param child {LayoutItem} widget to add
     * @param index {Integer} Index, at which the widget will be inserted
     * @param options {Map?null} Optional layout data for widget.
     */
    _addAt : function(child, index, options)
    {
      if (!this.__widgetChildren) {
        this.__widgetChildren = [];
      }

      // When moving in the same widget, remove widget first
      if (child.getLayoutParent() == this) {
        qx.lang.Array.remove(this.__widgetChildren, child);
      }

      var ref = this.__widgetChildren[index];

      if (ref === child) {
        child.setLayoutProperties(options);
      }

      if (ref) {
        qx.lang.Array.insertBefore(this.__widgetChildren, child, ref);
      } else {
        this.__widgetChildren.push(child);
      }

      this.__addHelper(child, options);
    },


    /**
     * Add a widget before another already inserted widget
     *
     * @param child {LayoutItem} widget to add
     * @param before {LayoutItem} widget before the new widget will be inserted.
     * @param options {Map?null} Optional layout data for widget.
     * @return {void}
     */
    _addBefore : function(child, before, options)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInArray(before, this._getChildren(),
          "The 'before' widget is not a child of this widget!");
      }

      if (child == before) {
        return;
      }

      if (!this.__widgetChildren) {
        this.__widgetChildren = [];
      }

      // When moving in the same widget, remove widget first
      if (child.getLayoutParent() == this) {
        qx.lang.Array.remove(this.__widgetChildren, child);
      }

      qx.lang.Array.insertBefore(this.__widgetChildren, child, before);

      this.__addHelper(child, options);
    },


    /**
     * Add a widget after another already inserted widget
     *
     * @param child {LayoutItem} widget to add
     * @param after {LayoutItem} widget, after which the new widget will
     *   be inserted
     * @param options {Map?null} Optional layout data for widget.
     * @return {void}
     */
    _addAfter : function(child, after, options)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInArray(after, this._getChildren(),
          "The 'after' widget is not a child of this widget!");
      }

      if (child == after) {
        return;
      }

      if (!this.__widgetChildren) {
        this.__widgetChildren = [];
      }

      // When moving in the same widget, remove widget first
      if (child.getLayoutParent() == this) {
        qx.lang.Array.remove(this.__widgetChildren, child);
      }

      qx.lang.Array.insertAfter(this.__widgetChildren, child, after);

      this.__addHelper(child, options);
    },


    /**
     * Remove the given child widget.
     *
     * @param child {LayoutItem} the widget to remove
     * @return {void}
     */
    _remove : function(child)
    {
      if (!this.__widgetChildren) {
        throw new Error("This widget has no children!");
      }

      qx.lang.Array.remove(this.__widgetChildren, child);
      this.__removeHelper(child);
    },


    /**
     * Remove the widget at the specified index.
     *
     * @param index {Integer} Index of the widget to remove.
     * @return {qx.ui.core.LayoutItem} The removed item.
     */
    _removeAt : function(index)
    {
      if (!this.__widgetChildren) {
        throw new Error("This widget has no children!");
      }

      var child = this.__widgetChildren[index];

      qx.lang.Array.removeAt(this.__widgetChildren, index);
      this.__removeHelper(child);

      return child;
    },


    /**
     * Remove all children.
     *
     * @return {Array} An array containing the removed children.
     */
    _removeAll : function()
    {
      if (!this.__widgetChildren) {
        return [];
      }

      // Working on a copy to make it possible to clear the
      // internal array before calling setLayoutParent()
      var children = this.__widgetChildren.concat();
      this.__widgetChildren.length = 0;

      for (var i=children.length-1; i>=0; i--) {
        this.__removeHelper(children[i]);
      }

      qx.ui.core.queue.Layout.add(this);

      return children;
    },




    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING - TEMPLATE METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * This method gets called each time after a child widget was added and can
     * be overridden to get notified about child adds.
     *
     * @signature function(child)
     * @param child {qx.ui.core.LayoutItem} The added child.
     */
    _afterAddChild : null,


    /**
     * This method gets called each time after a child widget was removed and
     * can be overridden to get notified about child removes.
     *
     * @signature function(child)
     * @param child {qx.ui.core.LayoutItem} The removed child.
     */
    _afterRemoveChild : null,




    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING - IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * Convenience function to add a child widget. It will insert the child to
     * the parent widget and schedule a layout update.
     *
     * @param child {LayoutItem} The child to add.
     * @param options {Map|null} Optional layout data for the widget.
     */
    __addHelper : function(child, options)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInstance(child, qx.ui.core.LayoutItem, "Invalid widget to add: " + child);
        this.assertNotIdentical(child, this, "Could not add widget to itself: " + child);

        if (options != null) {
          this.assertType(options, "object", "Invalid layout data: " + options);
        }
      }

      // Remove from old parent
      var parent = child.getLayoutParent();
      if (parent && parent != this) {
        parent._remove(child);
      }

      // Remember parent
      child.setLayoutParent(this);

      // Import options: This call will
      //  - clear the layout's children cache as well and
      //  - add its parent (this widget) to the layout queue
      if (options) {
        child.setLayoutProperties(options);
      } else {
        this.updateLayoutProperties();
      }

      // call the template method
      if (this._afterAddChild) {
        this._afterAddChild(child);
      }
    },


    /**
     * Convenience function to remove a child widget. It will remove it
     * from the parent widget and schedule a layout update.
     *
     * @param child {LayoutItem} The child to remove.
     */
    __removeHelper : function(child)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertNotUndefined(child);
      }

      if (child.getLayoutParent() !== this) {
        throw new Error("Remove Error: " + child + " is not a child of this widget!");
      }

      // Clear parent connection
      child.setLayoutParent(null);

      // clear the layout's children cache
      if (this.__layoutManager) {
        this.__layoutManager.invalidateChildrenCache();
      }

      // Add to layout queue
      qx.ui.core.queue.Layout.add(this);

      // call the template method
      if (this._afterRemoveChild) {
        this._afterRemoveChild(child);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Enables mouse event capturing. All mouse events will dispatched on this
     * widget until capturing is disabled using {@link #releaseCapture} or a
     * mouse button is clicked. If the widgets becomes the capturing widget the
     * {@link #capture} event is fired. Once it looses capture mode the
     * {@link #losecapture} event is fired.
     *
     * @param containerCapture {Boolean?true} If true all events originating in
     *   the container are captured. If false events originating in the container
     *   are not captured.
     */
    capture : function(containerCapture) {
      this.getContainerElement().capture(containerCapture);
    },


    /**
     * Disables mouse capture mode enabled by {@link #capture}.
     */
    releaseCapture : function() {
      this.getContainerElement().releaseCapture();
    },




    /*
    ---------------------------------------------------------------------------
      PADDING SUPPORT
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyPadding : function(value, old, name)
    {
      this._updateInsets = true;
      qx.ui.core.queue.Layout.add(this);
    },




    /*
    ---------------------------------------------------------------------------
      DECORATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the protector element used to block mouse events
     * from the decoration.
     *
     * This is needed because of the way the decorations work. Most
     * of them tend to replace the underlying HTML of a widget
     * dynamically on mouse over. But this also means that the
     * native mouse out is not fired on the new content with which
     * the old content is replaced. This is a fact given through
     * the native behavior of the browser.
     *
     * The protector is placed between the content and the decoration.
     *
     * @return {qx.html.Element} The protector element
     */
    _createProtectorElement : function()
    {
      if (this.__protectorElement) {
        return;
      }

      var protect = this.__protectorElement = new qx.html.Element;

      if (qx.core.Environment.get("qx.debug")) {
        protect.setAttribute("qxType", "protector");
      }

      protect.setStyles(
      {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 7
      });

      var bounds = this.getBounds();
      if (bounds)
      {
        this.__protectorElement.setStyles({
          width : bounds.width + "px",
          height : bounds.height + "px"
        });
      }

      // IE needs some extra love here to convince it to block events.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        protect.setStyles({
          backgroundImage: "url(" + qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif") + ")",
          backgroundRepeat: "repeat"
        });
      }

      this.getContainerElement().add(protect);
    },


    // property apply
    _applyDecorator : function(value, old)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (value && typeof value === "object") {
          if (qx.ui.core.Widget.DEBUG) {
            this.warn("Decorator instances may increase memory usage and " +
              "processing time. Often it is better to lay them out to a " +
              "theme file. Hash code of decorator object: " + value);
          }
        }
      }

      var pool = qx.ui.core.Widget.__decoratorPool;
      var container = this.getContainerElement();

      // Create protector

      // if the browser supports pointer events the decorator will never receive
      // any mouse events so the protector is not required.
      if (!this.__protectorElement && !qx.core.Environment.get("event.pointer")) {
        this._createProtectorElement();
      }

      // Process old value
      if (old)
      {
        container.remove(this.__decoratorElement);
        pool.poolDecorator(this.__decoratorElement);
      }

      // Process new value
      if (value)
      {
        var elem = this.__decoratorElement = pool.getDecoratorElement(value);
        elem.setStyle("zIndex", 5);

        // Add to container
        container.add(elem);
      }
      else
      {
        delete this.__decoratorElement;
      }

      // Apply background color
      this._applyBackgroundColor(this.getBackgroundColor());

      // Apply change
      if (this.__checkInsetsModified(old, value))
      {
        // We have changes to the insets, which means we
        // delegate the resize to the layout system.
        this._updateInsets = true;
        qx.ui.core.queue.Layout.add(this);
      }
      else if (value)
      {
        // When bounds are existing directly resize the decorator
        // otherwise wait for initial resize through layouter
        var bounds = this.getBounds();
        if (bounds)
        {
          elem.resize(bounds.width, bounds.height);

          // Update protector element
          this.__protectorElement && this.__protectorElement.setStyles({
            width : bounds.width + "px",
            height : bounds.height + "px"
          });
        }
      }
    },


    // property apply
    _applyShadow : function(value, old)
    {
      var pool = qx.ui.core.Widget.__shadowPool;
      var container = this.getContainerElement();

      // Clear old value
      if (old)
      {
        container.remove(this.__shadowElement);
        pool.poolDecorator(this.__shadowElement);
      }

      // Apply new value
      if (value)
      {
        var elem = this.__shadowElement = pool.getDecoratorElement(value);

        // Add to container
        container.add(elem);

        // Move out of container by top/left inset
        var insets = elem.getInsets();
        elem.setStyles({
          left: (-insets.left) + "px",
          top: (-insets.top) + "px"
        });

        // Directly update for size when possible
        var bounds = this.getBounds();
        if (bounds)
        {
          var shadowWidth = bounds.width + insets.left + insets.right;
          var shadowHeight = bounds.height + insets.top + insets.bottom;

          // remove the old insets if given
          if (old) {
            var oldInsets = pool.getDecoratorElement(old).getInsets();
            shadowWidth = shadowWidth - oldInsets.left - oldInsets.right;
            shadowHeight = shadowHeight - oldInsets.top - oldInsets.bottom;
          }

          elem.resize(shadowWidth, shadowHeight);
        }

        elem.tint(null);
      }
      else
      {
        delete this.__shadowElement;
      }
    },




    /*
    ---------------------------------------------------------------------------
      OTHER PROPERTIES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyToolTipText : function(value, old)
    {
      if (qx.core.Environment.get("qx.dynlocale"))
      {
        if (this.__toolTipTextListenerId) {
          return;
        }
        var manager = qx.locale.Manager.getInstance();
        this.__toolTipTextListenerId = manager.addListener("changeLocale",
          function() {
            var toolTipText = this.getToolTipText();
            if (toolTipText && toolTipText.translate) {
              this.setToolTipText(toolTipText.translate());
            }
          }
        , this);
      }
    },

    // property apply
    _applyTextColor : function(value, old) {
      // empty template
    },


    // property apply
    _applyZIndex : function(value, old) {
      this.getContainerElement().setStyle("zIndex", value == null ? 0 : value);
    },


    // property apply
    _applyVisibility : function(value, old)
    {
      var container = this.getContainerElement();

      if (value === "visible") {
        container.show();
      } else {
        container.hide();
      }

      // only force a layout update if visibility change from/to "exclude"
      var parent = this.$$parent;
      if (parent && (old == null || value == null || old === "excluded" || value === "excluded")) {
        parent.invalidateLayoutChildren();
      }

      // Update visibility cache
      qx.ui.core.queue.Visibility.add(this);
    },


    // property apply
    _applyOpacity : function(value, old)
    {
      this.getContainerElement().setStyle("opacity", value == 1 ? null : value);

      // Fix for AlphaImageLoader - see Bug #1894 for details
      if ((qx.core.Environment.get("engine.name") == "mshtml") &&
          qx.bom.element.Decoration.isAlphaImageLoaderEnabled())
      {
        // Do not apply this fix on images - see Bug #2748
        if (!qx.Class.isSubClassOf(this.getContentElement().constructor, qx.html.Image))
        {
          // 0.99 is necessary since 1.0 is ignored and not being applied
          var contentElementOpacity = (value == 1 || value == null) ? null : 0.99;
          this.getContentElement().setStyle("opacity", contentElementOpacity);
        }
      }
    },


    // property apply
    _applyCursor : function(value, old)
    {
      if (value == null && !this.isSelectable()) {
        value = "default";
      }

      // In Opera the cursor must be set directly.
      // http://bugzilla.qooxdoo.org/show_bug.cgi?id=1729
      this.getContainerElement().setStyle(
        "cursor", value, qx.core.Environment.get("engine.name") == "opera"
      );
    },


    // property apply
    _applyBackgroundColor : function(value, old)
    {
      var color = this.getBackgroundColor();
      var container = this.getContainerElement();

      if (this.__decoratorElement)
      {
        // Apply to decoration element
        this.__decoratorElement.tint(color);
        container.setStyle("backgroundColor", null);
      }
      else
      {
        // Add color to container
        var resolved = qx.theme.manager.Color.getInstance().resolve(color);
        container.setStyle("backgroundColor", resolved);
      }
    },


    // property apply
    _applyFont : function(value, old) {
      // empty template
    },






    /*
    ---------------------------------------------------------------------------
      STATE HANDLING
    ---------------------------------------------------------------------------
    */

    /** {Map} The current widget states */
    __states : null,


    /** {Boolean} Whether the widget has state changes which are not yet queued */
    $$stateChanges : null,


    /** {Map} Can be overridden to forward states to the child controls. */
    _forwardStates : null,


    /**
     * Returns whether a state is set.
     *
     * @param state {String} the state to check.
     * @return {Boolean} whether the state is set.
     */
    hasState : function(state)
    {
      var states = this.__states;
      return !!states && !!states[state];
    },


    /**
     * Sets a state.
     *
     * @param state {String} The state to add
     * @return {void}
     */
    addState : function(state)
    {
      // Dynamically create state map
      var states = this.__states;
      if (!states) {
        states = this.__states = {};
      }

      if (states[state]) {
        return;
      }

      // Add state and queue
      this.__states[state] = true;

      // Fast path for hovered state
      if (state === "hovered") {
        this.syncAppearance();
      } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
        this.$$stateChanges = true;
      } else {
        qx.ui.core.queue.Appearance.add(this);
      }

      // Forward state change to child controls
      var forward = this._forwardStates;
      var controls = this.__childControls;

      if (forward && forward[state] && controls)
      {
        var control;
        for (var id in controls)
        {
          control = controls[id];
          if (control instanceof qx.ui.core.Widget) {
            controls[id].addState(state);
          }
        }
      }
    },


    /**
     * Clears a state.
     *
     * @param state {String} the state to clear.
     * @return {void}
     */
    removeState : function(state)
    {
      // Check for existing state
      var states = this.__states;
      if (!states || !states[state]) {
        return;
      }

      // Clear state and queue
      delete this.__states[state];

      // Fast path for hovered state
      if (state === "hovered") {
        this.syncAppearance();
      } else if (!qx.ui.core.queue.Visibility.isVisible(this)) {
        this.$$stateChanges = true;
      } else {
        qx.ui.core.queue.Appearance.add(this);
      }

      // Forward state change to child controls
      var forward = this._forwardStates;
      var controls = this.__childControls;

      if (forward && forward[state] && controls)
      {
        for (var id in controls)
        {
          var control = controls[id];
          if (control instanceof qx.ui.core.Widget) {
            control.removeState(state);
          }
        }
      }
    },


    /**
     * Replaces the first state with the second one.
     *
     * This method is ideal for state transitions e.g. normal => selected.
     *
     * @param old {String} Previous state
     * @param value {String} New state
     * @return {void}
     */
    replaceState : function(old, value)
    {
      var states = this.__states;
      if (!states) {
        states = this.__states = {};
      }

      if (!states[value]) {
        states[value] = true;
      }

      if (states[old]) {
        delete states[old];
      }

      if (!qx.ui.core.queue.Visibility.isVisible(this)) {
        this.$$stateChanges = true;
      } else {
        qx.ui.core.queue.Appearance.add(this);
      }

      // Forward state change to child controls
      var forward = this._forwardStates;
      var controls = this.__childControls;

      if (forward && forward[value] && controls)
      {
        for (var id in controls)
        {
          var control = controls[id];
          if (control instanceof qx.ui.core.Widget) {
            control.replaceState(old, value);
          }
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      APPEARANCE SUPPORT
    ---------------------------------------------------------------------------
    */

    /** {String} The currently compiled selector to lookup the matching appearance */
    __appearanceSelector : null,


    /** {Boolean} Whether the selectors needs to be recomputed before updating appearance */
    __updateSelector : null,


    /**
     * Renders the appearance using the current widget states.
     *
     * Used exclusively by {qx.ui.core.queue.Appearance}.
     */
    syncAppearance : function()
    {
      var states = this.__states;
      var selector = this.__appearanceSelector;
      var manager = qx.theme.manager.Appearance.getInstance();

      // Cache deep accessor
      var styler = qx.core.Property.$$method.setThemed;
      var unstyler = qx.core.Property.$$method.resetThemed;

      // Check for requested selector update
      if (this.__updateSelector)
      {
        // Clear flag
        delete this.__updateSelector;

        // Check if the selector was created previously
        if (selector)
        {
          // Query old selector
          var oldData = manager.styleFrom(selector, states, null, this.getAppearance());

          // Clear current selector (to force recompute)
          selector = null;
        }
      }

      // Build selector
      if (!selector)
      {
        var obj = this;
        var id = [];

        do {
          id.push(obj.$$subcontrol||obj.getAppearance());
        } while (obj = obj.$$subparent);

        // Combine parent control IDs, add top level appearance, filter result
        // to not include positioning information anymore (e.g. #3)
        selector = id.reverse().join("/").replace(/#[0-9]+/g, "");
        this.__appearanceSelector = selector;
      }

      // Query current selector
      var newData = manager.styleFrom(selector, states, null, this.getAppearance());
      if (newData)
      {
        if (oldData)
        {
          for (var prop in oldData)
          {
            if (newData[prop] === undefined) {
              this[unstyler[prop]]();
            }
          }
        }

        // Check property availability of new data
        if (qx.core.Environment.get("qx.debug"))
        {
          for (var prop in newData)
          {
            if (!this[styler[prop]]) {
              throw new Error(this.classname +
                ' has no themeable property "' + prop +
                '" while styling ' + selector);
            }
          }
        }

        // Apply new data
        for (var prop in newData) {
          newData[prop] === undefined ? this[unstyler[prop]]() : this[styler[prop]](newData[prop]);
        }
      }
      else if (oldData)
      {
        // Clear old data
        for (var prop in oldData) {
          this[unstyler[prop]]();
        }
      }

      this.fireDataEvent("syncAppearance", this.__states);
    },


    // property apply
    _applyAppearance : function(value, old) {
      this.updateAppearance();
    },


    /**
     * Helper method called from the visibility queue to detect outstanding changes
     * to the appearance.
     *
     * @internal
     */
    checkAppearanceNeeds : function()
    {
      // CASE 1: Widget has never got an appearance already because it was never
      // visible before. Normally add it to the queue is the easiest way to update it.
      if (!this.__initialAppearanceApplied)
      {
        qx.ui.core.queue.Appearance.add(this);
        this.__initialAppearanceApplied = true;
      }

      // CASE 2: Widget has got an appearance before, but was hidden for some time
      // which results into maybe omitted state changes have not been applied.
      // In this case the widget is already queued in the appearance. This is basically
      // what all addState/removeState do, but the queue itself may not have been registered
      // to be flushed
      else if (this.$$stateChanges)
      {
        qx.ui.core.queue.Appearance.add(this);
        delete this.$$stateChanges;
      }
    },


    /**
     * Refreshes the appearance of this widget and all
     * registered child controls.
     */
    updateAppearance : function()
    {
      // Clear selector
      this.__updateSelector = true;

      // Add to appearance queue
      qx.ui.core.queue.Appearance.add(this);

      // Update child controls
      var controls = this.__childControls;
      if (controls)
      {
        var obj;
        for (var id in controls)
        {
          obj = controls[id];

          if (obj instanceof qx.ui.core.Widget) {
            obj.updateAppearance();
          }
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      WIDGET QUEUE
    ---------------------------------------------------------------------------
    */

    /**
     * This method is called during the flush of the
     * {@link qx.ui.core.queue.Widget widget queue}.
     *
     * @param jobs {Map} A map of jobs.
     */
    syncWidget : function(jobs) {
      // empty implementation
    },





    /*
    ---------------------------------------------------------------------------
      EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the next event target in the parent chain. May
     * also return the widget itself if it is not anonymous.
     *
     * @return {qx.ui.core.Widget} A working event target of this widget.
     *    May be <code>null</code> as well.
     */
    getEventTarget : function()
    {
      var target = this;

      while (target.getAnonymous())
      {
        target = target.getLayoutParent();
        if (!target) {
          return null;
        }
      }

      return target;
    },


    /**
     * Returns the next focus target in the parent chain. May
     * also return the widget itself if it is not anonymous and focusable.
     *
     * @return {qx.ui.core.Widget} A working focus target of this widget.
     *    May be <code>null</code> as well.
     */
    getFocusTarget : function()
    {
      var target = this;

      if (!target.getEnabled()) {
        return null;
      }

      while (target.getAnonymous() || !target.getFocusable())
      {
        target = target.getLayoutParent();
        if (!target || !target.getEnabled()) {
          return null;
        }
      }

      return target;
    },


    /**
     * Returns the element which should be focused.
     *
     * @return {qx.html.Element} The html element to focus.
     */
    getFocusElement : function() {
      return this.getContainerElement();
    },


    /**
     * Whether the widget is reachable by pressing the TAB key.
     *
     * Normally tests for both, the focusable property and a positive or
     * undefined tabIndex property. The widget must have a DOM element
     * since only visible widgets are tabable.
     *
     * @return {Boolean} Whether the element is tabable.
     */
    isTabable : function() {
      return (!!this.getContainerElement().getDomElement()) && this.isFocusable();
    },


    // property apply
    _applyFocusable : function(value, old)
    {
      var target = this.getFocusElement();

      // Apply native tabIndex attribute
      if (value)
      {
        var tabIndex = this.getTabIndex();
        if (tabIndex == null) {
          tabIndex = 1;
        }

        target.setAttribute("tabIndex", tabIndex);

        // Omit native dotted outline border
        if (
          (qx.core.Environment.get("engine.name") == "mshtml" &&
           parseFloat(qx.core.Environment.get("engine.version")) < 8) ||
          (qx.core.Environment.get("engine.name") == "mshtml" &&
           qx.core.Environment.get("browser.documentmode") < 8)
        ) {
          target.setAttribute("hideFocus", "true");
        } else {
          target.setStyle("outline", "none");
        }
      }
      else
      {
        if (target.isNativelyFocusable()) {
          target.setAttribute("tabIndex", -1);
        } else if (old) {
          target.setAttribute("tabIndex", null);
        }
      }
    },


    // property apply
    _applyKeepFocus : function(value)
    {
      var target = this.getFocusElement();
      target.setAttribute("qxKeepFocus", value ? "on" : null);
    },


    // property apply
    _applyKeepActive : function(value)
    {
      var target = this.getContainerElement();
      target.setAttribute("qxKeepActive", value ? "on" : null);
    },


    // property apply
    _applyTabIndex : function(value)
    {
      if (value == null) {
        value = 1;
      } else if (value < 1 || value > 32000) {
        throw new Error("TabIndex property must be between 1 and 32000");
      }

      if (this.getFocusable() && value != null) {
        this.getFocusElement().setAttribute("tabIndex", value);
      }
    },


    // property apply
    _applySelectable : function(value, old)
    {
      // Re-apply cursor if not in "initSelectable"
      if (old !== null) {
        this._applyCursor(this.getCursor());
      }

      // Apply qooxdoo attribute
      this.getContentElement().setSelectable(value);
    },


    // property apply
    _applyEnabled : function(value, old)
    {
      if (value===false)
      {
        this.addState("disabled");

        // hovered not configured in widget, but as this is a
        // standardized name in qooxdoo and we never want a hover
        // state for disabled widgets, remove this state everytime
        this.removeState("hovered");

        // Blur when focused
        if (this.isFocusable())
        {
          // Remove focused state
          this.removeState("focused");

          // Remove tabIndex
          this._applyFocusable(false, true);
        }

        // Remove draggable
        if (this.isDraggable()) {
          this._applyDraggable(false, true);
        }

        // Remove droppable
        if (this.isDroppable()) {
          this._applyDroppable(false, true);
        }
      }
      else
      {
        this.removeState("disabled");

        // Re-add tabIndex
        if (this.isFocusable()) {
          this._applyFocusable(true, false);
        }

        // Re-add draggable
        if (this.isDraggable()) {
          this._applyDraggable(true, false);
        }

        // Re-add droppable
        if (this.isDroppable()) {
          this._applyDroppable(true, false);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      CONTEXT MENU
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyNativeContextMenu : function(value, old, name) {
      // empty body to allow overriding
    },


    // property apply
    _applyContextMenu : function(value, old)
    {
      if (old)
      {
        old.removeState("contextmenu");

        if (old.getOpener() == this) {
          old.resetOpener();
        }

        if (!value)
        {
          this.removeListener("contextmenu", this._onContextMenuOpen);
          old.removeListener("changeVisibility", this._onBeforeContextMenuOpen, this);
        }
      }

      if (value)
      {
        value.setOpener(this);
        value.addState("contextmenu");

        if (!old)
        {
          this.addListener("contextmenu", this._onContextMenuOpen);
          value.addListener("changeVisibility", this._onBeforeContextMenuOpen, this);
        }
      }
    },


    /**
     * Event listener for <code>contextmenu</code> event
     *
     * @param e {qx.event.type.Mouse} The event object
     */
    _onContextMenuOpen : function(e)
    {
      this.getContextMenu().openAtMouse(e);

      // Do not show native menu
      // don't open any other contextmenus
      e.stop();
    },


    /**
     * Event listener for <code>beforeContextmenuOpen</code> event
     *
     * @param e {qx.event.type.Data} The data event
     */
    _onBeforeContextMenuOpen : function(e)
    {
      if (e.getData() == "visible" && this.hasListener("beforeContextmenuOpen")) {
        this.fireDataEvent("beforeContextmenuOpen", e);
      }
    },




    /*
    ---------------------------------------------------------------------------
      USEFUL COMMON EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener which stops a bubbling event from
     * propagates further.
     *
     * @param e {qx.event.type.Event} Any bubbling event
     */
    _onStopEvent : function(e) {
      e.stopPropagation();
    },





    /*
    ---------------------------------------------------------------------------
      DRAG & DROP SUPPORT
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyDraggable : function(value, old)
    {
      if (!this.isEnabled() && value === true) {
        value = false;
      }

      // Force cursor creation
      qx.ui.core.DragDropCursor.getInstance();

      // Process listeners
      if (value)
      {
        this.addListener("dragstart", this._onDragStart);
        this.addListener("drag", this._onDrag);
        this.addListener("dragend", this._onDragEnd);
        this.addListener("dragchange", this._onDragChange);
      }
      else
      {
        this.removeListener("dragstart", this._onDragStart);
        this.removeListener("drag", this._onDrag);
        this.removeListener("dragend", this._onDragEnd);
        this.removeListener("dragchange", this._onDragChange);
      }

      // Sync DOM attribute
      this.getContainerElement().setAttribute("qxDraggable", value ? "on" : null);
    },


    // property apply
    _applyDroppable : function(value, old)
    {
      if (!this.isEnabled() && value === true) {
        value = false;
      }

      // Sync DOM attribute
      this.getContainerElement().setAttribute("qxDroppable", value ? "on" : null);
    },


    /**
     * Event listener for own <code>dragstart</code> event.
     *
     * @param e {qx.event.type.Drag} Drag event
     */
    _onDragStart : function(e)
    {
      qx.ui.core.DragDropCursor.getInstance().placeToMouse(e);
      this.getApplicationRoot().setGlobalCursor("default");
    },


    /**
     * Event listener for own <code>dragmove</code> event.
     *
     * @param e {qx.event.type.Drag} Drag event
     */
    _onDrag : function(e) {
      qx.ui.core.DragDropCursor.getInstance().placeToMouse(e);
    },


    /**
     * Event listener for own <code>dragend</code> event.
     *
     * @param e {qx.event.type.Drag} Drag event
     */
    _onDragEnd : function(e)
    {
      qx.ui.core.DragDropCursor.getInstance().moveTo(-1000, -1000);
      this.getApplicationRoot().resetGlobalCursor();
    },


    /**
     * Event listener for own <code>dragchange</code> event.
     *
     * @param e {qx.event.type.Drag} Drag event
     */
    _onDragChange : function(e)
    {
      var cursor = qx.ui.core.DragDropCursor.getInstance();
      var action = e.getCurrentAction();
      action ? cursor.setAction(action) : cursor.resetAction();
    },






    /*
    ---------------------------------------------------------------------------
      VISUALIZE FOCUS STATES
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler which is executed when the widget receives the focus.
     *
     * This method is used by the {@link qx.ui.core.FocusHandler} to
     * apply states etc. to a focused widget.
     *
     * @internal
     * @return {void}
     */
    visualizeFocus : function() {
      this.addState("focused");
    },


    /**
     * Event handler which is executed when the widget lost the focus.
     *
     * This method is used by the {@link qx.ui.core.FocusHandler} to
     * remove states etc. from a previously focused widget.
     *
     * @internal
     * @return {void}
     */
    visualizeBlur : function() {
      this.removeState("focused");
    },






    /*
    ---------------------------------------------------------------------------
      SCROLL CHILD INTO VIEW
    ---------------------------------------------------------------------------
    */

    /**
     * The method scrolls the given item into view.
     *
     * @param child {qx.ui.core.Widget} Child to scroll into view
     * @param alignX {String?null} Alignment of the item. Allowed values:
     *   <code>left</code> or <code>right</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param alignY {String?null} Alignment of the item. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param direct {Boolean?true} Whether the execution should be made
     *   directly when possible
     */
    scrollChildIntoView : function(child, alignX, alignY, direct)
    {
      // Scroll directly on default
      direct = typeof direct == "undefined" ? true : direct;

      // Always lazy scroll when either
      // - the child
      // - its layout parent
      // - its siblings
      // have layout changes scheduled.
      //
      // This is to make sure that the scroll position is computed
      // after layout changes have been applied to the DOM. Note that changes
      // scheduled for the grand parent (and up) are not tracked and need to
      // be signalled manually.
      var Layout = qx.ui.core.queue.Layout;
      var parent;

      // Child
      if (direct) {
        direct = !Layout.isScheduled(child);
        parent = child.getLayoutParent();

        // Parent
        if (direct && parent) {
          direct = !Layout.isScheduled(parent);

          // Siblings
          if (direct) {
            parent.getChildren().forEach(function(sibling) {
              direct = direct && !Layout.isScheduled(sibling);
            });
          }
        }
      }

      this.scrollChildIntoViewX(child, alignX, direct);
      this.scrollChildIntoViewY(child, alignY, direct);
    },


    /**
     * The method scrolls the given item into view (x-axis only).
     *
     * @param child {qx.ui.core.Widget} Child to scroll into view
     * @param align {String?null} Alignment of the item. Allowed values:
     *   <code>left</code> or <code>right</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param direct {Boolean?true} Whether the execution should be made
     *   directly when possible
     */
    scrollChildIntoViewX : function(child, align, direct) {
      this.getContentElement().scrollChildIntoViewX(child.getContainerElement(), align, direct);
    },


    /**
     * The method scrolls the given item into view (y-axis only).
     *
     * @param child {qx.ui.core.Widget} Child to scroll into view
     * @param align {String?null} Alignment of the element. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param direct {Boolean?true} Whether the execution should be made
     *   directly when possible
     */
    scrollChildIntoViewY : function(child, align, direct) {
      this.getContentElement().scrollChildIntoViewY(child.getContainerElement(), align, direct);
    },





    /*
    ---------------------------------------------------------------------------
      FOCUS SYSTEM USER ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Focus this widget.
     *
     * @return {void}
     */
    focus : function()
    {
      if (this.isFocusable()) {
        this.getFocusElement().focus();
      } else {
        throw new Error("Widget is not focusable!");
      }
    },


    /**
     * Remove focus from this widget.
     *
     * @return {void}
     */
    blur : function()
    {
      if (this.isFocusable()) {
        this.getFocusElement().blur();
      } else {
        throw new Error("Widget is not focusable!");
      }
    },


    /**
     * Activate this widget e.g. for keyboard events.
     *
     * @return {void}
     */
    activate : function() {
      this.getContainerElement().activate();
    },


    /**
     * Deactivate this widget e.g. for keyboard events.
     *
     * @return {void}
     */
    deactivate : function() {
      this.getContainerElement().deactivate();
    },


    /**
     * Focus this widget when using the keyboard. This is
     * mainly thought for the advanced qooxdoo keyboard handling
     * and should not be used by the application developer.
     *
     * @internal
     * @return {void}
     */
    tabFocus : function() {
      this.getFocusElement().focus();
    },





    /*
    ---------------------------------------------------------------------------
      CHILD CONTROL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the given ID is assigned to a child control.
     *
     * @param id {String} ID of the child control
     * @return {Boolean} <code>true</code> when the child control is registered.
     */
    hasChildControl : function(id)
    {
      if (!this.__childControls) {
        return false;
      }

      return !!this.__childControls[id];
    },


    /** {Map} Map of instantiated child controls */
    __childControls : null,


    /**
     * Returns a map of all already created child controls
     *
     * @return {Map} mapping of child control id to the child widget.
     */
    _getCreatedChildControls : function() {
      return this.__childControls;
    },


    /**
     * Returns the child control from the given ID. Returns
     * <code>null</code> when the child control is unknown.
     *
     * It is designed for widget authors, who want to access child controls,
     * which are created by the widget itself.
     *
     * <b>Warning</b>: This method exposes widget internals and modifying the
     * returned sub widget may bring the widget into an inconsistent state.
     * Accessing child controls defined in a super class or in an foreign class
     * is not supported. Do not use it if the result can be achieved using public
     * API or theming.
     *
     * @param id {String} ID of the child control
     * @param notcreate {Boolean?false} Whether the child control
     *    should not be created dynamically if not yet available.
     * @return {qx.ui.core.Widget} Child control
     */
    getChildControl : function(id, notcreate)
    {
      if (!this.__childControls)
      {
        if (notcreate) {
          return null;
        }

        this.__childControls = {};
      }

      var control = this.__childControls[id];
      if (control) {
        return control;
      }

      if (notcreate === true) {
        return null;
      }

      return this._createChildControl(id);
    },


    /**
     * Shows the given child control by ID
     *
     * @param id {String} ID of the child control
     * @return {qx.ui.core.Widget} the child control
     */
    _showChildControl : function(id)
    {
      var control = this.getChildControl(id);
      control.show();
      return control;
    },


    /**
     * Excludes the given child control by ID
     *
     * @param id {String} ID of the child control
     */
    _excludeChildControl : function(id)
    {
      var control = this.getChildControl(id, true);
      if (control) {
        control.exclude();
      }
    },


    /**
     * Whether the given child control is visible.
     *
     * @param id {String} ID of the child control
     * @return {Boolean} <code>true</code> when the child control is visible.
     */
    _isChildControlVisible : function(id)
    {
      var control = this.getChildControl(id, true);
      if (control) {
        return control.isVisible();
      }

      return false;
    },


    /**
     * Force the creation of the given child control by ID.
     *
     * Do not override this method! Override {@link #_createChildControlImpl}
     * instead if you need to support new controls.
     *
     * @param id {String} ID of the child control
     * @return {qx.ui.core.Widget} The created control
     * @throws when the control was created before
     */
    _createChildControl : function(id)
    {
      if (!this.__childControls) {
        this.__childControls = {};
      } else if (this.__childControls[id]) {
        throw new Error("Child control '" + id + "' already created!");
      }

      var pos = id.indexOf("#");
      if (pos == -1) {
        var control = this._createChildControlImpl(id);
      } else {
        var control = this._createChildControlImpl(
          id.substring(0, pos), id.substring(pos + 1, id.length)
        );
      }

      if (!control) {
        throw new Error("Unsupported control: " + id);
      }

      // Establish connection to parent
      control.$$subcontrol = id;
      control.$$subparent = this;

      // Support for state forwarding
      var states = this.__states;
      var forward = this._forwardStates;

      if (states && forward && control instanceof qx.ui.core.Widget)
      {
        for (var state in states)
        {
          if (forward[state]) {
            control.addState(state);
          }
        }
      }

      this.fireDataEvent("createChildControl", control);

      // Register control and return
      return this.__childControls[id] = control;
    },


    /**
     * Internal method to create child controls. This method
     * should be overwritten by classes which extends this one
     * to support new child control types.
     *
     * @param id {String} ID of the child control. If a # is used, the id is
     *   the part infront of the #.
     * @param hash {String?undefined} If a child control name contains a #,
     *   all text following the # will be the hash argument.
     * @return {qx.ui.core.Widget} The created control or <code>null</code>
     */
    _createChildControlImpl : function(id, hash) {
      return null;
    },


    /**
     * Dispose all registered controls. This is automatically
     * executed by the widget.
     *
     * @return {void}
     */
    _disposeChildControls : function()
    {
      var controls = this.__childControls;
      if (!controls) {
        return;
      }

      var Widget = qx.ui.core.Widget;

      for (var id in controls)
      {
        var control = controls[id];
        if (!Widget.contains(this, control)) {
          control.destroy();
        } else {
          control.dispose();
        }
      }

      delete this.__childControls;
    },


    /**
     * Finds and returns the top level control. This is the first
     * widget which is not a child control of any other widget.
     *
     * @return {qx.ui.core.Widget} The top control
     */
    _findTopControl : function()
    {
      var obj = this;
      while (obj)
      {
        if (!obj.$$subparent) {
          return obj;
        }

        obj = obj.$$subparent;
      }

      return null;
    },




    /*
    ---------------------------------------------------------------------------
      LOWER LEVEL ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the location of the container element in context of the document dimensions.
     *
     * Supported modes:
     *
     * * <code>margin</code>: Calculate from the margin box of the element
     *   (bigger than the visual appearance: including margins of given element)
     * * <code>box</code>: Calculates the offset box of the element
     *   (default, uses the same size as visible)
     * * <code>border</code>: Calculate the border box
     *   (useful to align to border edges of two elements).
     * * <code>scroll</code>: Calculate the scroll box
     *   (relevant for absolute positioned content).
     * * <code>padding</code>: Calculate the padding box
     *   (relevant for static/relative positioned content).
     *
     * @param mode {String?box} A supported option. See comment above.
     * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the element relative to the document.
     */
    getContainerLocation : function(mode)
    {
      var domEl = this.getContainerElement().getDomElement();
      return domEl ? qx.bom.element.Location.get(domEl, mode) : null;
    },


    /**
     * Computes the location of the content element in context of the document
     * dimensions.
     *
     * Supported modes:
     *
     * * <code>margin</code>: Calculate from the margin box of the element
     *   (bigger than the visual appearance: including margins of given element)
     * * <code>box</code>: Calculates the offset box of the element (default,
     *   uses the same size as visible)
     * * <code>border</code>: Calculate the border box (useful to align to
     *   border edges of two elements).
     * * <code>scroll</code>: Calculate the scroll box (relevant for absolute
     *   positioned content).
     * * <code>padding</code>: Calculate the padding box (relevant for
     *   static/relative positioned content).
     *
     * @param mode {String?box} A supported option. See comment above.
     * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
     *   <code>right</code> and <code>bottom</code> which contains the distance
     *   of the element relative to the document.
     */
    getContentLocation : function(mode)
    {
      var domEl = this.getContentElement().getDomElement();
      return domEl ? qx.bom.element.Location.get(domEl, mode) : null;
    },


    /**
     * Directly modifies the relative left position in relation
     * to the parent element.
     *
     * Use with caution! This may be used for animations, drag&drop
     * or other cases where high performance location manipulation
     * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
     *
     * @param value {Integer} Left position
     * @return {void}
     */
    setDomLeft : function(value)
    {
      var domEl = this.getContainerElement().getDomElement();
      if (domEl) {
        domEl.style.left = value + "px";
      } else {
        throw new Error("DOM element is not yet created!");
      }
    },


    /**
     * Directly modifies the relative top position in relation
     * to the parent element.
     *
     * Use with caution! This may be used for animations, drag&drop
     * or other cases where high performance location manipulation
     * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
     *
     * @param value {Integer} Top position
     * @return {void}
     */
    setDomTop : function(value)
    {
      var domEl = this.getContainerElement().getDomElement();
      if (domEl) {
        domEl.style.top = value + "px";
      } else {
        throw new Error("DOM element is not yet created!");
      }
    },


    /**
     * Directly modifies the relative left and top position in relation
     * to the parent element.
     *
     * Use with caution! This may be used for animations, drag&drop
     * or other cases where high performance location manipulation
     * is important. Otherwise please use {@link qx.ui.core.LayoutItem#setUserBounds} instead.
     *
     * @param left {Integer} Left position
     * @param top {Integer} Top position
     * @return {void}
     */
    setDomPosition : function(left, top)
    {
      var domEl = this.getContainerElement().getDomElement();
      if (domEl)
      {
        domEl.style.left = left + "px";
        domEl.style.top = top + "px";
      }
      else
      {
        throw new Error("DOM element is not yet created!");
      }
    },




    /*
    ---------------------------------------------------------------------------
      ENHANCED DISPOSE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Removes this widget from its parent and disposes it.
     *
     * Please note that the widget is not disposed synchronously. The
     * real dispose happens after the next queue flush.
     *
     * @return {void}
     */
    destroy : function()
    {
      if (this.$$disposed) {
        return;
      }

      var parent = this.$$parent;
      if (parent) {
        parent._remove(this);
      }

      qx.ui.core.queue.Dispose.add(this);
    },





    /*
    ---------------------------------------------------------------------------
      CLONE SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    clone : function()
    {
      var clone = this.base(arguments);

      if (this.getChildren)
      {
        var children = this.getChildren();
        for (var i=0, l=children.length; i<l; i++) {
          clone.add(children[i].clone());
        }
      }

      return clone;
    }

  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Some dispose stuff is not needed in global shutdown, otherwise
    // it just slows down things a bit, so do not do them.
    if (!qx.core.ObjectRegistry.inShutDown)
    {
      if (qx.core.Environment.get("qx.dynlocale"))
      {
        if (this.__toolTipTextListenerId)
        {
          qx.locale.Manager.getInstance().removeListenerById(
            this.__toolTipTextListenerId
          );
        }
      }

      // Remove widget pointer from DOM
      this.getContainerElement().setAttribute("$$widget", null, true);

      // Clean up all child controls
      this._disposeChildControls();

      // Remove from ui queues
      qx.ui.core.queue.Appearance.remove(this);
      qx.ui.core.queue.Layout.remove(this);
      qx.ui.core.queue.Visibility.remove(this);
      qx.ui.core.queue.Widget.remove(this);
    }

    if (this.getContextMenu()) {
      this.setContextMenu(null);
    }

    // pool decorators if not in global shutdown
    if (!qx.core.ObjectRegistry.inShutDown)
    {
      var clazz = qx.ui.core.Widget;
      var container = this.getContainerElement();

      if (this.__decoratorElement)
      {
        container.remove(this.__decoratorElement);
        clazz.__decoratorPool.poolDecorator(this.__decoratorElement);
      }

      if (this.__shadowElement)
      {
        container.remove(this.__shadowElement);
        clazz.__shadowPool.poolDecorator(this.__shadowElement);
      }

      this.clearSeparators();
      this.__decoratorElement = this.__shadowElement = this.__separators = null;
    }
    else
    {
      this._disposeArray("__separators");
      this._disposeObjects(
        "__decoratorElement",
        "__shadowElement"
      );
    }

    // Clear children array
    this._disposeArray("__widgetChildren");


    // Cleanup map of appearance states
    this.__states = this.__childControls = null;


    // Dispose layout manager and HTML elements
    this._disposeObjects(
      "__layoutManager",
      "__containerElement",
      "__contentElement",
      "__protectorElement"
    );
  }
});
