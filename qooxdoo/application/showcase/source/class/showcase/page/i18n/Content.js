/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/edit-*.png)

************************************************************************ */

qx.Class.define("showcase.page.i18n.Content",
{
  extend : showcase.AbstractContent,
  include : qx.locale.MTranslation,


  construct : function(page)
  {
    this.base(arguments, page);
    this.setView(this._createView());
  },


  members :
  {
    __locales: null,
    __controller : null,

    _createView : function()
    {
      var layout = new qx.ui.layout.Grid(10, 15);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(1, 1);
      var container = new qx.ui.container.Composite(layout).set({
        padding: 10
      });

      container.add(this.__createButtons(), {row: 0, column:0, colSpan: 2});
      container.add(this.__createControls(), {row: 1, column: 0});
      container.add(this.__createTable(), {row: 1, column: 1});

      return container;
    },


    __createButtons : function()
    {
      var group = new qx.ui.form.RadioButtonGroup(new qx.ui.layout.HBox(10).set({
        alignX: "center"
      }));

      var locales = this.__locales = qx.data.marshal.Json.createModel([
        {
          language: "en",
          selected: null,
          countries: [
            {code: "US", name: "United States"},
            {code: "GB", name: "Great Britain"}
          ]
        },
        {
          language: "es",
          selected: null,
          countries: [
            {code: "ES", name: "Spain"},
            {code: "MX", name: "Mexico"}
          ]
        },
        {
          language: "de",
          selected: null,
          countries: [
            {code: "DE", name: "Germany"},
            {code: "AT", name: "Austria"}
          ]
        },
        {
          language: "sv",
          selected: null,
          countries: [{code: "SE", name: "Sweden"}]
        },
        {
          language: "ro",
          selected: null,
          countries: [{code: "RO", name: "Romania"}]
        }
      ]);

      for (var i=0; i<locales.getLength(); i++) {
        locales.getItem(i).setSelected(locales.getItem(i).getCountries().getItem(0));
      }

      var controller = new qx.data.controller.List(null, group, "language");
      this.__controller = controller;
      controller.setDelegate({
        createItem : function() {
          return new qx.ui.form.RadioButton().set({
            show: "icon",
            appearance: "button"
          });
        }
      });
      controller.setIconPath("language");
      controller.setIconOptions({
        converter : function(value) {
          return "showcase/i18n/" + value + ".png";
        }
      });
      controller.setModel(locales);
      controller.getSelection().push(locales.getItem(0));

      this.__controller.bind("selection[0].selected.code", this, "country");

      return group;
    },


    setCountry : function(country)
    {
      if (country)
      {
        var selection = this.__controller.getSelection().getItem(0);
        var countries = selection.getCountries();
        // check if the country is valid for the selected language
        var validCountry = false;
        for (var i = 0; i < countries.getLength(); i++)
        {
          if (countries.getItem(i).getCode() == country)
          {
            validCountry = true;
            break;
          }
        };
        if (!validCountry) {
          return;
        }

        var language = selection.getLanguage();
        qx.locale.Manager.getInstance().setLocale(language + "_" + country);
      }
    },


    __createControls : function()
    {
      var grid = new qx.ui.layout.Grid(10,10);
      grid.setColumnFlex(0, 1);
      grid.setColumnFlex(1, 1);
      grid.setColumnAlign(0, "right", "middle");

      var controls = new qx.ui.groupbox.GroupBox(this.tr("Form Elements")).set({
        width: 0,
        minWidth: 0
      });
      controls.setLayout(grid);

      controls.add(new qx.ui.basic.Label(this.tr("Territory code:")), {row: 0, column: 0});
      var country = new qx.ui.form.SelectBox();
      var controller = new qx.data.controller.List(null, country, "name");
      this.__controller.bind("selection[0].countries", controller, "model");

      this.__controller.bind("selection[0].selected", controller, "selection[0]");
      controller.bind("selection[0]", this.__controller, "selection[0].selected");

      controls.add(country, {row: 0, column: 1});

      controls.add(new qx.ui.basic.Label(this.tr("Localized ComboBox:")), {row: 1, column: 0});

      var s2 = new qx.ui.form.ComboBox();
      s2.add(new qx.ui.form.ListItem(this.tr("Cut")));
      s2.add(new qx.ui.form.ListItem(this.tr("Paste")));
      s2.add(new qx.ui.form.ListItem(this.tr("Copy")));

      controls.add(s2, {row:1,column:1});



      // DateChooserButton
      var l1 = new qx.ui.basic.Label(this.tr("A date:"));
      controls.add(l1,{row:2,column:0});

      var tf1 = new qx.ui.form.DateField();
      tf1.setValue(new Date);
      controls.add(tf1,{row:2,column:1});

      // DateChooser
      var chooser = new qx.ui.control.DateChooser;
      controls.add(chooser,{row:3,column:0,colSpan:2});

      // Commands
      var undo_cmd = new qx.ui.core.Command("Ctrl+Z");
      var redo_cmd = new qx.ui.core.Command("Ctrl+Y");
      var cut_cmd = new qx.ui.core.Command("Ctrl+X");
      var copy_cmd = new qx.ui.core.Command("Ctrl+C");
      var paste_cmd = new qx.ui.core.Command("Ctrl+V");
      var delete_cmd = new qx.ui.core.Command("Del");
      var select_all_cmd = new qx.ui.core.Command("Ctrl+A");
      var search_cmd = new qx.ui.core.Command("Ctrl+F");
      var search_again_cmd = new qx.ui.core.Command("F3");

      var m1 = new qx.ui.menu.Menu;
      m1.add(new qx.ui.menu.Button(this.tr("Undo"), null, undo_cmd));
      m1.add(new qx.ui.menu.Button(this.tr("Redo"), null, redo_cmd));
      m1.add(new qx.ui.menu.Separator());
      m1.add(new qx.ui.menu.Button(this.tr("Cut"), "icon/16/actions/edit-cut.png", cut_cmd));
      m1.add(new qx.ui.menu.Button(this.tr("Copy"), "icon/16/actions/edit-copy.png", copy_cmd));
      m1.add(new qx.ui.menu.Button(this.tr("Paste"), "icon/16/actions/edit-paste.png", paste_cmd));
      m1.add(new qx.ui.menu.Button(this.tr("Delete"), "icon/16/actions/edit-delete.png", delete_cmd));
      m1.add(new qx.ui.menu.Button(this.tr("Select All"), null, select_all_cmd));
      m1.add(new qx.ui.menu.Separator());
      m1.add(new qx.ui.menu.Button(this.tr("Search"), null, search_cmd));
      m1.add(new qx.ui.menu.Button(this.tr("Search Again"), null, search_again_cmd));

      var w1 = new qx.ui.form.MenuButton(this.tr("Command Menu (keyboard shortcuts)"), null, m1);
      controls.add(w1,{row:4,column:0,colSpan:2});

      return controls;
    },


    __createTable : function()
    {
      var table = new qx.ui.groupbox.GroupBox(this.tr("Locale Information"), "icon/16/actions/edit-find.png").set({
        width: 0,
        minWidth: 0,
        allowGrowY: true
      });
      table.setLayout(new qx.ui.layout.Grow());

      var infoLabel = new qx.ui.basic.Label().set({
        rich: true,
        allowGrowX: true,
        allowGrowY: true
      });
      table.add(infoLabel);

      var info = [];
      info.push("<table id='i18n'><tr><td>");

      for (var i=0; i<15; i++)
      {
        info.push("");
        info.push("</td><td>");
        info.push("");
        info.push("</td></tr><td>");
      }

      info.push("");
      info.push("</td><td>");
      info.push("");
      info.push("</td></tr></table>");

      this.updateLocaleInformation = function()
      {
        var i = 0;
        info[(i++ * 2) + 1] = this.tr("Locale:");
        info[(i++ * 2) + 1] = qx.locale.Manager.getInstance().getLocale();

        info[(i++ * 2) + 1] = this.tr("Territory code:");
        info[(i++ * 2) + 1] = qx.locale.Manager.getInstance().getTerritory();

        info[(i++ * 2) + 1] = this.tr("Date format short:");
        info[(i++ * 2) + 1] = qx.locale.Date.getDateFormat("short");
        info[(i++ * 2) + 1] = this.tr("Date short:");
        info[(i++ * 2) + 1] = (new qx.util.format.DateFormat(qx.locale.Date.getDateFormat("short"))).format(new Date());

        info[(i++ * 2) + 1] = this.tr("Date format medium:");
        info[(i++ * 2) + 1] = qx.locale.Date.getDateFormat("medium");
        info[(i++ * 2) + 1] = this.tr("Date medium:");
        info[(i++ * 2) + 1] = (new qx.util.format.DateFormat(qx.locale.Date.getDateFormat("medium"))).format(new Date());

        info[(i++ * 2) + 1] = this.tr("Date format long:");
        info[(i++ * 2) + 1] = qx.locale.Date.getDateFormat("long");
        info[(i++ * 2) + 1] = this.tr("Date long:");
        info[(i++ * 2) + 1] = (new qx.util.format.DateFormat(qx.locale.Date.getDateFormat("long"))).format(new Date());

        info[(i++ * 2) + 1] = this.tr("Date format full:");
        info[(i++ * 2) + 1] = qx.locale.Date.getDateFormat("full");
        info[(i++ * 2) + 1] = this.tr("Date full:");
        info[(i++ * 2) + 1] = (new qx.util.format.DateFormat(qx.locale.Date.getDateFormat("full"))).format(new Date());

        info[(i++ * 2) + 1] = this.tr("Time format short:");
        info[(i++ * 2) + 1] = qx.locale.Date.getTimeFormat("short");
        info[(i++ * 2) + 1] = this.tr("Time short:");
        info[(i++ * 2) + 1] = (new qx.util.format.DateFormat(qx.locale.Date.getTimeFormat("short"))).format(new Date());

        info[(i++ * 2) + 1] = this.tr("Time format long:");
        info[(i++ * 2) + 1] = qx.locale.Date.getTimeFormat("long");
        info[(i++ * 2) + 1] = this.tr("Time long:");
        info[(i++ * 2) + 1] = (new qx.util.format.DateFormat(qx.locale.Date.getTimeFormat("long"))).format(new Date());

        info[(i++ * 2) + 1] = this.tr("Week start:");
        info[(i++ * 2) + 1] = qx.locale.Date.getDayName("wide", qx.locale.Date.getWeekStart());

        info[(i++ * 2) + 1] = this.tr("Format of %1:", 10000.12);
        info[(i++ * 2) + 1] = (new qx.util.format.NumberFormat()).format(10000.12);

        infoLabel.setValue(info.join(""));
      };

      // update info box
      qx.locale.Manager.getInstance().addListener("changeLocale", this.updateLocaleInformation, this);
      this.updateLocaleInformation();

      return table;
    }
  }
});