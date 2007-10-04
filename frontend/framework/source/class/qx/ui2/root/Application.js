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
  extend : qx.ui2.root.Page,



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
    // Base call
    this.base(arguments, doc);

    // Apply application layout
    var hstyle = doc.documentElement.style;
    var bstyle = doc.body.style;

    hstyle.overflow = bstyle.overflow = "hidden";
    hstyle.padding = hstyle.margin = bstyle.padding = bstyle.margin = "0px";
    hstyle.width = hstyle.height = bstyle.width = bstyle.height = "100%";
  },


  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_window", "_elem");
  }
});
