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

/* ************************************************************************

#require(qx.event.handler.Window)
#ignore(qx.ui.popup.Manager)
#ignore(qx.ui.menu.Manager)
#ignore(qx.ui)

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
    _createContainerElement : function()
    {
      var doc = this.__doc;

      /**
       * @lint ignoreDeprecated(alert)
       */
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
      root.setStyle("position", "absolute");

      // Store "weak" reference to the widget in the DOM element.
      root.setAttribute("$$widget", this.toHashCode());

      return root;
    },


    /**
     * Listener for window's resize event
     *
     * @param e {qx.event.type.Event} Event object
     * @return {void}
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


    // overridden
    _applyDecorator : function(value, old)
    {
      this.base(arguments, value, old);
      if (!value) {
        return;
      }

      var insets = this.getDecoratorElement().getInsets();
      if (insets.left || insets.top) {
        throw new Error("The root widget does not support decorators with 'left', or 'top' insets!");
      }
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
