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
      "button/button-checked-fokus-tl.png": ["button/button-combined.png", 0, 0, 4, 4],
      "button/button-checked-fokus-t.png": ["button/button-combined.png", 0, -4, 4, 4],
      "button/button-checked-fokus-tr.png": ["button/button-combined.png", 0, -8, 4, 4],
      "button/button-checked-fokus-bl.png": ["button/button-combined.png", 0, -12, 4, 4],
      "button/button-checked-fokus-b.png": ["button/button-combined.png", 0, -16, 4, 4],
      "button/button-checked-fokus-br.png": ["button/button-combined.png", 0, -20, 4, 4],
      "button/button-checked-tl.png": ["button/button-combined.png", 0, -24, 4, 4],
      "button/button-checked-t.png": ["button/button-combined.png", 0, -28, 4, 4],
      "button/button-checked-tr.png": ["button/button-combined.png", 0, -32, 4, 4],
      "button/button-checked-bl.png": ["button/button-combined.png", 0, -36, 4, 4],
      "button/button-checked-b.png": ["button/button-combined.png", 0, -40, 4, 4],
      "button/button-checked-br.png": ["button/button-combined.png", 0, -44, 4, 4],
      "button/button-default-fokus-tl.png": ["button/button-combined.png", 0, -48, 4, 4],
      "button/button-default-fokus-t.png": ["button/button-combined.png", 0, -52, 4, 4],
      "button/button-default-fokus-tr.png": ["button/button-combined.png", 0, -56, 4, 4],
      "button/button-default-fokus-bl.png": ["button/button-combined.png", 0, -60, 4, 4],
      "button/button-default-fokus-b.png": ["button/button-combined.png", 0, -64, 4, 4],
      "button/button-default-fokus-br.png": ["button/button-combined.png", 0, -68, 4, 4],
      "button/button-default-tl.png": ["button/button-combined.png", 0, -72, 4, 4],
      "button/button-default-t.png": ["button/button-combined.png", 0, -76, 4, 4],
      "button/button-default-tr.png": ["button/button-combined.png", 0, -80, 4, 4],
      "button/button-default-bl.png": ["button/button-combined.png", 0, -84, 4, 4],
      "button/button-default-b.png": ["button/button-combined.png", 0, -88, 4, 4],
      "button/button-default-br.png": ["button/button-combined.png", 0, -92, 4, 4],
      "button/button-hover-tl.png": ["button/button-combined.png", 0, -96, 4, 4],
      "button/button-hover-t.png": ["button/button-combined.png", 0, -100, 4, 4],
      "button/button-hover-tr.png": ["button/button-combined.png", 0, -104, 4, 4],
      "button/button-hover-bl.png": ["button/button-combined.png", 0, -108, 4, 4],
      "button/button-hover-b.png": ["button/button-combined.png", 0, -112, 4, 4],
      "button/button-hover-br.png": ["button/button-combined.png", 0, -116, 4, 4],
      "button/button-normal-fokus-tl.png": ["button/button-combined.png", 0, -120, 4, 4],
      "button/button-normal-fokus-t.png": ["button/button-combined.png", 0, -124, 4, 4],
      "button/button-normal-fokus-tr.png": ["button/button-combined.png", 0, -128, 4, 4],
      "button/button-normal-fokus-bl.png": ["button/button-combined.png", 0, -132, 4, 4],
      "button/button-normal-fokus-b.png": ["button/button-combined.png", 0, -136, 4, 4],
      "button/button-normal-fokus-br.png": ["button/button-combined.png", 0, -140, 4, 4],
      "button/button-normal-tl.png": ["button/button-combined.png", 0, -144, 4, 4],
      "button/button-normal-t.png": ["button/button-combined.png", 0, -148, 4, 4],
      "button/button-normal-tr.png": ["button/button-combined.png", 0, -152, 4, 4],
      "button/button-normal-bl.png": ["button/button-combined.png", 0, -156, 4, 4],
      "button/button-normal-b.png": ["button/button-combined.png", 0, -160, 4, 4],
      "button/button-normal-br.png": ["button/button-combined.png", 0, -164, 4, 4],
      "button/button-pressed-tl.png": ["button/button-combined.png", 0, -168, 4, 4],
      "button/button-pressed-t.png": ["button/button-combined.png", 0, -172, 4, 4],
      "button/button-pressed-tr.png": ["button/button-combined.png", 0, -176, 4, 4],
      "button/button-pressed-bl.png": ["button/button-combined.png", 0, -180, 4, 4],
      "button/button-pressed-b.png": ["button/button-combined.png", 0, -184, 4, 4],
      "button/button-pressed-br.png": ["button/button-combined.png", 0, -188, 4, 4],
      "button/button-combined.png": ["button/button-combined.png", 0, 0, 4, 192],
      "button/button-checked-fokus-l.png": ["button/button-combined-center.png", 0, 0, 4, 52],
      "button/button-checked-fokus-r.png": ["button/button-combined-center.png", -4, 0, 4, 52],
      "button/button-checked-l.png": ["button/button-combined-center.png", -8, 0, 4, 52],
      "button/button-checked-r.png": ["button/button-combined-center.png", -12, 0, 4, 52],
      "button/button-default-fokus-l.png": ["button/button-combined-center.png", -16, 0, 4, 52],
      "button/button-default-fokus-r.png": ["button/button-combined-center.png", -20, 0, 4, 52],
      "button/button-default-l.png": ["button/button-combined-center.png", -24, 0, 4, 52],
      "button/button-default-r.png": ["button/button-combined-center.png", -28, 0, 4, 52],
      "button/button-hover-l.png": ["button/button-combined-center.png", -32, 0, 4, 52],
      "button/button-hover-r.png": ["button/button-combined-center.png", -36, 0, 4, 52],
      "button/button-normal-fokus-l.png": ["button/button-combined-center.png", -40, 0, 4, 52],
      "button/button-normal-fokus-r.png": ["button/button-combined-center.png", -44, 0, 4, 52],
      "button/button-normal-l.png": ["button/button-combined-center.png", -48, 0, 4, 52],
      "button/button-normal-r.png": ["button/button-combined-center.png", -52, 0, 4, 52],
      "button/button-pressed-l.png": ["button/button-combined-center.png", -56, 0, 4, 52],
      "button/button-pressed-r.png": ["button/button-combined-center.png", -60, 0, 4, 52],
      "button/button-combined-center.png": ["button/button-combined-center.png", 0, 0, 64, 52],
      "button/button-checked-fokus-c.png": ["button/button-checked-fokus-c.png", 0, 0, 40, 52],
      "button/button-checked-c.png": ["button/button-checked-c.png", 0, 0, 40, 52],
      "button/button-default-fokus-c.png": ["button/button-default-fokus-c.png", 0, 0, 40, 52],
      "button/button-default-c.png": ["button/button-default-c.png", 0, 0, 40, 52],
      "button/button-hover-c.png": ["button/button-hover-c.png", 0, 0, 40, 52],
      "button/button-normal-fokus-c.png": ["button/button-normal-fokus-c.png", 0, 0, 40, 52],
      "button/button-normal-c.png": ["button/button-normal-c.png", 0, 0, 40, 52],
      "button/button-pressed-c.png": ["button/button-pressed-c.png", 0, 0, 40, 52],
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
      "form/checkbox-checked-focus.png": ["form/form-combined.png", -14, 0, 14, 14],
      "form/checkbox-checked-normal.png": ["form/form-combined.png", -28, 0, 14, 14],
      "form/checkbox-checked-over.png": ["form/form-combined.png", -42, 0, 14, 14],
      "form/checkbox-checked-pressed.png": ["form/form-combined.png", -56, 0, 14, 14],
      "form/checkbox-unchecked-disabled.png": ["form/form-combined.png", -70, 0, 14, 14],
      "form/checkbox-unchecked-focus.png": ["form/form-combined.png", -84, 0, 14, 14],
      "form/checkbox-unchecked-normal.png": ["form/form-combined.png", -98, 0, 14, 14],
      "form/checkbox-unchecked-over.png": ["form/form-combined.png", -112, 0, 14, 14],
      "form/checkbox-unchecked-pressed.png": ["form/form-combined.png", -126, 0, 14, 14],
      "form/radio-checked-disabled.png": ["form/form-combined.png", -420, 0, 14, 14],
      "form/radio-checked-focus.png": ["form/form-combined.png", -434, 0, 14, 14],
      "form/radio-checked-normal.png": ["form/form-combined.png", -448, 0, 14, 14],
      "form/radio-checked-over.png": ["form/form-combined.png", -462, 0, 14, 14],
      "form/radio-checked-pressed.png": ["form/form-combined.png", -476, 0, 14, 14],
      "form/radio-unchecked-disabled.png": ["form/form-combined.png", -490, 0, 14, 14],
      "form/radio-unchecked-focus.png": ["form/form-combined.png", -504, 0, 14, 14],
      "form/radio-unchecked-normal.png": ["form/form-combined.png", -518, 0, 14, 14],
      "form/radio-unchecked-over.png": ["form/form-combined.png", -532, 0, 14, 14],
      "form/radio-unchecked-pressed.png": ["form/form-combined.png", -546, 0, 14, 14],
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