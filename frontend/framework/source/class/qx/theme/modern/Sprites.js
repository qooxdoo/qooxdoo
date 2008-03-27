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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Temporary class until the image information is generated automatically
 */
qx.Class.define("qx.theme.modern.Sprites",
{
  statics :
  {
    __data :
    {
      "form/button-checked-focused-tl.png": ["form/button-combined.png", 0, 0, 4, 4],
      "form/button-checked-focused-t.png": ["form/button-combined.png", 0, -4, 4, 4],
      "form/button-checked-focused-tr.png": ["form/button-combined.png", 0, -8, 4, 4],
      "form/button-checked-focused-bl.png": ["form/button-combined.png", 0, -12, 4, 4],
      "form/button-checked-focused-b.png": ["form/button-combined.png", 0, -16, 4, 4],
      "form/button-checked-focused-br.png": ["form/button-combined.png", 0, -20, 4, 4],
      "form/button-checked-tl.png": ["form/button-combined.png", 0, -24, 4, 4],
      "form/button-checked-t.png": ["form/button-combined.png", 0, -28, 4, 4],
      "form/button-checked-tr.png": ["form/button-combined.png", 0, -32, 4, 4],
      "form/button-checked-bl.png": ["form/button-combined.png", 0, -36, 4, 4],
      "form/button-checked-b.png": ["form/button-combined.png", 0, -40, 4, 4],
      "form/button-checked-br.png": ["form/button-combined.png", 0, -44, 4, 4],
      "form/button-preselected-focused-tl.png": ["form/button-combined.png", 0, -48, 4, 4],
      "form/button-preselected-focused-t.png": ["form/button-combined.png", 0, -52, 4, 4],
      "form/button-preselected-focused-tr.png": ["form/button-combined.png", 0, -56, 4, 4],
      "form/button-preselected-focused-bl.png": ["form/button-combined.png", 0, -60, 4, 4],
      "form/button-preselected-focused-b.png": ["form/button-combined.png", 0, -64, 4, 4],
      "form/button-preselected-focused-br.png": ["form/button-combined.png", 0, -68, 4, 4],
      "form/button-preselected-tl.png": ["form/button-combined.png", 0, -72, 4, 4],
      "form/button-preselected-t.png": ["form/button-combined.png", 0, -76, 4, 4],
      "form/button-preselected-tr.png": ["form/button-combined.png", 0, -80, 4, 4],
      "form/button-preselected-bl.png": ["form/button-combined.png", 0, -84, 4, 4],
      "form/button-preselected-b.png": ["form/button-combined.png", 0, -88, 4, 4],
      "form/button-preselected-br.png": ["form/button-combined.png", 0, -92, 4, 4],
      "form/button-hovered-tl.png": ["form/button-combined.png", 0, -96, 4, 4],
      "form/button-hovered-t.png": ["form/button-combined.png", 0, -100, 4, 4],
      "form/button-hovered-tr.png": ["form/button-combined.png", 0, -104, 4, 4],
      "form/button-hovered-bl.png": ["form/button-combined.png", 0, -108, 4, 4],
      "form/button-hovered-b.png": ["form/button-combined.png", 0, -112, 4, 4],
      "form/button-hovered-br.png": ["form/button-combined.png", 0, -116, 4, 4],
      "form/button-focused-tl.png": ["form/button-combined.png", 0, -120, 4, 4],
      "form/button-focused-t.png": ["form/button-combined.png", 0, -124, 4, 4],
      "form/button-focused-tr.png": ["form/button-combined.png", 0, -128, 4, 4],
      "form/button-focused-bl.png": ["form/button-combined.png", 0, -132, 4, 4],
      "form/button-focused-b.png": ["form/button-combined.png", 0, -136, 4, 4],
      "form/button-focused-br.png": ["form/button-combined.png", 0, -140, 4, 4],
      "form/button-tl.png": ["form/button-combined.png", 0, -144, 4, 4],
      "form/button-t.png": ["form/button-combined.png", 0, -148, 4, 4],
      "form/button-tr.png": ["form/button-combined.png", 0, -152, 4, 4],
      "form/button-bl.png": ["form/button-combined.png", 0, -156, 4, 4],
      "form/button-b.png": ["form/button-combined.png", 0, -160, 4, 4],
      "form/button-br.png": ["form/button-combined.png", 0, -164, 4, 4],
      "form/button-pressed-tl.png": ["form/button-combined.png", 0, -168, 4, 4],
      "form/button-pressed-t.png": ["form/button-combined.png", 0, -172, 4, 4],
      "form/button-pressed-tr.png": ["form/button-combined.png", 0, -176, 4, 4],
      "form/button-pressed-bl.png": ["form/button-combined.png", 0, -180, 4, 4],
      "form/button-pressed-b.png": ["form/button-combined.png", 0, -184, 4, 4],
      "form/button-pressed-br.png": ["form/button-combined.png", 0, -188, 4, 4],
      "form/button-combined.png": ["form/button-combined.png", 0, 0, 4, 192],
      "form/button-checked-focused-l.png": ["form/button-combined-center.png", 0, 0, 4, 52],
      "form/button-checked-focused-r.png": ["form/button-combined-center.png", -4, 0, 4, 52],
      "form/button-checked-l.png": ["form/button-combined-center.png", -8, 0, 4, 52],
      "form/button-checked-r.png": ["form/button-combined-center.png", -12, 0, 4, 52],
      "form/button-preselected-focused-l.png": ["form/button-combined-center.png", -16, 0, 4, 52],
      "form/button-preselected-focused-r.png": ["form/button-combined-center.png", -20, 0, 4, 52],
      "form/button-preselected-l.png": ["form/button-combined-center.png", -24, 0, 4, 52],
      "form/button-preselected-r.png": ["form/button-combined-center.png", -28, 0, 4, 52],
      "form/button-hovered-l.png": ["form/button-combined-center.png", -32, 0, 4, 52],
      "form/button-hovered-r.png": ["form/button-combined-center.png", -36, 0, 4, 52],
      "form/button-focused-l.png": ["form/button-combined-center.png", -40, 0, 4, 52],
      "form/button-focused-r.png": ["form/button-combined-center.png", -44, 0, 4, 52],
      "form/button-l.png": ["form/button-combined-center.png", -48, 0, 4, 52],
      "form/button-r.png": ["form/button-combined-center.png", -52, 0, 4, 52],
      "form/button-pressed-l.png": ["form/button-combined-center.png", -56, 0, 4, 52],
      "form/button-pressed-r.png": ["form/button-combined-center.png", -60, 0, 4, 52],
      "form/button-combined-center.png": ["form/button-combined-center.png", 0, 0, 64, 52],
      "form/button-checked-focused-c.png": ["form/button-checked-focused-c.png", 0, 0, 40, 52],
      "form/button-checked-c.png": ["form/button-checked-c.png", 0, 0, 40, 52],
      "form/button-preselected-focused-c.png": ["form/button-preselected-focused-c.png", 0, 0, 40, 52],
      "form/button-preselected-c.png": ["form/button-preselected-c.png", 0, 0, 40, 52],
      "form/button-hovered-c.png": ["form/button-hovered-c.png", 0, 0, 40, 52],
      "form/button-focused-c.png": ["form/button-focused-c.png", 0, 0, 40, 52],
      "form/button-c.png": ["form/button-c.png", 0, 0, 40, 52],
      "form/button-pressed-c.png": ["form/button-pressed-c.png", 0, 0, 40, 52],
      "pane/pane-tl.png": ["pane/pane-combined.png", 0, 0, 6, 6],
      "pane/pane-t.png": ["pane/pane-combined.png", 0, -6, 6, 6],
      "pane/pane-tr.png": ["pane/pane-combined.png", 0, -12, 6, 6],
      "pane/pane-bl.png": ["pane/pane-combined.png", 0, -18, 6, 6],
      "pane/pane-b.png": ["pane/pane-combined.png", 0, -24, 6, 6],
      "pane/pane-br.png": ["pane/pane-combined.png", 0, -30, 6, 6],
      "pane/pane-combined.png": ["pane/pane-combined.png", 0, 0, 6, 36],
      "pane/pane-l.png": ["pane/pane-combined-center.png", 0, 0, 6, 238],
      "pane/pane-r.png": ["pane/pane-combined-center.png", -6, 0, 6, 238],
      "pane/pane-combined-center.png": ["pane/pane-combined-center.png", 0, 0, 12, 238],
      "pane/pane-c.png": ["pane/pane-c.png", 0, 0, 40, 238],
      "form/checkbox-checked-disabled.png": ["form/form-combined.png", 0, 0, 14, 14],
      "form/checkbox-checked-focused.png": ["form/form-combined.png", -14, 0, 14, 14],
      "form/checkbox-checked.png": ["form/form-combined.png", -28, 0, 14, 14],
      "form/checkbox-checked-hovered.png": ["form/form-combined.png", -42, 0, 14, 14],
      "form/checkbox-checked-pressed.png": ["form/form-combined.png", -56, 0, 14, 14],
      "form/checkbox-disabled.png": ["form/form-combined.png", -70, 0, 14, 14],
      "form/checkbox-focused.png": ["form/form-combined.png", -84, 0, 14, 14],
      "form/checkbox.png": ["form/form-combined.png", -98, 0, 14, 14],
      "form/checkbox-hovered.png": ["form/form-combined.png", -112, 0, 14, 14],
      "form/checkbox-pressed.png": ["form/form-combined.png", -126, 0, 14, 14],
      "form/radiobutton-checked-disabled.png": ["form/form-combined.png", -420, 0, 14, 14],
      "form/radiobutton-checked-focused.png": ["form/form-combined.png", -434, 0, 14, 14],
      "form/radiobutton-checked.png": ["form/form-combined.png", -448, 0, 14, 14],
      "form/radiobutton-checked-hovered.png": ["form/form-combined.png", -462, 0, 14, 14],
      "form/radiobutton-checked-pressed.png": ["form/form-combined.png", -476, 0, 14, 14],
      "form/radiobutton-disabled.png": ["form/form-combined.png", -490, 0, 14, 14],
      "form/radiobutton-focused.png": ["form/form-combined.png", -504, 0, 14, 14],
      "form/radiobutton.png": ["form/form-combined.png", -518, 0, 14, 14],
      "form/radiobutton-hovered.png": ["form/form-combined.png", -532, 0, 14, 14],
      "form/radiobutton-pressed.png": ["form/form-combined.png", -546, 0, 14, 14],
      "form/form-combined.png": ["form/form-combined.png", 0, 0, 560, 14]
    }
  },

  defer : function(statics)
  {
    var base = qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Modern/";
    var mgr = qx.util.ImageRegistry.getInstance();

    for (var image in statics.__data)
    {
      var data = statics.__data[image]
      mgr.register(base + image, base + data[0], data[1], data[2], data[3], data[4]);
    }
  }
});