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
    this.hide();

    var root = qx.core.Init.getApplication().getRoot();
    root.add(this);

    this.addListener("changeVisibility", this._onChangeVisibility, this);
    this.initRestrictToPageOnOpen();
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether to let the system decide when to hide the popup. Setting
     *  this to false gives you better control but it also requires you
     *  to handle the closing of the popup.
     */
    autoHide :
    {
      check : "Boolean",
      init : true
    },


    /**
     * Whether the popup should be restricted to the visible area of the page when opened.
     */
    restrictToPageOnOpen :
    {
      check : "Boolean",
      init : true,
      apply : "_applyRestrictToPageOnOpen"
    },

    /**
     * The minimum offset to the left of the page too keep when
     * {@link #restrictToPageOnOpen} is true (in pixels).
     */
    restrictToPageLeft :
    {
      check : "Integer",
      init : 0
    },


    /**
     * The minimum offset to the right of the page too keep when
     * {@link #restrictToPageOnOpen} is true (in pixels).
     */
    restrictToPageRight :
    {
      check : "Integer",
      init : 0
    },


    /**
     * The minimum offset to the top of the page too keep when
     * {@link #restrictToPageOnOpen} is true (in pixels).
     */
    restrictToPageTop :
    {
      check : "Integer",
      init : 0
    },


    /**
     * The minimum offset to the bottom of the page too keep when
     * {@link #restrictToPageOnOpen} is true (in pixels).
     */
    restrictToPageBottom :
    {
      check : "Integer",
      init : 0
    },


    // overridden
    appearance :
    {
      refine : true,
      init : "popup"
    }
  },


  members :
  {
    __showTimeStamp : (new Date(0)).valueOf(),
    __hideTimeStamp : (new Date(0)).valueOf(),


    /**
     * Event handler for the "visibility" property changes
     *
     * @param e {qx.event.type.Change} change event
     */
    _onChangeVisibility : function(e)
    {
      var isVisible = e.getValue() == "visible";

      if (isVisible)
      {
        if (this.getRestrictToPageOnOpen()) {
          this._correctPosition();
        }

        qx.ui.popup.PopupManager.getInstance().add(this);
        qx.ui.popup.PopupManager.getInstance().update(this);

        this.__showTimeStamp = (new Date).valueOf();
        this.bringToFront();
      }
      else
      {
        qx.ui.popup.PopupManager.getInstance().remove(this);
        this.__hideTimeStamp = (new Date).valueOf();
      }
    },


    // property apply
    _applyRestrictToPageOnOpen : function(value, old)
    {
      if (value) {
        this.addListener("appear", this._correctPosition, this);
      } else {
        this.removeListener("appear", this._correctPosition, this);
      }
    },


    /**
     * This methods corrects the popup's position if {@link restrictToPageOnOpen}
     * is set to <code>true</code> and the popup is outside of the viewport.
     */
    _correctPosition : function()
    {
      var clientWidth = qx.bom.Viewport.getWidth();
      var clientHeight = qx.bom.Viewport.getHeight();
      var scrollTop = qx.bom.Viewport.getScrollTop();
      var scrollLeft = qx.bom.Viewport.getScrollLeft();

      var restrictToPageLeft = this.getRestrictToPageLeft() + scrollLeft;
      var restrictToPageRight = this.getRestrictToPageRight() - scrollLeft;
      var restrictToPageTop = this.getRestrictToPageTop() + scrollTop;
      var restrictToPageBottom = this.getRestrictToPageBottom() - scrollTop;

      var bounds = this.getBounds();
      var left = bounds.left;
      var top = bounds.top;
      var width = bounds.width;
      var height = bounds.height;

      // NOTE: We check right and bottom first, because top and left should have
      //       priority, when both sides are violated.
      if (left + width > clientWidth - restrictToPageRight) {
        left = clientWidth - restrictToPageRight - width;
      }

      if (top + height > clientHeight - restrictToPageBottom) {
        top = clientHeight - restrictToPageBottom - height;
      }

      if (left < restrictToPageLeft) {
        left = restrictToPageLeft;
      }

      if (top < restrictToPageTop) {
        top = restrictToPageTop;
      }

      if (left != bounds.left || top != bounds.top) {
        this.setLocation(left, top);
      }
    },


    /*
    ---------------------------------------------------------------------------
      ZIndex Positioning
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
     * (getting the instances via the {@link qx.legacy.ui.popup.PopupManager} and
     * the {@link qx.legacy.ui.menu.Manager}) one higher than the defined minimum zIndex.
     *
     * @type member
     * @return {void}
     */
    _sendTo : function()
    {
      var popups = qx.lang.Object.getValues(qx.ui.popup.PopupManager.getInstance().getAll());

      var all = popups.sort(function(a, b) { return a.getZIndex() - b.getZIndex() });

      var index = this._minZIndex;

      for (var i=0, l=all.length; i<l; i++) {
        all[i].setZIndex(index++);
      }
    },


    /*
    ---------------------------------------------------------------------------
      TIMESTAMP HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Utility method to get the current showTimeStamp
     *
     * @type member
     * @return {Number} Timestamp
     */
    getShowTimeStamp : function() {
      return this.__showTimeStamp;
    },


    /**
     * Utility method to get the current showTimeStamp
     *
     * @type member
     * @return {Number} Timestamp
     */
    getHideTimeStamp : function() {
      return this.__hideTimeStamp;
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Positions the popup at the guvenpage location
     *
     * @param left {Integer} The popup's left location
     * @param top {Integer} The popup's top location
     */
    setLocation : function(left, top)
    {
      this.setLayoutProperties({
        left: left,
        top: top
      });
    },


    /**
     * Positions the popup relative to a reference. The reference can be either
     * a widget or a DOM element.
     *
     * @type member
     * @param reference {qx.ui.core.Widget|Element} Reference DOM element/widget.
     * @param offsetX {Integer ? 0} Offset in pixels in X direction (optional).
     * @param offsetY {Integer ? 0} Offset in pixels in Y direction (optional).
     */
    positionRelativeTo : function(reference, offsetX, offsetY)
    {
      var el = reference;

      if (reference instanceof qx.ui.core.Widget)
      {
        el = reference.getContainerElement().getDomElement();

        // if the widget has not yet been rendered, wait for the resize event
        // and try again
        if (!el)
        {
          this.addListenerOnce("resize", this.positionRelativeTo, this);
          return;
        }
      }

      var elementPos = qx.bom.element.Location.get(el);
      this.setLocation(
        elementPos.left + (offsetX || 0),
        elementPos.top + (offsetY || 0)
      );
    },


    /**
     * Centeres the popup in the browser window.
     *
     * @type member
     */
    centerToBrowser : function()
    {
      var size = this.getSizeHint();

      var clientWidth = qx.bom.Viewport.getWidth();
      var clientHeight = qx.bom.Viewport.getHeight();

      var left = (clientWidth - size.width) / 2;
      var top = (clientHeight - size.height) / 2;

      this.setLocation(left, top);
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    qx.ui.popup.PopupManager.getInstance().remove(this);

    this._disposeFields("__showTimeStamp", "__hideTimeStamp");
  }
});