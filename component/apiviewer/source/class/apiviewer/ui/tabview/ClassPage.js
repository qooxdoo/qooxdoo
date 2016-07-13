/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("apiviewer.ui.tabview.ClassPage",
{
  extend : apiviewer.ui.tabview.AbstractPage,

  members :
  {
    _createViewer : function() {
      return new apiviewer.ui.ClassViewer();
    }
  }
});
