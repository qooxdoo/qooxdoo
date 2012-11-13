/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * String cell renderer with special formatting for undefined values
 */
qx.Class.define("fce.view.cellrenderer.Undefined", {

  extend : qx.ui.table.cellrenderer.Abstract,

  members :
  {
    // overridden
    _getContentHtml : function(cellInfo) {
      return "undefined";
    },

    // overridden
    _getCellStyle : function(cellInfo) {
      return qx.bom.element.Opacity.compile(0.5);
    }
  }
});
