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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The VBox decorator uses three images, which are rendered in a column.
 *
 * The first and last image always keep their original size. The center
 * image is stretched vertically.
 *
 * This decorator can be used for widgets with a fixed width, which can be
 * stretched vertically.
 */
qx.Class.define("qx.ui.decoration.VBox",
{
  extend : qx.ui.decoration.AbstractBox,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param baseImage {String} Base image to use
   * @param insets {Integer|Array} Insets for the grid
   */
  construct : function(baseImage, insets)
  {
    this.base(arguments, baseImage, insets, "vertical");
  }
});
