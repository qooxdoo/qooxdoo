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

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.HtmlEmbed",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.VBox();
      box.setSpacing(10);

      var container = new qx.ui.container.Composite(box);
      container.setPadding(20);

      this.getRoot().add(container);
    
    
      // Example HTML embed 
      var html1 = "<div style='background-color: white; text-align: center;'>" + 
                    "<i style='color: red;'><b>H</b></i>" +
                    "<b>T</b>" + 
                    "<u>M</u>" + 
                    "<i>L</i>" + 
                    " Text" + 
                  "</div>";
      var embed1 = new qx.ui.embed.HtmlEmbed(html1);
      embed1.setWidth(300);
      embed1.setHeight(20);
      embed1.setDecorator("black");
      container.add(embed1);
      
      
      // Example HTML embed with set font
      var html2 = "Text with set font (monospace)!";
      var embed2 = new qx.ui.embed.HtmlEmbed(html2);
      embed2.setFont("monospace");
      embed2.setHeight(20);
      embed2.setDecorator("black");      
      container.add(embed2);   
      
      
      // Example HTML embed with text color
      var html3 = "<b>Text with set text color (green)!</b>";
      var embed3 = new qx.ui.embed.HtmlEmbed(html3);
      embed3.setTextColor("green");
      embed3.setHeight(20);
      embed3.setDecorator("black");       
      container.add(embed3);
    }
  }
});
