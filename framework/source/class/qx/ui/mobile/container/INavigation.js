/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * All widgets that are added to the navigation container should implement this interface.
 */
qx.Interface.define("qx.ui.mobile.container.INavigation",
{
  members :
  {
    /**
     * Returns the title widget that is merged into the navigation bar.
     *
     * @return {qx.ui.mobile.navigationbar.Title} The title of the navigation bar
     */
    getTitleWidget : function() {},


    /**
     * Returns the left container that is merged into the navigation bar.
     *
     * @return {qx.ui.mobile.container.Composite} The left container of the navigation bar
     */
    getLeftContainer : function() {},


    /**
     * Returns the right container that is merged into the navigation bar.
     *
     * @return {qx.ui.mobile.container.Composite} The right container of the navigation bar
     */
    getRightContainer : function() {}
  }
});