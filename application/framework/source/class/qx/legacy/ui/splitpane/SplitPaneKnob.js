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

 ************************************************************************ */

/**
 * @appearance splitpane-knob
 * @state horizontal
 * @state vertical
 * @state dragging
 */
qx.Class.define("qx.legacy.ui.splitpane.SplitPaneKnob",
{
  extend : qx.legacy.ui.basic.Image,

  properties :
  {
    appearance :
    {
      refine : true,
      init : "splitpane-knob"
    },

    visibility :
    {
      refine : true,
      init : false
    }
  }
});
