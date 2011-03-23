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
     * Fabian Jakobs (fjakobs)
     * Thomas Herchenroeder (thron7)

************************************************************************ */
/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "showcase_i18n"
 *
 * @tag showcase
 */
qx.Class.define("demobrowser.demo.showcase.Localization",
{
  extend : qx.application.Standalone,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if ((qx.core.Environment.get("qx.debug")))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }


      var grid = new qx.ui.layout.Grid(10,10);
      grid.setColumnFlex(0, 1);
      grid.setColumnFlex(1, 1);
      grid.setRowFlex(3, 1);
      grid.setColumnAlign(0, "right", "middle");

      var controls = new qx.ui.window.Window(this.tr("Form Elements")).set({
        showClose: false,
        showMinimize: false
      });
      controls.setLayout(grid);
      controls.moveTo(50,50);
      controls.open();

      var localeManager = qx.locale.Manager.getInstance();
      var locales = localeManager.getAvailableLocales().sort();
      var currentLocale = localeManager.getLocale();

      var l2 = new qx.ui.basic.Label(this.tr("Choose a locale:"));
      controls.add(l2, {row:0,column:0});

      var select = new qx.ui.form.SelectBox();
      var defaultListItem = null;

      for (var i=0; i<locales.length; i++) {
        var listItem =new qx.ui.form.ListItem(locales[i]);
        select.add(listItem);
        if ((!defaultListItem && locales[i] == "en") || locales[i] == currentLocale) {
          defaultListItem = listItem;
        }
      }

      select.addListener("changeSelection", function(e)
      {
        var locale = e.getData()[0].getLabel();
        qx.locale.Manager.getInstance().setLocale(locale);
      });

      if (defaultListItem) {
        select.setSelection([defaultListItem]);
      }

      controls.add(select, {row:0,column:1});

      controls.add(new qx.ui.basic.Label(this.tr("Localized ComboBox:")), {row:1,column:0});

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

      // ColorPopup
      var mypop = new qx.ui.control.ColorPopup();
      mypop.exclude();
      mypop.setValue("#23F3C1");

      var mybtn = new qx.ui.form.Button(this.tr("Open Color Popup"));
      mybtn.addListener("mousedown", function(e)
      {
        mypop.placeToMouse(e)
        mypop.show();
      });
      controls.add(mybtn, {row:5,column:0});

      var myview = new qx.ui.core.Widget().set({
        decorator : "main"
      });
      controls.add(myview, {row:5,column:1});

      mypop.addListener("changeValue", function(e) {
        myview.setBackgroundColor(e.getData());
      });


      // ColorSelector
      var colorWin = new qx.ui.window.Window("Colors").set({
        width: 400,
        showClose: false,
        showMinimize: false
      });
      colorWin.setLayout(new qx.ui.layout.Canvas());
      colorWin.moveTo(150, 300);
      colorWin.open();

      var mycolor = new qx.ui.control.ColorSelector;
      colorWin.add(mycolor);

      // Info Box
      var w2 = new qx.ui.window.Window("Locale Information", "icon/16/actions/edit-find.png").set({
        showClose: false,
        showMinimize: false
      });
      w2.setLayout(new qx.ui.layout.Grow());
      w2.moveTo(300, 150);
      w2.open();

      var fs = new qx.ui.groupbox.GroupBox(this.tr("Locale information"));
      fs.setLayout(new qx.ui.layout.Grow());
      w2.add(fs);


      var infoLabel = new qx.ui.basic.Label().set({
        rich: true,
        allowGrowX: true
      });
      fs.add(infoLabel);

      var info = [];
      info.push("<table style='font-size:11px'><tr><td>");

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
/*
      return main;
      //*/
    }
  }

});

