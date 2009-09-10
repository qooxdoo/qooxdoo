/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 David Pérez Carmona
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)

************************************************************************ */

/**
 * This interface must be implemented when adding mixin MResizer to a class.
 */
qx.Interface.define("qx.legacy.ui.resizer.IResizable",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * After resizing completes, it updates the width.
     * @param newWidth  {Number}
     * @return {void}
     */
    _changeWidth: function(newWidth) {},

    /**
     * After resizing completes, it updates the height.
     * @param newHeight  {Number}
     * @return {void}
     */
    _changeHeight: function(newHeight) {},

    /**
     * Respect which widget the resizing occurs?
     * @return {qx.legacy.ui.core.Widget}
     */
    _getResizeParent: function() {},

    /**
     * Which widget determines the minimum size?
     * @return {qx.legacy.ui.core.Widget}
     */
    _getMinSizeReference: function() {}
  }
});
