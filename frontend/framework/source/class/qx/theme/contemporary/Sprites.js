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
qx.Class.define("qx.theme.contemporary.Sprites",
{
  statics :
  {
    __data :
    {
        "button/Button-Checked-Fokus-tl.png": ["button/Button-Combined.png", 0, 0, 4, 4],
        "button/Button-Checked-Fokus-t.png": ["button/Button-Combined.png", 0, -4, 4, 4],
        "button/Button-Checked-Fokus-tr.png": ["button/Button-Combined.png", 0, -8, 4, 4],
        "button/Button-Checked-Fokus-bl.png": ["button/Button-Combined.png", 0, -12, 4, 4],
        "button/Button-Checked-Fokus-b.png": ["button/Button-Combined.png", 0, -16, 4, 4],
        "button/Button-Checked-Fokus-br.png": ["button/Button-Combined.png", 0, -20, 4, 4],
        "button/Button-Checked-tl.png": ["button/Button-Combined.png", 0, -24, 4, 4],
        "button/Button-Checked-t.png": ["button/Button-Combined.png", 0, -28, 4, 4],
        "button/Button-Checked-tr.png": ["button/Button-Combined.png", 0, -32, 4, 4],
        "button/Button-Checked-bl.png": ["button/Button-Combined.png", 0, -36, 4, 4],
        "button/Button-Checked-b.png": ["button/Button-Combined.png", 0, -40, 4, 4],
        "button/Button-Checked-br.png": ["button/Button-Combined.png", 0, -44, 4, 4],
        "button/Button-Default-Fokus-tl.png": ["button/Button-Combined.png", 0, -48, 4, 4],
        "button/Button-Default-Fokus-t.png": ["button/Button-Combined.png", 0, -52, 4, 4],
        "button/Button-Default-Fokus-tr.png": ["button/Button-Combined.png", 0, -56, 4, 4],
        "button/Button-Default-Fokus-bl.png": ["button/Button-Combined.png", 0, -60, 4, 4],
        "button/Button-Default-Fokus-b.png": ["button/Button-Combined.png", 0, -64, 4, 4],
        "button/Button-Default-Fokus-br.png": ["button/Button-Combined.png", 0, -68, 4, 4],
        "button/Button-Default-tl.png": ["button/Button-Combined.png", 0, -72, 4, 4],
        "button/Button-Default-t.png": ["button/Button-Combined.png", 0, -76, 4, 4],
        "button/Button-Default-tr.png": ["button/Button-Combined.png", 0, -80, 4, 4],
        "button/Button-Default-bl.png": ["button/Button-Combined.png", 0, -84, 4, 4],
        "button/Button-Default-b.png": ["button/Button-Combined.png", 0, -88, 4, 4],
        "button/Button-Default-br.png": ["button/Button-Combined.png", 0, -92, 4, 4],
        "button/Button-Hover-tl.png": ["button/Button-Combined.png", 0, -96, 4, 4],
        "button/Button-Hover-t.png": ["button/Button-Combined.png", 0, -100, 4, 4],
        "button/Button-Hover-tr.png": ["button/Button-Combined.png", 0, -104, 4, 4],
        "button/Button-Hover-bl.png": ["button/Button-Combined.png", 0, -108, 4, 4],
        "button/Button-Hover-b.png": ["button/Button-Combined.png", 0, -112, 4, 4],
        "button/Button-Hover-br.png": ["button/Button-Combined.png", 0, -116, 4, 4],
        "button/Button-Normal-Fokus-tl.png": ["button/Button-Combined.png", 0, -120, 4, 4],
        "button/Button-Normal-Fokus-t.png": ["button/Button-Combined.png", 0, -124, 4, 4],
        "button/Button-Normal-Fokus-tr.png": ["button/Button-Combined.png", 0, -128, 4, 4],
        "button/Button-Normal-Fokus-bl.png": ["button/Button-Combined.png", 0, -132, 4, 4],
        "button/Button-Normal-Fokus-b.png": ["button/Button-Combined.png", 0, -136, 4, 4],
        "button/Button-Normal-Fokus-br.png": ["button/Button-Combined.png", 0, -140, 4, 4],
        "button/Button-Normal-tl.png": ["button/Button-Combined.png", 0, -144, 4, 4],
        "button/Button-Normal-t.png": ["button/Button-Combined.png", 0, -148, 4, 4],
        "button/Button-Normal-tr.png": ["button/Button-Combined.png", 0, -152, 4, 4],
        "button/Button-Normal-bl.png": ["button/Button-Combined.png", 0, -156, 4, 4],
        "button/Button-Normal-b.png": ["button/Button-Combined.png", 0, -160, 4, 4],
        "button/Button-Normal-br.png": ["button/Button-Combined.png", 0, -164, 4, 4],
        "button/Button-Pressed-tl.png": ["button/Button-Combined.png", 0, -168, 4, 4],
        "button/Button-Pressed-t.png": ["button/Button-Combined.png", 0, -172, 4, 4],
        "button/Button-Pressed-tr.png": ["button/Button-Combined.png", 0, -176, 4, 4],
        "button/Button-Pressed-bl.png": ["button/Button-Combined.png", 0, -180, 4, 4],
        "button/Button-Pressed-b.png": ["button/Button-Combined.png", 0, -184, 4, 4],
        "button/Button-Pressed-br.png": ["button/Button-Combined.png", 0, -188, 4, 4],
        "button/Button-Combined.png": ["button/Button-Combined.png", 0, 0, 4, 192],
        "button/Button-Checked-Fokus-l.png": ["button/Button-Combined-Center.png", 0, 0, 4, 52],
        "button/Button-Checked-Fokus-r.png": ["button/Button-Combined-Center.png", -4, 0, 4, 52],
        "button/Button-Checked-l.png": ["button/Button-Combined-Center.png", -8, 0, 4, 52],
        "button/Button-Checked-r.png": ["button/Button-Combined-Center.png", -12, 0, 4, 52],
        "button/Button-Default-Fokus-l.png": ["button/Button-Combined-Center.png", -16, 0, 4, 52],
        "button/Button-Default-Fokus-r.png": ["button/Button-Combined-Center.png", -20, 0, 4, 52],
        "button/Button-Default-l.png": ["button/Button-Combined-Center.png", -24, 0, 4, 52],
        "button/Button-Default-r.png": ["button/Button-Combined-Center.png", -28, 0, 4, 52],
        "button/Button-Hover-l.png": ["button/Button-Combined-Center.png", -32, 0, 4, 52],
        "button/Button-Hover-r.png": ["button/Button-Combined-Center.png", -36, 0, 4, 52],
        "button/Button-Normal-Fokus-l.png": ["button/Button-Combined-Center.png", -40, 0, 4, 52],
        "button/Button-Normal-Fokus-r.png": ["button/Button-Combined-Center.png", -44, 0, 4, 52],
        "button/Button-Normal-l.png": ["button/Button-Combined-Center.png", -48, 0, 4, 52],
        "button/Button-Normal-r.png": ["button/Button-Combined-Center.png", -52, 0, 4, 52],
        "button/Button-Pressed-l.png": ["button/Button-Combined-Center.png", -56, 0, 4, 52],
        "button/Button-Pressed-r.png": ["button/Button-Combined-Center.png", -60, 0, 4, 52],
        "button/Button-Combined-Center.png": ["button/Button-Combined-Center.png", 0, 0, 64, 52],
        "button/Button-Checked-Fokus-c.png": ["button/Button-Checked-Fokus-c.png", 0, 0, 40, 52],
        "button/Button-Checked-c.png": ["button/Button-Checked-c.png", 0, 0, 40, 52],
        "button/Button-Default-Fokus-c.png": ["button/Button-Default-Fokus-c.png", 0, 0, 40, 52],
        "button/Button-Default-c.png": ["button/Button-Default-c.png", 0, 0, 40, 52],
        "button/Button-Hover-c.png": ["button/Button-Hover-c.png", 0, 0, 40, 52],
        "button/Button-Normal-Fokus-c.png": ["button/Button-Normal-Fokus-c.png", 0, 0, 40, 52],
        "button/Button-Normal-c.png": ["button/Button-Normal-c.png", 0, 0, 40, 52],
        "button/Button-Pressed-c.png": ["button/Button-Pressed-c.png", 0, 0, 40, 52],
        "pane/Pane-tl.png": ["pane/Pane-Combined.png", 0, 0, 6, 6],
        "pane/Pane-t.png": ["pane/Pane-Combined.png", 0, -6, 6, 6],
        "pane/Pane-tr.png": ["pane/Pane-Combined.png", 0, -12, 6, 6],
        "pane/Pane-bl.png": ["pane/Pane-Combined.png", 0, -18, 6, 6],
        "pane/Pane-b.png": ["pane/Pane-Combined.png", 0, -24, 6, 6],
        "pane/Pane-br.png": ["pane/Pane-Combined.png", 0, -30, 6, 6],
        "pane/Pane-Combined.png": ["pane/Pane-Combined.png", 0, 0, 6, 36],
        "pane/Pane-l.png": ["pane/Pane-Combined-Center.png", 0, 0, 6, 238],
        "pane/Pane-r.png": ["pane/Pane-Combined-Center.png", -6, 0, 6, 238],
        "pane/Pane-Combined-Center.png": ["pane/Pane-Combined-Center.png", 0, 0, 12, 238],
        "pane/Pane-c.png": ["pane/Pane-c.png", 0, 0, 40, 238],
        "form/Checkbox-checked-disabled.png": ["form/Form-Combined.png", 0, 0, 14, 14],
        "form/Checkbox-checked-focus.png": ["form/Form-Combined.png", -14, 0, 14, 14],
        "form/Checkbox-checked-normal.png": ["form/Form-Combined.png", -28, 0, 14, 14],
        "form/Checkbox-checked-over.png": ["form/Form-Combined.png", -42, 0, 14, 14],
        "form/Checkbox-checked-pressed.png": ["form/Form-Combined.png", -56, 0, 14, 14],
        "form/Checkbox-unchecked-disabled.png": ["form/Form-Combined.png", -70, 0, 14, 14],
        "form/Checkbox-unchecked-focus.png": ["form/Form-Combined.png", -84, 0, 14, 14],
        "form/Checkbox-unchecked-normal.png": ["form/Form-Combined.png", -98, 0, 14, 14],
        "form/Checkbox-unchecked-over.png": ["form/Form-Combined.png", -112, 0, 14, 14],
        "form/Checkbox-unchecked-pressed.png": ["form/Form-Combined.png", -126, 0, 14, 14],
        "form/Form-Combined.png": ["form/Form-Combined.png", -140, 0, 280, 14],
        "form/Radio-checked-disabled.png": ["form/Form-Combined.png", -420, 0, 14, 14],
        "form/Radio-checked-focus.png": ["form/Form-Combined.png", -434, 0, 14, 14],
        "form/Radio-checked-normal.png": ["form/Form-Combined.png", -448, 0, 14, 14],
        "form/Radio-checked-over.png": ["form/Form-Combined.png", -462, 0, 14, 14],
        "form/Radio-checked-pressed.png": ["form/Form-Combined.png", -476, 0, 14, 14],
        "form/Radio-unchecked-disabled.png": ["form/Form-Combined.png", -490, 0, 14, 14],
        "form/Radio-unchecked-focus.png": ["form/Form-Combined.png", -504, 0, 14, 14],
        "form/Radio-unchecked-normal.png": ["form/Form-Combined.png", -518, 0, 14, 14],
        "form/Radio-unchecked-over.png": ["form/Form-Combined.png", -532, 0, 14, 14],
        "form/Radio-unchecked-pressed.png": ["form/Form-Combined.png", -546, 0, 14, 14],
        "form/Form-Combined.png": ["form/Form-Combined.png", 0, 0, 560, 14]
    }
  },


  defer : function(statics)
  {
    var base = qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/";
    var mgr = qx.util.ImageRegistry.getInstance();

    for (var image in statics.__data)
    {
      var data = statics.__data[image]
      mgr.register(base + image, base + data[0], data[1], data[2], data[3], data[4]);
    }
  }
});