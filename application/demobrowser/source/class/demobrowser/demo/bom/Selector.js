/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Selector",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);
      
      var Logger = qx.log.Logger;
      var Selector = qx.bom.Selector;
      
      // Some basic style changes
      Selector.query("p").setStyle("color", "red");
      Selector.query("p:eq(1)").setStyle("fontWeight", "bold").setStyle("opacity", "0.5");
      
      Selector.query("h1").setStyles({
        "textAlign" : "center",
        "textDecoration" : "underline",
        "color" : "green"
      });

      // Work with attributes
      Logger.debug("href of first link: " + Selector.query("a").getAttribute("href"));
      Selector.query("a").setAttribute("title", "Click to follow the link");
      
      // Change classes
      Selector.query("h1,h2").addClass("header");
      
      // Add some events
      Selector.query("p").addListener("click", function() { alert(this.innerHTML) });
      
      // Work with collection
      (new qx.bom.Collection)
        .add("h2").setStyle("color", "orange")
        .add("li").setStyle("backgroundColor", "#eee")
        .end().setStyle("textAlign", "center");
    }
  }
});
