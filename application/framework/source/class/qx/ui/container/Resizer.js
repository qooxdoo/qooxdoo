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
     * Andreas Ecker (ecker)
     * David Perez (david-perez)

************************************************************************ */

/**
 * This class acts as a resizable container and allows it to be resized (not moved), normally in
 * the right and/or bottom directions. It is an alternative to splitters.
 */
qx.Class.define("qx.ui.container.Resizer",
{
  extend    : qx.ui.container.Composite,
  include   : qx.ui.core.MResizable,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties:
  {
    appearance :
    {
      refine : true,
      init : "resizer"
    }
  }
});
