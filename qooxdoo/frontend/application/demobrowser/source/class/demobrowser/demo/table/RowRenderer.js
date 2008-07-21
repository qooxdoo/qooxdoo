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

qx.Class.define("demobrowser.demo.table.RowRenderer",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.setUp();

      this.testDefaultRenderer();
    },


    setUp : function()
    {
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

      qx.theme.manager.Font.getInstance().setTheme(qx.theme.classic.Font);
      qx.theme.manager.Color.getInstance().setTheme(qx.theme.classic.Color);
    },


    testDefaultRenderer : function(renderer)
    {
      var renderer = new qx.ui.table.rowrenderer.Default();
      var width = 300;
      var height = 20;

      var rowDataOptions =
      {
        focusedRow : [true, false],
        selected : [true, false],
        row : [1,2],
        table : [this.tableMock]
      }

      var container = this._getNewTableDiv(width)
      var top = 0;
      var self = this;
      this.permute(rowDataOptions, function(rowInfo)
      {
        var content = [];
        for (var key in rowInfo) {
          if (key !== "table") {
            content.push(key + ": " + rowInfo[key]);
          }
        }
        content = content.join(", ");

        // update
        var row = self._createRowElement(container, width, height);
        var rowClass = renderer.getRowClass(rowInfo);
        if (rowClass) {
          row.className =  rowClass;
        }
        row.innerHTML = content + " (update)";
        renderer.updateDataRowElement(rowInfo, row);

        // init
        rowHtml = [];
        rowHtml.push('<div ');

        if (rowClass) {
          rowHtml.push('class="', rowClass, '" ');
        }

        var rowStyle = renderer.createRowStyle(rowInfo);
        rowStyle += ";position:relative;height:" + height + "px; width:" + width + "px;";
        if (rowStyle) {
          rowHtml.push('style="', rowStyle, '" ');
        }
        rowHtml.push('>', content, ' (init)</div>');
        console.log(rowHtml.join(""))
        container.innerHTML += rowHtml.join("");
        self._rowTop += height;

      });
    },


    _rowTop : 0,
    _createRowElement : function(parent, width, height)
    {
      var div = qx.bom.Element.create("div");
      qx.bom.element.Style.setStyles(div, {
        position : "relative",
        width: width + "px",
        height: height + "px"
      });
      this._rowTop += 20;
      parent.appendChild(div);
      return div;

    },

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