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
     * Volker Pauli

************************************************************************ */

qx.Class.define("qx.legacy.ui.splitpane.VerticalSplitPane",
{
  extend : qx.legacy.ui.splitpane.SplitPane,

  /**
   * Creates a new instance of a vertical SplitPane.<br /><br />
   *
   * new qx.legacy.ui.splitpane.VerticalSplitPane()<br />
   * new qx.legacy.ui.splitpane.VerticalSplitPane(firstSize, secondSize)
   *
   * Please note that the usage of percents may be problematic because you must respect the
   * divider, too. To create a typical 50,50 split please use flex units instead e.g. "1*", "1*"
   *
   * @param firstSize {String} The size of the top pane. Allowed values are any by {@link qx.legacy.ui.core.Widget} supported unit.
   * @param secondSize {String} The size of the bottom pane. Allowed values are any by {@link qx.legacy.ui.core.Widget} supported unit.
   */
  construct : function(firstSize, secondSize) {
    this.base(arguments, "vertical", firstSize, secondSize);
  }
});
