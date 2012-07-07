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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#ignore(qx.ui.root.Page)
*/

/**
 * This class blocks events and can be included into all widgets.
 *
 * The {@link #block} and {@link #unblock} methods provided by this class can be used
 * to block any event from the widget. When blocked,
 * the blocker widget overlays the widget to block, including the padding area.
 *
 * The second set of methods ({@link #blockContent}, {@link #unblockContent})
 * can be used to block child widgets with a zIndex below a certain value.
 */
qx.Class.define("qx.ui.core.Blocker",
{
  extend : qx.core.Object,


  events :
  {
    /**
     * Fires after {@link #block} or {@link #blockContent} executed.
     */
    blocked : "qx.event.type.Event",


    /**
     * Fires after {@link #unblock} or {@link #unblockContent} executed.
     */
    unblocked : "qx.event.type.Event"
  },


  /**
   * Creates a blocker for the passed widget.
   *
   * @param widget {qx.ui.core.Widget} Widget which should be added the blocker
   */
  construct: function(widget)
  {
    this.base(arguments);
    this._widget = widget;

    this._isPageRoot = (
      qx.Class.isDefined("qx.ui.root.Page") &&
      widget instanceof qx.ui.root.Page
    );

    if (this._isPageRoot) {
      widget.addListener("resize", this.__onResize, this);
    }

    if (qx.Class.isDefined("qx.ui.root.Application") &&
        widget instanceof qx.ui.root.Application) {
      this.setKeepBlockerActive(true);
    }

    this.__activeElements = [];
    this.__focusElements = [];
    this.__contentBlockerCount = [];
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Color of the blocker
     */
    color  :
    {
      check : "Color",
      init : null,
      nullable: true,
      apply : "_applyColor",
      themeable: true
    },


    /**
     * Opacity of the blocker
     */
    opacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyOpacity",
      themeable: true
    },


    /**
     * If this property is enabled, the blocker created with {@link #block}
     * will always stay activated. This means that the blocker then gets all keyboard
     * events, this is useful to block keyboard input on other widgets.
     * Take care that only one blocker instance will be kept active, otherwise your
     * browser will freeze.
     */
    keepBlockerActive :
    {
      check : "Boolean",
      init : false
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __blocker : null,
    __blockerCount : 0,
    __contentBlocker : null,
    __contentBlockerCount : null,

    __activeElements  : null,
    __focusElements   : null,

    __oldAnonymous : null,

    __timer : null,

    _isPageRoot : false,
    _widget : null,


    /**
     * Adjust html element size on layout resizes.
     *
     * @param e {qx.event.type.Data} event object
     */
    __onResize : function(e)
    {
      var data = e.getData();

      if (this.isContentBlocked())
      {
        this.getContentBlockerElement().setStyles({
          width: data.width,
          height: data.height
        });
      }
      if (this.isBlocked())
      {
        this.getBlockerElement().setStyles({
          width: data.width,
          height: data.height
        });
      }
    },


    // property apply
    _applyColor : function(value, old)
    {
      var color = qx.theme.manager.Color.getInstance().resolve(value);
      this.__setBlockersStyle("backgroundColor", color);
    },


    // property apply
    _applyOpacity : function(value, old)
    {
      this.__setBlockersStyle("opacity", value);
    },


    /**
     * Set the style to all blockers (blocker and content blocker).
     *
     * @param key {String} The name of the style attribute.
     * @param value {String} The value.
     */
    __setBlockersStyle : function(key, value)
    {
      var blockers = [];
      this.__blocker && blockers.push(this.__blocker);
      this.__contentBlocker && blockers.push(this.__contentBlocker);

      for (var i = 0; i < blockers.length; i++) {
        blockers[i].setStyle(key, value);
      }
    },


    /**
     * Backup the current active and focused widget.
     */
    _backupActiveWidget : function()
    {
      var focusHandler = qx.event.Registration.getManager(window).getHandler(qx.event.handler.Focus);

      this.__activeElements.push(focusHandler.getActive());
      this.__focusElements.push(focusHandler.getFocus());

      if (this._widget.isFocusable()) {
        this._widget.focus();
      }
    },


    /**
     * Restore the current active and focused widget.
     */
    _restoreActiveWidget : function()
    {
      var activeElementsLength = this.__activeElements.length;
      if (activeElementsLength > 0)
      {
        var widget = this.__activeElements[activeElementsLength - 1];

        if (widget) {
          qx.bom.Element.activate(widget);
        }

        this.__activeElements.pop();
      }

      var focusElementsLength = this.__focusElements.length;

      if (focusElementsLength > 0)
      {
        var widget = this.__focusElements[focusElementsLength - 1];

        if (widget) {
          qx.bom.Element.focus(this.__focusElements[focusElementsLength - 1]);
        }

        this.__focusElements.pop();
      }
    },


    /**
     * Creates the blocker element.
     *
     * @return {qx.html.Element} The blocker element
     */
    __createBlockerElement : function() {
      return new qx.html.Blocker(this.getColor(), this.getOpacity());
    },


    /**
     * Get/create the blocker element
     *
     * @return {qx.html.Element} The blocker element
     */
    getBlockerElement : function()
    {
      if (!this.__blocker)
      {
        this.__blocker = this.__createBlockerElement();
        this.__blocker.setStyle("zIndex", 15);
        this._widget.getContainerElement().add(this.__blocker);
        this.__blocker.exclude();
      }
      return this.__blocker;
    },


    /**
     * Block all events from this widget by placing a transparent overlay widget,
     * which receives all events, exactly over the widget.
     */
    block : function()
    {
      this.__blockerCount++;
      if (this.__blockerCount < 2)
      {
        this._backupActiveWidget();

        var blocker = this.getBlockerElement();
        blocker.include();
        blocker.activate();

        blocker.addListener("deactivate", this.__activateBlockerElement, this);
        blocker.addListener("keypress", this.__stopTabEvent, this);
        blocker.addListener("keydown", this.__stopTabEvent, this);
        blocker.addListener("keyup", this.__stopTabEvent, this);

        this.fireEvent("blocked", qx.event.type.Event);
      }
    },


    /**
     * Returns whether the widget is blocked.
     *
     * @return {Boolean} Whether the widget is blocked.
     */
    isBlocked : function() {
      return this.__blockerCount > 0;
    },


    /**
     * Unblock the widget blocked by {@link #block}, but it takes care of
     * the amount of {@link #block} calls. The blocker is only removed if
     * the numer of {@link #unblock} calls is identical to {@link #block} calls.
     */
    unblock : function()
    {
      if (!this.isBlocked()){
        return;
      }

      this.__blockerCount--;
      if (this.__blockerCount < 1) {
        this.__unblock();
        this.__blockerCount = 0;
      }
    },


    /**
     * Unblock the widget blocked by {@link #block}, but it doesn't take care of
     * the amount of {@link #block} calls. The blocker is directly removed.
     */
    forceUnblock : function()
    {
      if (!this.isBlocked()){
        return;
      }

      this.__blockerCount = 0;
      this.__unblock();
    },


    /**
     * Unblock the widget blocked by {@link #block}.
     */
    __unblock : function()
    {
      this._restoreActiveWidget();

      var blocker = this.getBlockerElement();
      blocker.removeListener("deactivate", this.__activateBlockerElement, this);
      blocker.removeListener("keypress", this.__stopTabEvent, this);
      blocker.removeListener("keydown", this.__stopTabEvent, this);
      blocker.removeListener("keyup", this.__stopTabEvent, this);
      blocker.exclude();

      this.fireEvent("unblocked", qx.event.type.Event);
    },


    /**
     * Get/create the content blocker element
     *
     * @return {qx.html.Element} The blocker element
     */
    getContentBlockerElement : function()
    {
      if (!this.__contentBlocker)
      {
        this.__contentBlocker = this.__createBlockerElement();
        this._widget.getContentElement().add(this.__contentBlocker);
        this.__contentBlocker.exclude();
      }
      return this.__contentBlocker;
    },


    /**
     * Block direct child widgets with a zIndex below <code>zIndex</code>
     *
     * @param zIndex {zIndex} All child widgets with a zIndex below this value
     *     will be blocked
     */
    blockContent : function(zIndex)
    {
      var blocker = this.getContentBlockerElement();
      blocker.setStyle("zIndex", zIndex);

      this.__contentBlockerCount.push(zIndex);
      if (this.__contentBlockerCount.length < 2)
      {
        blocker.include();

        if (this._isPageRoot)
        {
          // to block interaction we need to cover the HTML page with a div as well.
          // we do so by placing a div parallel to the page root with a slightly
          // lower zIndex and keep the size of this div in sync with the body
          // size.
          if (!this.__timer)
          {
            this.__timer = new qx.event.Timer(300);
            this.__timer.addListener("interval", this.__syncBlocker, this);
          }
          this.__timer.start();
          this.__syncBlocker();
        }
        this.fireEvent("blocked", qx.event.type.Event);
      }
    },


    /**
     * Whether the content is blocked
     *
     * @return {Boolean} Whether the content is blocked
     */
    isContentBlocked : function() {
      return this.__contentBlockerCount.length > 0;
    },


    /**
     * Unblock the content blocked by {@link #blockContent}, but it takes care of
     * the amount of {@link #blockContent} calls. The blocker is only removed if
     * the numer of {@link #unblockContent} calls is identical to
     * {@link #blockContent} calls.
     */
    unblockContent : function()
    {
      if (!this.isContentBlocked()) {
        return;
      }

      this.__contentBlockerCount.pop();
      var zIndex = this.__contentBlockerCount[this.__contentBlockerCount.length - 1];
      var contentBlocker = this.getContentBlockerElement();
      contentBlocker.setStyle("zIndex", zIndex);

      if (this.__contentBlockerCount.length < 1) {
        this.__unblockContent();
        this.__contentBlockerCount = [];
      }
    },


    /**
     * Unblock the content blocked by {@link #blockContent}, but it doesn't take
     * care of the amount of {@link #blockContent} calls. The blocker is
     * directly removed.
     */
    forceUnblockContent : function()
    {
      if (!this.isContentBlocked()) {
        return;
      }

      this.__contentBlockerCount = [];
      var contentBlocker = this.getContentBlockerElement();
      contentBlocker.setStyle("zIndex", null);

      this.__unblockContent();
    },


    /**
     * Unblock the content blocked by {@link #blockContent}.
     */
    __unblockContent : function()
    {
     this.getContentBlockerElement().exclude();

      if (this._isPageRoot) {
        this.__timer.stop();
      }
      this.fireEvent("unblocked", qx.event.type.Event);
    },


    /**
     * Synchronize the size of the background blocker with the size of the
     * body element
     */
    __syncBlocker : function()
    {
      var containerEl = this._widget.getContainerElement().getDomElement();
      var doc = qx.dom.Node.getDocument(containerEl);

      this.getContentBlockerElement().setStyles({
        height: doc.documentElement.scrollHeight + "px",
        width: doc.documentElement.scrollWidth + "px"
      });
    },


    /**
     * Stops the passed "Tab" event.
     *
     * @param e {qx.event.type.KeySequence} event to stop.
     */
    __stopTabEvent : function(e) {
      if (e.getKeyIdentifier() == "Tab") {
        e.stop();
      }
    },


    /**
     * Sets the blocker element to avtive.
     */
    __activateBlockerElement : function() {
      if (this.getKeepBlockerActive()) {
        this.getBlockerElement().activate();
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this._isPageRoot) {
      this._widget.removeListener("resize", this.__onResize, this);
    }
    this._disposeObjects("__contentBlocker", "__blocker", "__timer");
    this.__oldAnonymous = this.__activeElements = this.__focusElements =
      this._widget = this.__contentBlockerCount = null;
  }
});