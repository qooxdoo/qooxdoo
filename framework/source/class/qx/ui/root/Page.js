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

/**
 * This widget provides a root widget for popups and tooltips if qooxdoo is used
 * inside a traditional HTML page. Widgets placed into a page will overlay the
 * HTML content.
 *
 * For this reason the widget's layout is initialized with an instance of
 * {@link qx.ui.layout.Basic}. The widget's layout cannot be changed.
 *
 * Note: This widget does not support decorations!
 *
 * If you want to place widgets inside existing DOM elements
 * use {@link qx.ui.root.Inline}.
 */
qx.Class.define("qx.ui.root.Page",
{
  extend : qx.ui.root.Abstract,





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param doc {Document} Document to use
   */
  construct : function(doc)
  {
    // Temporary storage of element to use
    this._doc = doc;

    this.base(arguments);

    // Use a hard-coded basic layout
    this._setLayout(new qx.ui.layout.Basic());

    // Set a high zIndex to make sure the widgets really overlay the HTML page.
    this.setZIndex(10000);

    // Directly add to layout queue
    qx.ui.core.queue.Layout.add(this);

    // Register resize listener
    this.addListener("resize", this.__onResize, this);

    // Register as root
    qx.ui.core.FocusHandler.getInstance().connectTo(this);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createContainerElement : function()
    {
      var elem = this._doc.createElement("div");
      this._doc.body.appendChild(elem);

      var root = new qx.html.Root(elem);
      root.setStyle("position", "absolute");

      return root;
    },


    // overridden
    _createContentElement : function()
    {
      // we do not want overflow=hidden for the page root
      return new qx.html.Element("div");
    },


    // overridden
    _computeSizeHint : function()
    {
      var width = qx.bom.Document.getWidth(this._window);
      var height = qx.bom.Document.getHeight(this._window);

      return {
        minWidth : width,
        width : width,
        maxWidth : width,
        minHeight : height,
        height : height,
        maxHeight : height
      };
    },


    /**
     * Adjust html element size on layout resizes.
     *
     * @param e {qx.event.type.Data} event object
     */
    __onResize : function(e)
    {
      var data = e.getData();

      // set the size to 0 so make the content element invisible
      // this works because the content element has overflow "show"
      this.getContainerElement().setStyles({
        width: 0,
        height: 0
      });
      this.getContentElement().setStyles({
        width: 0,
        height: 0
      });

      // adjust the size of the blocker
      if (this.isContentBlocked())
      {
        this._getContentBlocker().setStyles({
          width: data.width,
          height: data.height
        });
      }
      if (this.isBlocked())
      {
        this._getBlocker().setStyles({
          width: data.width,
          height: data.height
        });
      }
    },


    /**
     * Synchronize the size of the background blocker with the size of the
     * body element
     */
    __syncBlocker : function()
    {
      var body = this._doc.body;

      this._getContentBlocker().setStyles({
        height: body.offsetHeight + "px",
        width: body.offsetWidth + "px"
      });
    },


    /**
     * Whether the configured layout supports a maximized window
     * e.g. is a Canvas.
     *
     * @return {Boolean} Whether the layout supports maximized windows
     */
    supportsMaximize : function() {
      return false;
    },


    /**
     * Remove the content blocker.
     */
    unblockContent : function()
    {
      if (!this.isContentBlocked()) {
        return;
      }

      this.base(arguments);
      this.__timer.stop();
    },


    /**
     * Block direct child widgets with a zIndex below <code>zIndex</code>
     *
     * @param zIndex {zIndex} All child widgets with a zIndex below this value
     *     will be blocked
     */
    blockContent : function(zIndex)
    {
      if (this.isContentBlocked()) {
        this.base(arguments, zIndex);
        return;
      }

      this.base(arguments, zIndex);

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




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_doc");
  }
});
