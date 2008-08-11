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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Clipping area for the table header and table pane.
 */
qx.Class.define("qx.ui.table.pane.Clipper",
{
  extend : qx.ui.container.Composite,

  construct : function() {
    this.base(arguments, new qx.ui.layout.Grow());
  },

  members :
  {
    /**
     * Scrolls the element's content to the given left coordinate
     *
     * @param value {Integer} The vertical position to scroll to.
     * @return {void}
     */
    scrollToX : function(value) {
      this.getContentElement().scrollToX(value, false);
    },


    /**
     * Scrolls the element's content to the given top coordinate
     *
     * @param value {Integer} The horizontal position to scroll to.
     * @return {void}
     */
    scrollToY : function(value) {
      this.getContentElement().scrollToY(value, true);
    }
  }
});