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

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/48/devices/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Background",
{
  extend : qx.application.Inline,

  members :
  {
    main: function()
    {
      this.base(arguments);
      var q = qx.lang.Function.bind(qx.bom.Selector.query, qx.bom.Selector);
      
      var resolved = qx.util.AliasManager.getInstance().resolve("icon/48/devices/drive-optical.png");
      
      q("#box1_1").setCss(qx.bom.element.Background.compile(resolved));
      q("#box1_2").setCss(qx.bom.element.Background.compile(resolved, "repeat-x"));
      q("#box1_3").setCss(qx.bom.element.Background.compile(resolved, "repeat-y"));
      q("#box1_4").setCss(qx.bom.element.Background.compile(resolved, "repeat", 10));
      q("#box1_5").setCss(qx.bom.element.Background.compile(resolved, "repeat", 0, 10));
      q("#box1_6").setCss(qx.bom.element.Background.compile(resolved, "repeat", 10, 10));      
      q("#box1_7").setCss(qx.bom.element.Background.compile(resolved, "no-repeat", "center", "center"));
      q("#box1_8").setCss(qx.bom.element.Background.compile(resolved, "no-repeat", "right", "bottom"));

      
      q("#box2_1").setStyles(qx.bom.element.Background.getStyles(resolved));
      q("#box2_2").setStyles(qx.bom.element.Background.getStyles(resolved, "repeat-x"));
      q("#box2_3").setStyles(qx.bom.element.Background.getStyles(resolved, "repeat-y"));
      q("#box2_4").setStyles(qx.bom.element.Background.getStyles(resolved, "repeat", 10));
      q("#box2_5").setStyles(qx.bom.element.Background.getStyles(resolved, "repeat", 0, 10));
      q("#box2_6").setStyles(qx.bom.element.Background.getStyles(resolved, "repeat", 10, 10));    
      q("#box2_7").setStyles(qx.bom.element.Background.getStyles(resolved, "no-repeat", "center", "center"));
      q("#box2_8").setStyles(qx.bom.element.Background.getStyles(resolved, "no-repeat", "right", "bottom"));
    }
  }
});