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
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Popups are widgets, which can be placed on top of the application.
 * They are automatically added to the root {@link qx.application.AbstractGui#getRoot}
 * widget.
 *
 * Popups are used to display menus, the lists of combo boxes, tooltips, ...
 *
 * @appearance popup
 */
qx.Class.define("qx.ui.popup.Popup",
{
  extend : qx.ui.container.Composite,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(layout)
  {
    this.base(arguments, layout);

    // Excluded by default
    this.exclude();

    // Automatically add to application's root
    qx.core.Init.getApplication().getRoot().add(this);

    // Resize listener
    this.addListener("resize", this._onResizeOrMove);
    this.addListener("move", this._onResizeOrMove);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "popup"
    },


    /**
     * Whether to let the system decide when to hide the popup. Setting
     * this to false gives you better control but it also requires you
     * to handle the closing of the popup.
     */
    autoHide :
    {
      check : "Boolean",
      init : true
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyVisibility : function(value, old)
    {
      this.base(arguments, value, old);

      var mgr = qx.ui.popup.PopupManager.getInstance();
      if (value === "visible")
      {
        mgr.add(this);
        this.bringToFront();
      }
      else
      {
        mgr.remove(this);
      }
    },





    /*
    ---------------------------------------------------------------------------
      ZINDEX SUPPORT
    ---------------------------------------------------------------------------
    */

    _minZIndex : 1e6,


    /**
     * Sets the {@link #zIndex} to Infinity and calls the
     * method {@link #_sendTo}
     *
     * @type member
     * @return {void}
     */
    bringToFront : function()
    {
      this.setZIndex(this._minZIndex+1000000);
      this._sendTo();
    },


    /**
     * Sets the {@link #zIndex} to -Infinity and calls the
     * method {@link #_sendTo}
     *
     * @type member
     * @return {void}
     */
    sendToBack : function()
    {
      this.setZIndex(this._minZIndex+1);
      this._sendTo();
    },


    /**
     * Resets the zIndex of all registered popups and menus
     * (getting the instances via the {@link qx.ui.popup.PopupManager} and
     * the {@link qx.ui.menu.Manager}) one higher than the defined minimum zIndex.
     *
     * @type member
     * @return {void}
     */
    _sendTo : function()
    {
      var popups = qx.ui.popup.PopupManager.getInstance().getAll();

      var all = popups.sort(function(a, b) {
        return a.getZIndex() - b.getZIndex()
      });

      var index = this._minZIndex;

      for (var i=0, l=all.length; i<l; i++) {
        all[i].setZIndex(index++);
      }
    },




    /*
    ---------------------------------------------------------------------------
      USER API
    ---------------------------------------------------------------------------
    */

    /**
     * Set the popup's position relative to its parent
     *
     * @param left {Integer} The left position
     * @param top {Integer} The top position
     */
    moveTo : function(left, top)
    {
      this.setLayoutProperties({
        left : left,
        top : top
      });
    },





    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for resize or move events of this widget.
     *
     * @param e {qx.event.type.Data} Resize or Move data event
     */
    _onResizeOrMove : function(e)
    {
      var bounds = this.getBounds();

      // Normalize coordinates
      var left = this._normalizeLeft(bounds.left);
      var top = this._normalizeTop(bounds.top);

      // Detect changes and apply them
      if (left != bounds.left || top != bounds.top) {
        this.setLayoutProperties({ left: left, top: top });
      }
    },






    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Normalizes a left coordinate to move the popup completely into the viewport.
     *
     * @param left {Integer} Original left position
     * @return {Integer} Corrected left position
     */
    _normalizeLeft : function(left)
    {
      var bounds = this.getBounds();
      var parentBounds = this.getLayoutParent().getBounds();

      if (!bounds || !parentBounds) {
        return left;
      }

      if (bounds.left < 0) {
        return 0;
      } else if ((bounds.left + bounds.width) > parentBounds.width) {
        return Math.max(0, parentBounds.width - bounds.width);
      }

      return left;
    },


    /**
     * Normalizes a top coordinate to move the popup completely into the viewport.
     *
     * @param top {Integer} Original top position
     * @return {Integer} Corrected top position
     */
    _normalizeTop : function(top)
    {
      var bounds = this.getBounds();
      var parentBounds = this.getLayoutParent().getBounds();

      if (!bounds || !parentBounds) {
        return top;
      }

      if (bounds.top < 0) {
        return 0;
      } else if ((bounds.top + bounds.height) > parentBounds.height) {
        return Math.max(0, parentBounds.height - bounds.height);
      }

      return top;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    qx.ui.popup.PopupManager.getInstance().remove(this);
  }
});