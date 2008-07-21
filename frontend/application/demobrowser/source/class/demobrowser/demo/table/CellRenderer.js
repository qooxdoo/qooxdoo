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

#asset(qx/decoration/Classic/*)

#asset(qx/icon/Tango/16/actions/go-previous.png)
#asset(qx/icon/Tango/16/actions/go-up.png)
#asset(qx/icon/Tango/16/actions/go-next.png)
#asset(qx/icon/Tango/16/actions/go-down.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.table.CellRenderer",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // TODO: box model correction
      var boxSizingAttr = qx.legacy.core.Client.getInstance().getEngineBoxSizingAttributes();
      var borderBoxCss = boxSizingAttr.join(":border-box;") + ":border-box;";

      qx.bom.Stylesheet.createElement(
        "*{" + borderBoxCss +"} "
      );

      // table mock
      this.tableMock = {
        getTableModel : function() {}
      };



      // setup aliases
      qx.util.AliasManager.getInstance().add("decoration", "qx/decoration/Classic");
      qx.util.AliasManager.getInstance().add("icon", "qx/icon/Tango");


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


    testDefaultRenderer : function(renderer)
    {
      var width = 100;

      var cellDataOptions =
      {
        value : [null, "Juhu", 32, new Date()],
        styleLeft : [0],
        styleWidth : [width],
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


    _tableLeft : 10,

    _getNewTableDiv : function(width)
    {
      var div = qx.bom.Element.create("div");
      qx.bom.element.Style.setStyles(div, {
        position : "absolute",
        left: this._tableLeft + "px",
        width: (width || 150) + "px",
        top: 20 + "px",
        height: "500px",
        backgroundColor : "#FFE"
      });
      this._tableLeft += (width || 150) + 20;
      document.body.appendChild(div);
      return div;
    },


    permute :function(options, callback)
    {
      var keys = qx.lang.Object.getKeys(options);

      // init
      var map = {};
      var indices = [];
      for (var i=0; i<keys.length; i++)
      {
        indices[i] = 0;
        var key = keys[i];
        map[key] = options[key][0]
      }

      var _perm = function(index, ignore)
      {
        if (index >= keys.length) {
          return;
        }

        var key = keys[index];
        var values = options[key];

        for (var i=0; i<values.length; i++)
        {
          if (ignore !== i)
          {
            indices[index] = i;
            map[key] = values[i];
            callback(map);
          }
          _perm(index+1, indices[index+1]);
        }
      }

      _perm(0, -1);
    }
  }
});