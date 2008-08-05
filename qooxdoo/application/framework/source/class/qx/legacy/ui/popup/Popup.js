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

************************************************************************ */

/* ************************************************************************

#optional(qx.legacy.ui.menu.Manager)

************************************************************************ */

/**
 * @appearance popup
 */
qx.Class.define("qx.legacy.ui.popup.Popup",
{
  extend : qx.legacy.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setZIndex(this._minZIndex);

    // Init Focus Handler
    if (this._isFocusRoot) {
      this.activateFocusRoot();
    }

    this.initHeight();
    this.initWidth();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "popup"
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    },


    /**
     * Make element displayed (if switched to true the widget will be created, if needed, too).
     *  Instead of qx.legacy.ui.core.Widget, the default is false here.
     */
    display :
    {
      refine : true,
      init : false
    },




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


    /** Center the popup on open */
    centered :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether the popup should be restricted to the visible area of the page when opened.
     */
    restrictToPageOnOpen :
    {
      check : "Boolean",
      init : true
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
    }

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _showTimeStamp : (new Date(0)).valueOf(),
    _hideTimeStamp : (new Date(0)).valueOf(),

    /*
    ---------------------------------------------------------------------------
      APPEAR/DISAPPEAR
    ---------------------------------------------------------------------------
    */

    /**
     * Callback for "beforeAppear" event.<br/>
     * Moves the popup out of the visible area to ensure the popup widget is
     * displayed in the boundaries of the document. This mechnism jumps in when
     * {@link #restrictToPageOnOpen} is set to <code>true</code> (default).<br/>
     * Additionally the popup widget is registered at the popup manager and the
     * method {@link #bringToFront} is called.
     *
     * @return {void}
     */
    _beforeAppear : function()
    {
      this.base(arguments);

      if (this.getRestrictToPageOnOpen())
      {
        this._wantedLeft = this.getLeft();

        if (this._wantedLeft != null)
        {
          // Move the popup out of the view so its size could be calculated before
          // it is positioned.
          this.setLeft(10000);

          if (this.getElement() != null)
          {
            // The popup was already visible once before
            // -> Move it immediately before it gets visible again
            this.getElement().style.left = 10000;
          }
        }
      }

      qx.legacy.ui.popup.PopupManager.getInstance().add(this);
      qx.legacy.ui.popup.PopupManager.getInstance().update(this);

      this._showTimeStamp = (new Date).valueOf();
      this.bringToFront();
    },


    /**
     * Callback method for the "beforeDisappear" event.<br/>
     * The popup widget gets deregistered from the popup manager.
     *
     * @return {void}
     */
    _beforeDisappear : function()
    {
      this.base(arguments);

      qx.legacy.ui.popup.PopupManager.getInstance().remove(this);

      this._hideTimeStamp = (new Date).valueOf();
    },


    /**
     * Callback method for the "afterAppear" event.<br/>
     * If the property {@link #restrictToPageOnOpen} is set to <code>true</code>
     * the popup gets repositioned to get displayed within the boundaries of the
     * client document.
     *
     * @return {void}
     */
    _afterAppear : function()
    {
      this.base(arguments);

      if (this.getRestrictToPageOnOpen())
      {
        var doc = qx.legacy.ui.core.ClientDocument.getInstance();
        var docWidth = doc.getClientWidth();
        var docHeight = doc.getClientHeight();

        var scrollTop = qx.bom.Viewport.getScrollTop();
        var scrollLeft = qx.bom.Viewport.getScrollLeft();

        var restrictToPageLeft = this.getRestrictToPageLeft() + scrollLeft;
        var restrictToPageRight = this.getRestrictToPageRight() - scrollLeft;
        var restrictToPageTop = this.getRestrictToPageTop() + scrollTop;
        var restrictToPageBottom = this.getRestrictToPageBottom() - scrollTop;

        var left = (this._wantedLeft == null) ? this.getLeft() : this._wantedLeft;
        var top = this.getTop();
        var width = this.getBoxWidth();
        var height = this.getBoxHeight();

        var oldLeft = this.getLeft();
        var oldTop = top;

        // NOTE: We check right and bottom first, because top and left should have
        //       priority, when both sides are violated.
        if (left + width > docWidth - restrictToPageRight) {
          left = docWidth - restrictToPageRight - width;
        }

        if (top + height > docHeight - restrictToPageBottom) {
          top = docHeight - restrictToPageBottom - height;
        }

        if (left < restrictToPageLeft) {
          left = restrictToPageLeft;
        }

        if (top < restrictToPageTop) {
          top = restrictToPageTop;
        }

        if (left != oldLeft || top != oldTop)
        {
          var self = this;

          window.setTimeout(function()
          {
            self.setLeft(left);
            self.setTop(top);
          },
          0);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      ACTIVE/INACTIVE
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the popup widget as active child
     *
     * @return {void}
     */
    _makeActive : function() {
      this.getFocusRoot().setActiveChild(this);
    },


    /**
     * Give back the focus control to the focus root.
     *
     * @return {void}
     */
    _makeInactive : function()
    {
      var vRoot = this.getFocusRoot();
      var vCurrent = vRoot.getActiveChild();

      if (vCurrent == this) {
        vRoot.setActiveChild(vRoot);
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
     * @return {void}
     */
    _sendTo : function()
    {
      var vPopups = qx.lang.Object.getValues(qx.legacy.ui.popup.PopupManager.getInstance().getAll());

      if (qx.Class.isDefined("qx.legacy.ui.menu.Manager"))
      {
        var vMenus = qx.lang.Object.getValues(qx.legacy.ui.menu.Manager.getInstance().getAll());
        var vAll = vPopups.concat(vMenus).sort(qx.legacy.util.Compare.byZIndex);
      }
      else
      {
        var vAll = vPopups.sort(qx.legacy.util.Compare.byZIndex);
      }

      var vLength = vAll.length;
      var vIndex = this._minZIndex;

      for (var i=0; i<vLength; i++) {
        vAll[i].setZIndex(vIndex++);
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
     * @return {Number} Timestamp
     */
    getShowTimeStamp : function() {
      return this._showTimeStamp;
    },


    /**
     * Utility method to get the current showTimeStamp
     *
     * @return {Number} Timestamp
     */
    getHideTimeStamp : function() {
      return this._hideTimeStamp;
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Positions the popup relative to some reference element.
     *
     * @param el {Element|qx.legacy.ui.core.Widget} Reference DOM element/widget.
     * @param offsetX {Integer ? 0} Offset in pixels in X direction (optional).
     * @param offsetY {Integer ? 0} Offset in pixels in Y direction (optional).
     */
    positionRelativeTo : function(el, offsetX, offsetY)
    {
      if (el instanceof qx.legacy.ui.core.Widget) {
        el = el.getElement();
      }

      if (el)
      {
       var elementPos = qx.bom.element.Location.get(el);
       this.setLocation(
         elementPos.left + (offsetX || 0),
         elementPos.top + (offsetY || 0)
       );
      }
      else
      {
        this.warn('Missing reference element');
      }
    },


    /**
     * Centers the popup using the coordinates of the {@link qx.legacy.ui.core.ClientDocument}.
     * This method does only work if the Popup has already been rendered, so it
     * is best to call it in the {@link qx.legacy.ui.core.Widget#appear} event.
     *
     */
    centerToBrowser : function()
    {
      var d = qx.legacy.ui.core.ClientDocument.getInstance();

      var left = (d.getClientWidth() - this.getBoxWidth()) / 2;
      var top = (d.getClientHeight() - this.getBoxHeight()) / 2;

      this.setLeft(left < 0 ? 0 : left);
      this.setTop(top < 0 ? 0 : top);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    qx.legacy.ui.popup.PopupManager.getInstance().remove(this);

    this._disposeFields("_showTimeStamp", "_hideTimeStamp");
  }
});
