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
 * The HBox decorator uses three images, which are rendered in a row.
 *
 * The first and last image always keep their original size. The center
 * image is stretched horizontally.
 *
 * This decorator can be used for widgets with a fixed height, which can be
 * stretched horizontally.
 */
qx.Class.define("qx.ui.decoration.HBox",
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
    this.base(arguments, baseImage, insets, "horizontal");
  }
});
