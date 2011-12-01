/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/fonts/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.WebFonts",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      // The font configuration would normally be defined in the application's
      // font theme ($APPLICATION.theme.Font).
      var fontsConfig =
      {
        "webFont0" :
        {
          size: 16,
          family: ["sans-serif"],
          sources:
          [
            {
              family : "FinelinerScriptRegular",
              source:
              [
                "demobrowser/demo/fonts/fineliner_script-webfont.eot",
                "demobrowser/demo/fonts/fineliner_script-webfont.ttf",
                "demobrowser/demo/fonts/fineliner_script-webfont.woff"
              ]
            }
          ]
        },

        "webFont1" :
        {
          size: 13,
          family: ["sans-serif"],
          sources:
          [
            {
              family : "ToBeContinuedRegular",
              source:
              [
                "demobrowser/demo/fonts/tobec___-webfont.eot",
                "demobrowser/demo/fonts/tobec___-webfont.ttf",
                "demobrowser/demo/fonts/tobec___-webfont.woff"
              ]
            }
          ]
        },

        "webFont2" :
        {
          size: 16,
          family: ["sans-serif"],
          sources:
          [
            {
              family : "YanoneKaffeesatzRegular",
              source:
              [
                "demobrowser/demo/fonts/yanonekaffeesatz-regular-webfont.eot",
                "demobrowser/demo/fonts/yanonekaffeesatz-regular-webfont.ttf",
                "demobrowser/demo/fonts/yanonekaffeesatz-regular-webfont.woff"
              ]
            }
          ]
        }
      };

      var createdFonts = {};
      for (var key in fontsConfig) {
        createdFonts[key] = new qx.bom.webfonts.WebFont().set(fontsConfig[key]);
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      var demoTextShort = "The quick brown fox jumps over the lazy dog";
      var demoTextLong = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
      + "Nam lectus justo, porttitor ac, ullamcorper ac, cursus in, ante. Duis mi ante,"
      + "sodales in, auctor vel, vehicula eget, sapien. Proin iaculis dui vitae leo. "
      + "Integer blandit tempus leo. Morbi turpis. Suspendisse turpis. Nulla eget leo."
      + "Cras interdum sollicitudin ante. Sed placerat scelerisque magna. Vestibulum "
      + "rutrum nibh a eros. Cum sociis natoque penatibus et magnis dis parturient "
      + "montes, nascetur ridiculus mus."
      var textWidgets = [];

      var mainContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      this.getRoot().add(mainContainer, {edge : 10});

      var menuContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
      mainContainer.add(menuContainer);

      var menuLabel = new qx.ui.basic.Label("Select Font");
      menuLabel.setFont("bold");
      menuContainer.add(menuLabel);

      var fontMenu = new qx.ui.form.SelectBox();
      fontMenu.setMinWidth(300);
      for (var key in createdFonts) {
        var item = new qx.ui.form.ListItem(createdFonts[key].getFamily()[0]);
        item.getChildControl("label").setFont(createdFonts[key]);
        item.setUserData("fontId", key);
        fontMenu.add(item);
      }
      fontMenu.addListener("changeSelection", function(ev) {
        var value = ev.getData()[0];
        var fontId = value.getUserData("fontId");
        for (var i=0, l=textWidgets.length; i<l; i++) {
          textWidgets[i].setFont(createdFonts[fontId]);
        }
      }, this);
      menuContainer.add(fontMenu);

      var widgetContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      mainContainer.add(widgetContainer);
      var label = new qx.ui.basic.Label(demoTextShort);
      textWidgets.push(label);
      label.setFont(createdFonts.webFont0);
      widgetContainer.add(label);

      var field = new qx.ui.form.TextField(demoTextShort);
      textWidgets.push(field);
      field.setFont(createdFonts.webFont0);
      widgetContainer.add(field);

      var area = new qx.ui.form.TextArea(demoTextLong);
      textWidgets.push(area);
      area.setFont(createdFonts.webFont0);
      widgetContainer.add(area);
    }
  }
});
