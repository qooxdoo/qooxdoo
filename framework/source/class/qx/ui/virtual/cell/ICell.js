/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A HTML cell provider provides the {@link qx.ui.virtual.layer.HtmlCell}
 * with HTML fragments to render the cells.
 */
qx.Interface.define("qx.ui.virtual.cell.ICell",
{
  members :
  {
    /**
     * TODOC
     */
    getCellProperties : function(data, states) {}
  }
});