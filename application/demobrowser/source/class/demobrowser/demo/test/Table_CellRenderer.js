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

#asset(qx/icon/${qx.icontheme}/16/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-up.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/16/actions/go-down.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.Table_CellRenderer",
{
  extend : qx.application.Native,
  include : [demobrowser.demo.table.MUtil],

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.setUp();

      this.testDefaultRenderer(new qx.ui.table.cellrenderer.Default());
      this.testDefaultRenderer(new qx.ui.table.cellrenderer.Default().set({
        useAutoAlign : false
      }));
      this.testBooleanRenderer();
      this.testDateRenderer();
      this.testNumberRenderer();
      this.testImageRenderer();
      this.testStringRenderer();
      this.testPasswordRenderer();
      this.testHtmlRenderer();
      this.testConditionalRenderer();
      this.testDynamicRenderer();
      this.testReplaceRenderer();
    },


    setUp : function()
    {
      // table mock
      this.tableMock = this.getTableMock();


      // setup aliases
      qx.util.AliasManager.getInstance().add("decoration", "qx/decoration/Classic");
      qx.util.AliasManager.getInstance().add("icon", "qx/icon/Tango");
    },


    testDefaultRenderer : function(renderer)
    {
      var width = 100;

      var cellDataOptions =
      {
        value : [null, "Juhu", 32, new Date()],
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [20],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:20px;width:", width, "px;top:",top, "px'>"];
        top += 20;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testBooleanRenderer : function()
    {
      var width = 50;
      var renderer = new qx.ui.table.cellrenderer.Boolean();

      var cellDataOptions =
      {
        value : [null, true, false],
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [20],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:20px;width:", width, "px;top:",top, "px'>"];
        top += 20;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testDateRenderer : function()
    {
      var width = 180;

      var renderer = new qx.ui.table.cellrenderer.Date();

      var cellData =
      {
        value : new Date(),
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [20],
        style: [""]
      }

      var df = qx.util.format.DateFormat;
      var formats = [
        df.getDateTimeInstance(),
        df.getDateInstance()
      ];

      var container = this._getNewTableDiv(width)
      var top = 0;

      for (var i=0; i<formats.length; i++)
      {
        var format = formats[i];
        renderer.setDateFormat(format);

        var html = ["<div style='position:absolute;height:20px;width:", width, "px;top:",top, "px'>"];
        top += 20;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      }
    },


    testNumberRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.Number();
      var width = 100;

      var cellData =
      {
        value : Math.PI,
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [20],
        style: [""]
      }

      var nf = qx.util.format.NumberFormat;
      var formats = [
        nf.getIntegerInstance(),
        new nf().set({
          minimumFractionDigits: 3,
          maximumFractionDigits: 5,
          prefix : "$ "
        })
      ];

      var container = this._getNewTableDiv(width)
      var top = 0;

      for (var i=0; i<formats.length; i++)
      {
        var format = formats[i];
        renderer.setNumberFormat(format);

        var html = ["<div style='position:absolute;height:20px;width:", width,"px;top:",top, "px'>"];
        top += 20;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      }
    },


    testImageRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.Image();
      var width = 50;

      var cellDataOptions =
      {
        value : [
          null,
          "icon/16/actions/go-down.png",
          "icon/16/actions/go-up.png",
          "icon/16/actions/go-previous.png",
          "icon/16/actions/go-next.png"
        ],
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [20],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:20px;width:", width, "px;top:",top, "px'>"];
        top += 20;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testStringRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.String();
      var width = 100;
      var height = 20;

      var cellDataOptions =
      {
        value : [
          null,
          "Hello",
          "World"
        ],
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [height],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:",height,"px;width:", width, "px;top:",top, "px'>"];
        top += height;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testPasswordRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.Password();
      var width = 100;
      var height = 20;

      var cellDataOptions =
      {
        value : [
          null,
          "Hello",
          "World"
        ],
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [height],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:",height,"px;width:", width, "px;top:",top, "px'>"];
        top += height;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testHtmlRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.Html();
      var width = 100;
      var height = 50;

      var cellDataOptions =
      {
        value : [
          null,
          "<b>bold</b>",
          "<i>italic</i>",
          "multi<br>line"
        ],
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [height],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:",height,"px;width:", width, "px;top:",top, "px'>"];
        top += height;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testConditionalRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.Conditional();

      renderer.addNumericCondition("<", 0, null, "red", null, null);
      renderer.addNumericCondition(">=", 100, "left", null, null, null);
      renderer.addBetweenCondition("between", 0, 2, null, null, null, "bold", null);
      renderer.addRegex("0$", null, null, "bold", "border: 1px dotted green");

      var width = 100;
      var height = 20;

      var cellDataOptions =
      {
        value : [
          null,
          1,
          2,
          100,
          200,
          -100,
          0
        ],
        styleLeft : [0],
        styleWidth : [width],
        table : [this.tableMock],
        styleHeight : [height],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:",height,"px;width:", width, "px;top:",top, "px'>"];
        top += height;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testDynamicRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.Dynamic();
      renderer.setCellRendererFactoryFunction(function(cellInfo)
      {
        var value = cellInfo.value;
        var cr = qx.ui.table.cellrenderer;

        switch (typeof value)
        {
          case "string":
            if (value.match(/^icon\//)) {
              return new cr.Image();
            } else {
              return new cr.String();
            }

          case "boolean":
            return new cr.Boolean();

          case "number":
            return new cr.Number();

          case "object":
            if (value instanceof Date) {
              return new cr.Date();
            }
            return new cr.Default();
        }
      });


      var width = 100;
      var height = 20;

      var cellDataOptions =
      {
        value : [
          null,
          "Juhu",
          new Date(),
          30,
          "icon/16/actions/go-down.png",
          false
        ],
        styleLeft : [0],
        styleWidth : [width],
        styleHeight : [height],
        table : [this.tableMock],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:",height,"px;width:", width, "px;top:",top, "px'>"];
        top += height;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    },


    testReplaceRenderer : function()
    {
      var renderer = new qx.ui.table.cellrenderer.Replace();
      renderer.setReplaceMap({
        1 : "active",
        2 : "inactive",
        3 : "waiting"
      });
      renderer.addReversedReplaceMap();


      var width = 100;
      var height = 20;

      var cellDataOptions =
      {
        value : [1, 2, 3],
        styleLeft : [0],
        styleWidth : [width],
        table : [this.tableMock],
        styleHeight : [height],
        style: [""]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      this.permute(cellDataOptions, function(cellData)
      {
        var html = ["<div style='position:absolute;height:",height,"px;width:", width, "px;top:",top, "px'>"];
        top += height;
        renderer.createDataCellHtml(cellData, html);
        html.push("</div>");
        container.innerHTML += html.join("");
      });
    }
  }
});