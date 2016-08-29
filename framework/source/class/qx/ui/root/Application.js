/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This is the root widget for qooxdoo applications with an
 * "application" like behaviour. The widget will span the whole viewport
 * and the document body will have no scrollbars.
 *
 * The root widget does not support paddings and decorators with insets.
 *
 * If you want to enhance HTML pages with qooxdoo widgets please use
 * {@link qx.ui.root.Page} eventually in combination with
 * {@link qx.ui.root.Inline} widgets.
 *
 * This class uses a {@link qx.ui.layout.Canvas} as fixed layout. The layout
 * cannot be changed.
 *
 * @require(qx.event.handler.Window)
 * @ignore(qx.ui.popup)
 * @ignore(qx.ui.popup.Manager.*)
 * @ignore(qx.ui.menu)
 * @ignore(qx.ui.menu.Manager.*)
 * @ignore(qx.ui)
 */
qx.Class.define("qx.ui.root.Application",
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
    // Symbolic links
    this.__window = qx.dom.Node.getWindow(doc);
    this.__doc = doc;

    // Base call
    this.base(arguments);

    // Resize handling
    qx.event.Registration.addListener(this.__window, "resize", this._onResize, this);

    // Use a hard-coded canvas layout
    this._setLayout(new qx.ui.layout.Canvas());

    // Directly schedule layout for root element
    qx.ui.core.queue.Layout.add(this);

    // Register as root
    qx.ui.core.FocusHandler.getInstance().connectTo(this);

    this.getContentElement().disableScrolling();

    // quick fix for [BUG #7680]
    this.getContentElement().setStyle("-webkit-backface-visibility", "hidden");

    // prevent scrolling on touch devices
    this.addListener("touchmove", this.__stopScrolling, this);

    // handle focus for iOS which seems to deny any focus action
    if (qx.core.Environment.get("os.name") == "ios") {
      this.getContentElement().addListener("tap", function(e) {
        var widget = qx.ui.core.Widget.getWidgetByElement(e.getTarget());
        while (widget && !widget.isFocusable()) {
          widget = widget.getLayoutParent();
        }
        if (widget && widget.isFocusable()) {
          widget.getContentElement().focus();
        }
      }, this, true);
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __window : null,
    __doc : null,

    // overridden
    /**
     * Create the widget's container HTML element.
     *
     * @lint ignoreDeprecated(alert)
     * @return {qx.html.Element} The container HTML element
     */
    _createContentElement : function()
    {
      var doc = this.__doc;

      if ((qx.core.Environment.get("engine.name") == "webkit"))
      {
        // In the "DOMContentLoaded" event of WebKit (Safari, Chrome) no body
        // element seems to be available in the DOM, if the HTML file did not
        // contain a body tag explicitly. Unfortunately, it cannot be added
        // here dynamically.
        if (!doc.body) {
          alert("The application could not be started due to a missing body tag in the HTML file!");
        }
      }

      // Apply application layout
      var hstyle = doc.documentElement.style;
      var bstyle = doc.body.style;

      hstyle.overflow = bstyle.overflow = "hidden";
      hstyle.padding = hstyle.margin = bstyle.padding = bstyle.margin = "0px";
      hstyle.width = hstyle.height = bstyle.width = bstyle.height = "100%";

      var elem = doc.createElement("div");
      doc.body.appendChild(elem);

      var root = new qx.html.Root(elem);
      root.setStyles({
        "position" : "absolute",
        "overflowX" : "hidden",
        "overflowY" : "hidden"
      });

      // Store reference to the widget in the DOM element.
      root.connectWidget(this);

      return root;
    },


    /**
     * Listener for window's resize event
     *
     * @param e {qx.event.type.Event} Event object
     */
    _onResize : function(e) {
      qx.ui.core.queue.Layout.add(this);

      // close all popups
      if (qx.ui.popup && qx.ui.popup.Manager) {
        qx.ui.popup.Manager.getInstance().hideAll();
      }

      // close all menus
      if (qx.ui.menu && qx.ui.menu.Manager) {
        qx.ui.menu.Manager.getInstance().hideAll();
      }
    },


    // overridden
    _computeSizeHint : function()
    {
      var width = qx.bom.Viewport.getWidth(this.__window);
      var height = qx.bom.Viewport.getHeight(this.__window);

      return {
        minWidth : width,
        width : width,
        maxWidth : width,
        minHeight : height,
        height : height,
        maxHeight : height
      };
    },


    // overridden
    _applyPadding : function(value, old, name)
    {
      if (value && (name == "paddingTop" || name == "paddingLeft")) {
        throw new Error("The root widget does not support 'left', or 'top' paddings!");
      }
      this.base(arguments, value, old, name);
    },


    /**
     * Handler for the native 'touchstart' on the window which prevents
     * the native page scrolling.
     * @param e {qx.event.type.Touch} The qooxdoo touch event.
     */
    __stopScrolling : function(e) {
      var node = e.getOriginalTarget();
      while (node && node.style) {
        var touchAction = qx.bom.element.Style.get(node, "touch-action") !== "none" &&
          qx.bom.element.Style.get(node, "touch-action") !== "";
        var webkitOverflowScrolling = qx.bom.element.Style.get(node, "-webkit-overflow-scrolling") === "touch";
        var overflowX = qx.bom.element.Style.get(node, "overflowX") != "hidden";
        var overflowY = qx.bom.element.Style.get(node, "overflowY") != "hidden";

        if (touchAction || webkitOverflowScrolling || overflowY || overflowX) {
          return;
        }
        node = node.parentNode;
      }
      e.preventDefault();
    },

    // overridden
    destroy : function()
    {
      if (this.$$disposed) {
        return;
      }

      qx.dom.Element.remove(this.getContentElement().getDomElement());
      this.base(arguments);
    } 
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this.__window = this.__doc = null;
  }
});
