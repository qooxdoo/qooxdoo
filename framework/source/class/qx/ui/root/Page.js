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
 * The page widget does not support paddings and decorators with insets.
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
    this.__doc = doc;

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

    // Avoid the automatically scroll in to view.
    // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3236 for details.
    if ((qx.core.Environment.get("engine.name") == "mshtml")) {
      this.setKeepFocus(true);
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __timer : null,
    __doc : null,

    // overridden
    _createContainerElement : function()
    {
      var elem = this.__doc.createElement("div");
      this.__doc.body.appendChild(elem);

      var root = new qx.html.Root(elem);
      root.setStyles({
        position: "absolute",
        textAlign: "left"
      });

      // Store "weak" reference to the widget in the DOM element.
      root.setAttribute("$$widget", this.toHashCode());

      // Mark the element of this root with a special attribute to prevent
      // that qx.event.handler.Focus is performing a focus action.
      // This would end up in a scrolling to the top which is not wanted in
      // an inline scenario
      // see Bug #2740
      if ((qx.core.Environment.get("engine.name") == "gecko")) {
        root.setAttribute("qxIsRootPage", 1);
      }

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
    this.__doc = null;
  }
});
