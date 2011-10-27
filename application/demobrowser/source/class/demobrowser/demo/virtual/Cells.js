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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/apps/internet-feed-reader.png)
#asset(qx/icon/${qx.icontheme}/32/apps/utilities-notes.png)

#asset(qx/icon/${qx.icontheme}/16/emotes/face-smile.png)
#asset(qx/icon/${qx.icontheme}/16/emotes/face-sad.png)

************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.virtual.Cells",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    main : function()
    {
      this.base(arguments);

      var layout = new qx.ui.layout.HBox(5);
      this.topContainer = new qx.ui.container.Composite(layout);

      this.runTest("testStringCell");
      this.runTest("testNumberCell");
      this.runTest("testDateCell");
      this.runTest("testHtmlCell");

      // TODO: This does not work in Classic!
      if(qx.core.Environment.get("qx.theme") == "qx.theme.Modern")
      {
        this.runTest("testImageCell");
        this.runTest("testBooleanCell");
        this.runTest("testBooleanCellCustomImage");
      }

      this.getRoot().add(this.topContainer, {edge : 5});
    },


    runTest : function(testName)
    {
      this.setUp();
      this[testName]();
      //this.tearDown();
    },


    setUp : function()
    {
      this.container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      this.topContainer.add(this.container);
    },


    tearDown : function() {
      this.container.destroy();
    },


    testStringCell : function()
    {
      var cellData = {
        value : ["Juhu", "<b>HTML</b>", "", null],
        states : [{}, {selected: 1}]
      }
      var stringCell = new qx.ui.virtual.cell.String;

      qx.util.Permutation.permute(cellData, function(cellData)
      {
        var cell = this.__renderCell(stringCell, cellData.value, cellData.states);
        this.container.add(cell);
      }, this);
    },


    testNumberCell : function()
    {
      var cellData = {
        value : [-1.666666, 0, null],
        format : [
          null,
          new qx.util.format.NumberFormat().set({
            maximumFractionDigits : 2
          })
        ],
        states : [{}, {selected: 1}]
      }
      var cellRenderer = new qx.ui.virtual.cell.Number();

      qx.util.Permutation.permute(cellData, function(cellData)
      {
        if (cellData.format) {
          cellRenderer.setNumberFormat(cellData.format)
        } else {
          cellRenderer.resetNumberFormat();
        }
        var cell = this.__renderCell(cellRenderer, cellData.value, cellData.states);
        this.container.add(cell);
      }, this);
    },


    testDateCell : function()
    {
      var cellData = {
        value : [new Date(), null],
        format : [
          null,
          new qx.util.format.DateFormat(qx.locale.Date.getDateFormat("medium"))
        ],
        states : [{}, {selected: 1}]
      }
      var cellRenderer = new qx.ui.virtual.cell.Date();

      qx.util.Permutation.permute(cellData, function(cellData)
      {
        if (cellData.format) {
          cellRenderer.setDateFormat(cellData.format)
        } else {
          cellRenderer.resetDateFormat();
        }
        var cell = this.__renderCell(cellRenderer, cellData.value, cellData.states);
        this.container.add(cell);
      }, this);
    },


    testHtmlCell : function()
    {
      var cellData = {
        value : ["Juhu", "<b>HTML</b>", "", null],
        states : [{}, {selected: 1}]
      }
      var cellRenderer = new qx.ui.virtual.cell.Html;

      qx.util.Permutation.permute(cellData, function(cellData)
      {
        var cell = this.__renderCell(cellRenderer, cellData.value, cellData.states);
        this.container.add(cell);
      }, this);
    },


    testImageCell : function()
    {
      var cellData = {
        value : [
          {
            url : "icon/16/apps/internet-feed-reader.png",
            tooltip : "This is a feed reader!"
          },
          {
            url : "icon/32/apps/utilities-notes.png",
            tooltip : "foobar!"
          },
          null
        ],
        states : [{}, {selected: 1}]
      }
      var cellRenderer = new qx.ui.virtual.cell.Image;

      qx.util.Permutation.permute(cellData, function(cellData)
      {
        var cell = this.__renderCell(cellRenderer, cellData.value, cellData.states);
        this.container.add(cell);
      }, this);
    },


    testBooleanCell : function()
    {
      var cellData = {
        value : [true, false, null],
        states : [{}, {selected: 1}]
      }
      var cellRenderer = new qx.ui.virtual.cell.Boolean;

      qx.util.Permutation.permute(cellData, function(cellData)
      {
        var cell = this.__renderCell(cellRenderer, cellData.value, cellData.states);
        this.container.add(cell);
      }, this);
    },


    testBooleanCellCustomImage : function()
    {
      var cellData = {
        value : [true, false, null],
        states : [{}, {selected: 1}]
      }
      var cellRenderer = new qx.ui.virtual.cell.Boolean;
      cellRenderer.setIconFalse("icon/16/emotes/face-sad.png");
      cellRenderer.setIconTrue("icon/16/emotes/face-smile.png");

      qx.util.Permutation.permute(cellData, function(cellData)
      {
        var cell = this.__renderCell(cellRenderer, cellData.value, cellData.states);
        this.container.add(cell);
      }, this);
    },


    __renderCell : function(cell, value, states)
    {
      var width = 100;
      var height = 30;

      var embed = new qx.ui.embed.Html().set({
        width: width,
        height: height,
        decorator : states.selected ? null : "main"
      });
//      decorator : states.selected ? "selected" : "main"


      var cellProperties = cell.getCellProperties(value, states);
      var insets = cellProperties.insets;

      var html = [
        "<div ",
        "style='",
        this._getCellSizeStyle(width, height, insets[0], insets[1]),
        cellProperties.style, "' ",
        "class='", cellProperties.classes, "' ",
        cellProperties.attributes, ">",
        cellProperties.content,
        "</div>"
      ].join("");

      embed.setHtml(html);
      return embed;
    },


    _getCellSizeStyle : function(width, height, insetX, insetY)
    {
      var style = "";
      if (qx.core.Environment.get("css.boxmodel") == "content")
      {
        width -= insetX;
        height -= insetY;
      }

      style += "width:" +  width + "px;";
      style += "height:" + height + "px;";

      return style;
    }
  }
});