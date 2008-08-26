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
     * Color of the blocker
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
    __oldAnonymous : null,
    __contentBlocker : null,
    __isContentBlocked : null,


    // property apply
    _applyBlockerColor : function(value, old)
    {
      var blockers = [];
      this.__blocker && blockers.push(this.__blocker);
      this.__contentBlocker && blockers.push(this.__contentBlocker);

      for (var i=0; i<blockers.length; i++) {
        blockers[i].setStyle("backgroundColor", qx.theme.manager.Color.getInstance().resolve(value));
      }
    },


    // property apply
    _applyBlockerOpacity : function(value, old)
    {
      var blockers = [];
      this.__blocker && blockers.push(this.__blocker);
      this.__contentBlocker && blockers.push(this.__contentBlocker);

      for (var i=0; i<blockers.length; i++) {
        blockers[i].setStyle("opacity", value);
      }
    },


    /**
     * Creates the blocker element.
     *
     * @return {qx.html.Element} The blocker element
     */
    __createBlockerElement : function()
    {
       var blocker = new qx.html.Element().setStyles({
        position: "absolute",
        width: "100%",
        height: "100%",
        opacity : this.getBlockerOpacity(),
        backgroundColor : qx.theme.manager.Color.getInstance().resolve(this.getBlockerColor())
      });
      return blocker;
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
        this.getContentElement().add(this.__blocker);
        this.__blocker.exclude();
      }
      return this.__blocker;
    },


    /**
     * Block all event from this widget by placing a transparent overlay widget,
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
      this._getBlocker().include();

      // remember old value and set make widget anonymous. This prevents
      // "capturing events"
      this.__oldAnonymous = this.getAnonymous();
      this.setAnonymous(true);
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

      this.setAnonymous(this.__oldAnonymous);
      this._getBlocker().exclude();
    },


    /**
     * Get/create the content blocker element
     *
     * @return {qx.html.Element} The blocker element
     */
    _getContentBlocker : function()
    {
      if (!this.__contentBlocker)
      {
        this.__contentBlocker = this.__createBlockerElement();
        this.getContentElement().add(this.__contentBlocker);
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
      var blocker = this._getContentBlocker();
      blocker.setStyle("zIndex", zIndex);

      if (this.__isContentBlocked) {
        return;
      }
      this.__isContentBlocked = true;

      blocker.include();
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

      this._getContentBlocker().exclude();
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