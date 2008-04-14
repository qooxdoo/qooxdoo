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
 * Widgets, which implement a selection behaviour of sub items using the
 * {@link SelectionManager} must implement this interface.
 */
qx.Interface.define("qx.ui.core.selection.IContainer",
{
  members :
  {
    /**
     * Get all selectable items
     *
     * @return {qx.ui.core.Widget[]} An array of all selectable items
     */
    getSelectables : function() {}
  }
});