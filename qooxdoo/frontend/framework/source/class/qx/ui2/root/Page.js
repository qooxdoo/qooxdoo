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
 * {@link qx.ui2.layout.Basic}. The widget's layout cannot be changed.
 *
 * Note: This widget does not support decorations!
 *
 * If you want to place widgets inside the page flow use {@link qx.ui2.root.Inline}.
 */
qx.Class.define("qx.ui2.root.Page",
{
  extend : qx.ui2.core.Widget,






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
    this._doc = doc;

    this.base(arguments);

    this.setLayout(new qx.ui2.layout.Basic());
    this.scheduleLayoutUpdate();
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adds a widget to the page using the page's basic layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {qx.ui2.root.Page} This object (for chaining support)
     */
    add : function(widget, options)
    {
      this.getLayout().add(widget, options);
      // Chaining support
      return this;
    },


    // overridden
    _isRootWidget : true,


    // overridden
    isLayoutRoot : function() {
      return true;
    },


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
      var elem = new qx.html.Element();
      elem.setStyle("position", "absolute");
      return elem;
    },


    // overridden
    _applyLayout : function(value, old)
    {
      if (old) {
        throw new Error("You cannot change the layout of qx.ui2.root.Page!");
      }
      this.base(arguments, value, old);
    },


    // overridden
    getSizeHint : function() {
      // the size hint is 0 so make the content element invisible
      // this works because the content element has overflow "show"
      return {
        minWidth : 0,
        width : 0,
        maxWidth : 0,
        minHeight : 0,
        height : 0,
        maxHeight : 0
      };
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
