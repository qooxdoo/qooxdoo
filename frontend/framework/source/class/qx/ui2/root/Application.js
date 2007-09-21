/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Useful for application like layouts where top-level scrollbars
 * are not available (internal panes scroll however).
 */
qx.Class.define("qx.ui2.root.Application",
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
    this._window = qx.dom.Node.getWindow(doc);
    this._body = doc.body;

    // Base call
    this.base(arguments);

    // Apply application layout
    var hstyle = doc.documentElement.style;
    var bstyle = doc.body.style;

    hstyle.overflow = bstyle.overflow = "hidden";
    hstyle.padding = hstyle.margin = bstyle.padding = bstyle.margin = "0px";
    hstyle.width = hstyle.height = bstyle.width = bstyle.height = "100%";

    // Resize handling
    qx.event.Registration.addListener(this._window, "resize", this._onResize, this);
    this._onResize();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    setGeometry : function() {
      // nothing todo here
    },


    // overridden
    _createOuterElement : function() {
      return new qx.html.Root(this._body);
    },


    // overridden
    _createContentElement : function() {
      return this._outerElement;
    },


    /**
     * Listener for window's resize event
     *
     * @type member
     * @param e {qx.type.Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      var width = qx.bom.Viewport.getWidth(this._window);
      var height = qx.bom.Viewport.getHeight(this._window);

      // Sync to layouter
      this.addHint("width", width);
      this.addHint("height", height);

      // Debug
      qx.core.Log.debug("Resize application: " + width + "x" + height);
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_window");
  }
});
