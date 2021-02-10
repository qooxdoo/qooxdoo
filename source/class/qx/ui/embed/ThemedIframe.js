/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Container widget for internal frames (iframes) with qooxdoo scroll bar and
 * size hint support.
 *
 * An iframe can display any HTML page inside the widget. Note that custom
 * scroll bars do only work if the iframe's source points to the same domain
 * as the application.
 *
 * @childControl iframe {qx.ui.embed.Iframe} embedded iframe component
 * @childControl scrollbar-x {qx.ui.core.scroll.ScrollBar} horizontal scrollbar
 * @childControl scrollbar-y {qx.ui.core.scroll.ScrollBar} vertical scrollbar
 * @childControl corner {qx.ui.core.Widget} corner widget where no scrollbar is shown
 *
 * *Example*
 *
 * Here is a little example of how to use the widget:
 *
 * <pre class='javascript'>
 * var document = this.getRoot();
 * var iframe = new qx.ui.embed.ThemedIframe("frame.html");
 * document.add(iframe);
 * </pre>
 *
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/docs/#desktop/widget/themediframe.md' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
qx.Class.define("qx.ui.embed.ThemedIframe",
{
  extend : qx.ui.embed.AbstractIframe,
  include : qx.ui.core.scroll.MRoll,

  construct : function(source)
  {
    this.base(arguments, source);

    // Create 'fixed' grid layout
    var grid = new qx.ui.layout.Grid();
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(0, 1);
    this._setLayout(grid);

    this._showChildControl("iframe");
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "scrollarea"
    },

    /**
     * The policy, when the horizontal scrollbar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scrollbar on demand</li>
     *   <li><b>on</b>: Always show the scrollbar</li>
     *   <li><b>off</b>: Never show the scrollbar</li>
     * </ul>
     */
    scrollbarX :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      themeable : true,
      apply : "_updateScrollbars"
    },


    /**
     * The policy, when the horizontal scrollbar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scrollbar on demand</li>
     *   <li><b>on</b>: Always show the scrollbar</li>
     *   <li><b>off</b>: Never show the scrollbar</li>
     * </ul>
     */
    scrollbarY :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      themeable : true,
      apply : "_updateScrollbars"
    },


    /**
     * Group property, to set the overflow of both scroll bars.
     */
    scrollbar : {
      group : [ "scrollbarX", "scrollbarY" ]
    }
  },


  members :
  {
    __iframeSize : null,
    __iframeObserverId : null,


    // overridden
    _getIframeElement : function() {
      return this.getChildControl("iframe").getContentElement();
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "iframe":
          control = new qx.ui.embed.Iframe(this.getSource());
          control.addListener("load", this._onIframeLoad, this);
          control.addListener("resize", this._onIframeResize, this);
          this._add(control, {row: 0, column: 0});
          break;


        case "scrollbar-x":
          control = new qx.ui.core.scroll.ScrollBar("horizontal");
          control.setMinWidth(0);

          control.exclude();
          control.addListener("scroll", this._onScrollBarX, this);

          this._add(control, {row: 1, column: 0});
          break;


        case "scrollbar-y":
          control = new qx.ui.core.scroll.ScrollBar("vertical");
          control.setMinHeight(0);

          control.exclude();
          control.addListener("scroll", this._onScrollBarY, this);

          this._add(control, {row: 0, column: 1});
          break;


        case "corner":
          control = new qx.ui.core.Widget();
          control.setWidth(0);
          control.setHeight(0);
          control.exclude();

          this._add(control, {row: 1, column: 1});
          break;
      }

      return control || this.base(arguments, id);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the iframe's load event
     */
    _onIframeLoad : function()
    {
      this._disableScollbars();

      var body = this._getIframeElement().getBody();
      if (body) {
        this._startIframeObserver();
        this._addRollListener();
      }

      this.fireEvent("load");
    },


    /**
     * Event handler for resize event of the iframe widget.
     */
    _onIframeResize : function() {
      this._updateScrollbars();
    },


    /**
     * Hide all scrollbars and stop observing the iframe document
     */
    _disableScollbars : function()
    {
      this._excludeChildControl("scrollbar-x");
      this._excludeChildControl("scrollbar-y");
      this._excludeChildControl("corner");

      this._stopIframeObserver();
    },


    /**
     * Attach roll listener to the iframe
     */
    _addRollListener : function()
    {
      try
      {
        var body = this._getIframeElement().getBody();
        qx.bom.Element.addListener(body, "roll", this._onRoll, this);
        qx.bom.Element.addListener(body, "pointerdown", this._onPointerDownForRoll, this);
      } catch (e) {
        this._disableScollbars();
      }
    },


    /**
     * Start observing size changes of the iframe document
     */
    _startIframeObserver : function()
    {
      if (this.__iframeObserverId) {
        this._stopIframeObserver();
      }

      var idle = qx.event.Idle.getInstance();
      this.__iframeObserverId = idle.addListener("interval", this._onIframeObserverInterval, this);
    },


    /**
     * Stop observing size changes of the iframe document
     */
    _stopIframeObserver : function()
    {
      this.__iframeSize = null;

      if (!this.__iframeObserverId) {
        return;
      }

      var idle = qx.event.Idle.getInstance();
      idle.removeListenerById(this.__iframeObserverId);
    },


    /**
     * Event handler, which is called periodically to update the scroll bars
     */
    _onIframeObserverInterval : function()
    {
      var iframeSize = this._getIframeSize();
      if (!iframeSize)
      {
        this._disableScollbars();
        return;
      }

      if (
        this.__iframeSize &&
        iframeSize.width == this.__iframeSize.width &&
        iframeSize.height == this.__iframeSize.height
      ) {
        return;
      }

      this.__iframeSize = iframeSize;
      this._preventIframeScrolling();
      this._updateScrollbars();
    },


    /**
     * Try to hide native scrollbars in the iframe
     */
    _preventIframeScrolling : function()
    {
      try
      {
        var win = this._getIframeElement().getWindow();
        var doc = this._getIframeElement().getDocument();
        if (qx.bom.Document.isStandardMode(win)) {
          doc.documentElement.style.overflow = "hidden";
        } else {
          doc.body.style.overflow = "hidden";
        }
      } catch (e) {
        this._disableScollbars();
      }
    },


    /**
     * Recompute scrollbar visibility and positions based on the iframe's
     * document size
     */
    _updateScrollbars : function()
    {
      var iframeSize = this.__iframeSize;
      var paneSize = this.getChildControl("iframe").getBounds();
      var innerSize = this.getChildControl("iframe").getInnerSize();

      if (!iframeSize || !innerSize || !innerSize) {
        return;
      }

      var showX = false;
      var showY = false;

      var scrollbarX = this.getScrollbarX();
      var scrollbarY = this.getScrollbarY();

      if (scrollbarX === "auto" && scrollbarY === "auto")
      {
        // Check if the container is big enough to show
        // the full content.
        var showX = iframeSize.width > innerSize.width;
        var showY = iframeSize.height > innerSize.height;

        // Dependency check
        // We need a special intelligence here when only one
        // of the autosized axis requires a scrollbar
        // This scrollbar may then influence the need
        // for the other one as well.
        if ((showX || showY) && !(showX && showY))
        {
          if (showX) {
            showY = iframeSize.height > paneSize.height;
          } else if (showY) {
            showX = iframeSize.width > paneSize.width;
          }
        }
      }
      else
      {
        var showX = scrollbarX === "on";
        var showY = scrollbarY === "on";

        // Check auto values afterwards with already
        // corrected client dimensions
        if (iframeSize.width > (showX ? paneSize.width : innerSize.width) && scrollbarX === "auto") {
          showX = true;
        }

        if (iframeSize.height > (showX ? paneSize.height : innerSize.height) && scrollbarY === "auto") {
          showY = true;
        }
      }

      this._configureScrollbar(
        "scrollbar-x", showX,
        innerSize.width, iframeSize.width
      );
      this._configureScrollbar(
        "scrollbar-y", showY,
        innerSize.height, iframeSize.height
      );

      this._updateCornerWidget();
    },


    /**
     * Compute the size of the iframe body
     *
     * @return {Object|null} A map with the body size or <code>null</code>.
     */
    _getIframeSize : function()
    {
      try
      {
        var win = this._getIframeElement().getWindow();
        var frameSize = {
          width: qx.bom.Document.getWidth(win),
          height: qx.bom.Document.getHeight(win)
        };
        return frameSize;
      }
      catch (e)
      {
        return null;
      }
    },


    /**
     * Update visibility of the corner widget based on the visibility of the
     * scrollbars
     */
    _updateCornerWidget : function()
    {
      if (
        this._isChildControlVisible("scrollbar-x") &&
        this._isChildControlVisible("scrollbar-y")
      ) {
        this._showChildControl("corner");
      } else {
        this._excludeChildControl("corner");
      }
    },


    /**
     * Configures the given scrollbar
     *
     * @param scrollbarId {String} child control id of the scrollbar to
     *   configure
     * @param show {Boolean} whether the scrollbar should be visible
     * @param containerSize {Integer} size of the container widget
     * @param contentSize {Integer} size of the iframe's document
     */
    _configureScrollbar : function(scrollbarId, show, containerSize, contentSize)
    {
      if (!show)
      {
        this._excludeChildControl(scrollbarId);
        return;
      }

      var bar = this._showChildControl(scrollbarId);
      if (containerSize >= contentSize)
      {
        bar.set({
          position: 0,
          maximum: contentSize,
          knobFactor: 1,
          enabled: false
        });
      }
      else
      {
        bar.setMaximum(1000000);
        bar.set({
          position: Math.min(bar.getPosition(), contentSize),
          maximum: contentSize - containerSize,
          knobFactor: containerSize / contentSize,
          enabled: true
        });
      }
    },


    /**
     * Event handler for the scroll event of the horizontal scrollbar
     *
     * @param e {qx.event.type.Data} The scroll event object
     */
    _onScrollBarX : function(e) {
      this.scrollToX(e.getData());
    },


    /**
     * Event handler for the scroll event of the vertical scrollbar
     *
     * @param e {qx.event.type.Data} The scroll event object
     */
    _onScrollBarY : function(e) {
      this.scrollToY(e.getData());
    },


    /**
     * Scrolls the iframe's content to the given left coordinate
     *
     * @param x {Integer} The vertical position to scroll to.
     */
    scrollToX : function(x)
    {
      try
      {
        var win = this._getIframeElement().getWindow();
        win.scroll(x, qx.bom.Viewport.getScrollTop(win));
      } catch (e) {
        this._disableScollbars();
      }
    },


    /**
     * Scrolls the iframe's content to the given top coordinate
     *
     * @param y {Integer} The horizontal position to scroll to.
     */
    scrollToY : function(y)
    {
      try
      {
        var win = this._getIframeElement().getWindow();
        win.scroll(qx.bom.Viewport.getScrollLeft(win), y);
      } catch (e) {
        this._disableScollbars();
      }
    }
  },


  destruct : function()
  {
    this._stopIframeObserver();
    this.__iframeSize = null;
  }
});
