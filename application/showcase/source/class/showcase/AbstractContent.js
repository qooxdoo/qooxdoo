/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Class.define("showcase.AbstractContent",
{
  extend : qx.core.Object,

  construct : function(page) {
    this.setPage(page);
  },


  properties :
  {
    page : {
      check: "showcase.Page"
    },

    view : {
      check : "qx.ui.core.Widget"
    }
  }
});