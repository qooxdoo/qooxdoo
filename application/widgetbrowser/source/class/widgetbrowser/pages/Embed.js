/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/* ************************************************************************

#asset(widgetbrowser/fo_tester.swf)
#asset(widgetbrowser/blank.html)

************************************************************************ */

/**
 * Demonstrates qx.ui.embed(...):
 *
 * embed.Canvas
 * embed.Flash
 * embed.Html
 *
 */

qx.Class.define("widgetbrowser.pages.Embed",
{
  extend: widgetbrowser.pages.AbstractPage,

  construct: function()
  {
    this.base(arguments);

    var gridLayout = new qx.ui.layout.Grid(100, 10);
    gridLayout.setColumnFlex(1, 1);
    this.__grid = new qx.ui.container.Composite(gridLayout);
    this.add(this.__grid, {width: "100%", height: "100%"});

    this.initWidgets();
  },

  members :
  {

    __grid: null,

    initWidgets: function()
    {
      var widgets = this._widgets;
      var label;

      // Flash
      label = new qx.ui.basic.Label("Flash");
      this.__grid.add(label, {row: 0, column: 0});
      var flashVars = {
        flashVarText: "this is passed in via FlashVars"
      };
      var flash = new qx.ui.embed.Flash("widgetbrowser/fo_tester.swf").set({
        scale: "noscale",
        width: 100,
        height: 200,
        variables : flashVars
      });
      flash.getContentElement().setParam("bgcolor", "#FF6600");
      widgets.push(flash);
      this.__grid.add(flash, {row: 1, column: 0, colSpan: 2});

      // Canvas
      label = new qx.ui.basic.Label("Canvas");
      this.__grid.add(label, {row: 2, column: 0});
      if (qx.core.Environment.get("html.canvas")) {
        var canvas = new qx.ui.embed.Canvas().set({
          width: 200,
          height: 200,
          canvasWidth: 200,
          canvasHeight: 200,
          syncDimension: true
        });
        canvas.addListener("redraw", this.__draw, this);
        widgets.push(canvas);
        this.__grid.add(canvas, {row: 3, column: 0});
      } else {
        this.__grid.add(new qx.ui.basic.Label("Browser does not support canvas"), {row: 3, column: 0});
      }

      // HTML
      label = new qx.ui.basic.Label("HTML");
      this.__grid.add(label, {row: 2, column: 1});

      var htmlContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      this.__grid.add(htmlContainer, {row: 3, column: 1});

      var html1 = "<div style='background-color: white; text-align: center;'>" +
                    "<i style='color: red;'><b>H</b></i>" +
                    "<b>T</b>" +
                    "<u>M</u>" +
                    "<i>L</i>" +
                    " Text" +
                  "</div>";
      var embed1 = new qx.ui.embed.Html(html1);
      widgets.push(embed1);
      embed1.setMaxWidth(200);
      embed1.setHeight(20);
      embed1.setDecorator("main");
      htmlContainer.add(embed1);

      // Example HTML embed with set font
      var html2 = "Text with set font (bold)!";
      var embed2 = new qx.ui.embed.Html(html2);
      widgets.push(embed2);
      embed2.setMaxWidth(200);
      embed2.setFont("bold");
      embed2.setHeight(20);
      embed2.setDecorator("main");
      htmlContainer.add(embed2);

      // Rich content
      var rich = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla f';
      var richWidget = new qx.ui.embed.Html(rich);
      widgets.push(richWidget);
      richWidget.setOverflow("auto", "auto");
      richWidget.setDecorator("main");
      richWidget.setBackgroundColor("white");
      richWidget.setHeight(150);
      richWidget.setMaxWidth(200);
      htmlContainer.add(richWidget);

      // HtmlArea
      label = new qx.ui.basic.Label("HtmlArea");
      this.__grid.add(label, {row: 4, column: 0});
      var htmlDecorator = new qx.ui.decoration.Single(1, "solid", "border-main");
      var demoContent = '<h1>About</h1><p>qooxdoo (pronounced [ku:ksdu:]) is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No <acronym title="HyperText Markup Language">HTML</acronym>, <acronym title="Cascading Style Sheets">CSS</acronym> nor <acronym title="Document Object Model">DOM</acronym> knowledge is needed. qooxdoo includes a platform-independent development tool chain, a state-of-the-art <acronym title="Graphical User Interface">GUI</acronym> toolkit and an advanced client-server communication layer. It is Open Source under an <acronym title="GNU Lesser General Public License">LGPL</acronym>/<acronym title="Eclipse Public License">EPL</acronym> dual <a href="http://qooxdoo.org/license" class="wikilink1" title="license">license</a>.</p>';
      var htmlArea = new qx.ui.embed.HtmlArea(demoContent, null, qx.util.ResourceManager.getInstance().toUri("widgetbrowser/blank.html"));
      htmlArea.set( { width: 300, height: 150, decorator: htmlDecorator } );
      this.__grid.add(htmlArea, {row: 5, column: 0});
      widgets.push(htmlArea);
    },

    __draw: function(e) {
      var data = e.getData();
      var ctx = data.context;

      ctx.fillStyle = "rgb(200,0,0)";
      ctx.fillRect (20, 20, 105, 100);

      ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
      ctx.fillRect (70, 70, 105, 100);
    }
  }
});