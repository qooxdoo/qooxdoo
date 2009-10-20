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
#optional(qx.ui.root.Page)
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
    
    this.__activeElements = [];
    this.__focusElements = [];
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
    __isBlocked : null,
    __contentBlocker : null,
    __isContentBlocked : null,

    __activeElements  : null,
    __focusElements   : null,
    
    __oldAnonymous : null,
    __anonymousCounter : 0,

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
     * Remember current value and make widget anonymous. This prevents
     * "capturing events".
     */
    _saveAndSetAnonymousState : function()
    {
      this.__anonymousCounter += 1;
      if (this.__anonymousCounter == 1)
      {
        this.__oldAnonymous = this._widget.getAnonymous();
        this._widget.setAnonymous(true);
      }
    },


    /**
     * Reset the value of the anonymous property to its previous state. Each call
     * to this method must have a matching call to {@link #_saveAndSetAnonymousState}.
     */
    _restoreAnonymousState : function()
    {
      this.__anonymousCounter -= 1;
      if (this.__anonymousCounter == 0) {
        this._widget.setAnonymous(this.__oldAnonymous);
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
     * @deprecated Use 'getBlockerElement' instead. (for 0.9)
     *
     * @return {qx.html.Element} The blocker element
     */
    _getBlocker : function()
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use 'getBlockerElement' instead.");
      
      return this.getBlockerElement();
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
      if (this.__isBlocked) {
        return;
      }
      this.__isBlocked = true;

      // overlay the blocker widget
      // this prevents bubbling events
      this.getBlockerElement().include();
      this._backupActiveWidget();

      this._saveAndSetAnonymousState();
    },


    /**
     * Returns whether the widget is blocked.
     *
     * @return {Boolean} Whether the widget is blocked.
     */
    isBlocked : function() {
      return !!this.__isBlocked;
    },


    /**
     * Unblock the widget blocked by {@link #block}
     */
    unblock : function()
    {
      if (!this.__isBlocked) {
        return;
      }
      this.__isBlocked = false;

      this._restoreAnonymousState();
      this._restoreActiveWidget();
      
      this.getBlockerElement().exclude();
    },


    /**
     * Get/create the content blocker element
     * 
     * @deprecated Use 'getContentBlockerElement' instead. (for 0.9)
     *
     * @return {qx.html.Element} The content blocker element
     */
    _getContentBlocker : function()
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use 'getContentBlockerElement' instead.");
      
      return this.getContentBlockerElement();
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

      if (this.__isContentBlocked) {
        return;
      }
      this.__isContentBlocked = true;

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
    },


    /**
     * Whether the content is blocked
     *
     * @return {Boolean} Whether the content is blocked
     */
    isContentBlocked : function() {
      return !!this.__isContentBlocked;
    },


    /**
     * Remove the content blocker.
     */
    unblockContent : function()
    {
      if (!this.__isContentBlocked) {
        return;
      }
      this.__isContentBlocked = false;

      this.getContentBlockerElement().exclude();

      if (this._isPageRoot) {
        this.__timer.stop();
      }
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
    this._disposeFields("__oldAnonymous", "__activeElements", "__focusElements", "_widget");
  }
});