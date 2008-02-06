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

/* *************************************************************************

#module(ui_splitpane)

************************************************************************* */

/**
 * @appearance splitpane-slider
 * @state dragging
 */
qx.Class.define("qx.ui.splitpane.SplitPaneSlider",
{
  extend : qx.ui.layout.CanvasLayout,

  construct : function(pane)
  {
    this.base(arguments);

    this.setAppearance("splitpane-slider");
    this.setStyleProperty("fontSize", "0px");
    this.setStyleProperty("lineHeight", "0px");
    this.hide();
    this._pane = pane;

    this.initZIndex();
  },

  properties :
  {
    zIndex :
    {
      refine : true,
      init : 1e8
    }
  },

  destruct : function() {
    this._disposeObjects("_pane");
  }
});
