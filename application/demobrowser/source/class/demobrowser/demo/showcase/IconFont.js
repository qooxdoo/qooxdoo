/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 GONICUS Gmbh, Germany, http://www.gonicus.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Cajus Pollmeier (cajus)

************************************************************************ */
/* ************************************************************************


************************************************************************ */

/**
 * This is the main application class of your custom application "showcase_i18n"
 *
 * @tag showcase
 *
 * @asset(demobrowser/demo/fonts/fontawesome-webfont*)
 * @asset(qx/icon/${qx.icontheme}/16/*)
 */
qx.Class.define("demobrowser.demo.showcase.IconFont",
{
  extend : qx.application.Standalone,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _table : null,
    _container : null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      this._initFont();

      /* Set locale to english to avoid language mix if browser locale is
       * non-english. */
      qx.locale.Manager.getInstance().setLocale("en");

      this._container = new qx.ui.window.Window("Icon table for FontAwesome", "icon/16/apps/office-spreadsheet.png").set({
        width: 600,
        height: 400,
        contentPadding : [ 0, 0, 0, 0 ],
        showClose: false,
        showMinimize: false
      });
      this._container.setLayout(new qx.ui.layout.VBox());
      this._container.open();

      this.getRoot().add(this._container, {left: 50, top: 10});

      this._table = this._createTable();

      this._container.add(this._table, {flex: 1});
    },

    _createTable : function()
    {
      // table model
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "Unicode", "Glyph", "Image" ]);

      var res = qx.$$resources;

      var rowData = [];
      for (var key in res) {
        if (res.hasOwnProperty(key) && key.startsWith("@FontAwesome/")) {
          rowData.push([ "0x" + res[key][2].toString(16), key.split("/")[1], key]);
        }
      }

      tableModel.setData(rowData);

      var table = new qx.ui.table.Table(tableModel);
      var renderer = new qx.ui.table.cellrenderer.Image(16, 16);
      table.getTableColumnModel().setDataCellRenderer(2, renderer);

      return table;
    },

    _initFont : function()
    {
      var currentFont = qx.theme.manager.Font.getInstance().getTheme();

      // Add font definitions
      var config = {
        fonts: {
          "FontAwesome": {
            size: 40,
            lineHeight: 1,
            comparisonString : "\uf1e3\uf1f7\uf11b\uf19d",
            family: ["FontAwesome"],
            sources: [
              {
                family: "FontAwesome",
                source: [
                  "demobrowser/demo/fonts/fontawesome-webfont.ttf" , "demobrowser/demo/fonts/fontawesome-webfont.woff", "demobrowser/demo/fonts/fontawesome-webfont.woff2", "demobrowser/demo/fonts/fontawesome-webfont.eot"
                ]
              }
            ]
          }
        }
      };

      qx.Theme.define("demobrowser.theme.icon.Font", config);
      qx.Theme.include(currentFont, demobrowser.theme.icon.Font);
    }
  },

  destruct : function() {
    this._disposeObjects("_table", "_container");
  }
});

