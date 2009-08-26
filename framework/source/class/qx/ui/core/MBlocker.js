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

/**
 * This mixin blocks events and can be included into all widgets.
 *
 * The {@link #block} and {@link #unblock} methods provided by this mixin can be used
 * to block any event from the widget. When blocked,
 * the blocker widget overlays the widget to block, including the padding area.
 *
 * The second set of methods ({@link #blockContent}, {@link #unblockContent})
 * can be used to block child widgets with a zIndex below a certain value.
 */
qx.Mixin.define("qx.ui.core.MBlocker",
{
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
    blockerColor  :
    {
      check : "Color",
      init : null,
      nullable: true,
      apply : "_applyBlockerColor",
      themeable: true
    },


    /**
     * Opacity of the blocker
     */
    blockerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyBlockerOpacity",
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

    __oldAnonymous : null,
    __anonymousCounter : 0,

    // property apply
    _applyBlockerColor : function(value, old)
    {
      var color = qx.theme.manager.Color.getInstance().resolve(value);

      this.__blocker && this.__blocker.setBlockerColor(color);
      this.__contentBlocker && this.__contentBlocker.setBlockerColor(color);
    },


    // property apply
    _applyBlockerOpacity : function(value, old)
    {
      this.__blocker && this.__blocker.setBlockerOpacity(value);
      this.__contentBlocker && this.__contentBlocker.setBlockerOpacity(value);
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
        this.__oldAnonymous = this.getAnonymous();
        this.setAnonymous(true);
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
        this.setAnonymous(this.__oldAnonymous);
      }
    },
    
    
    /**
     * Creates the blocker element.
     *
     * @return {qx.html.Element} The blocker element
     */
    __createBlockerElement : function() {
      return new qx.html.Blocker(this.getBlockerColor(), this.getBlockerOpacity());
    },


    /**
     * Get/create the blocker element
     *
     * @return {qx.html.Element} The blocker element
     */
    _getBlocker : function()
    {
      if (!this.__blocker)
      {
        this.__blocker = this.__createBlockerElement();
        this.__blocker.setBlockerZIndex(15);
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
      this._getBlocker().block(this.getContainerElement().getDomElement());

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
      this._getBlocker().unblock();
    },


    /**
     * Get/create the content blocker element
     *
     * @return {qx.html.Element} The blocker element
     */
    _getContentBlocker : function()
    {
      if (!this.__contentBlocker) {
        this.__contentBlocker = this.__createBlockerElement();
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
      var blocker = this._getContentBlocker();
      blocker.setBlockerZIndex(zIndex);

      if (this.__isContentBlocked) {
        return;
      }
      this.__isContentBlocked = true;

      blocker.block(this.getContentElement().getDomElement());
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

      this._getContentBlocker().unblock();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__contentBlocker");
  }
});