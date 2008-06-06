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
     * Volker Pauli (vpauli)
     * Sebastian Werner (wpbasti)
     * Carsten Lergenmueller (carstenL)
     * Jonathan Rass (jonathan_rass)

 ************************************************************************ */

qx.Class.define("qx.ui.splitpane.Splitter",
{
  extend : qx.ui.core.Widget,

  properties :
  {
    // overrridden
    appearance :
    {
      refine : true,
      init : "splitpane-splitter"
    },

    // overrridden
    allowShrinkX :
    {
      refine : true,
      init : false
    },

    // overrridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  }
});
