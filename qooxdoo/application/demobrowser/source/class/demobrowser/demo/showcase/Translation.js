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
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/**
 * This is the main application class of your custom application "showcase_i18n"
 *
 * @tag showcase
 */
qx.Class.define("demobrowser.demo.showcase.Translation",
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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }


      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(8, 8));
      this.getRoot().add(container, {top: 20, left: 20});

      // Choose Locale
      container.add(new qx.ui.basic.Label("Choose Locale:"), {row: 0, column: 0});

      var localeManager = qx.locale.Manager.getInstance();
      var locales = localeManager.getAvailableLocales().sort();
      var currentLocale = localeManager.getLocale();

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

      container.add(select, {row:0,column:1});

      // Simple Translate
      var b1 = new qx.ui.form.Button("Hello World");
      container.add(b1, {row:1,column:0});
      var l1 = new qx.ui.form.TextField();
      container.add(l1, {row:1, column:1});
      b1.addListener("execute", function (e)
      {
        l1.setValue(this.tr("Hello World"));
      }, this);


      // Plural Translate 1
      var b2 = new qx.ui.form.Button("I have an apple (using singular)");
      container.add(b2, {row:2,column:0});
      var l2 = new qx.ui.form.TextField();
      container.add(l2, {row:2, column:1});
      b2.addListener("execute", function (e)
      {
        l2.setValue(this.trn("I have an apple", "I have %1 apples", 1, this.tr("two")));
      }, this);


      // Plural Translate 2
      var b3 = new qx.ui.form.Button("I have an apple (using plural)");
      container.add(b3, {row:3,column:0});
      var l3 = new qx.ui.form.TextField();
      container.add(l3, {row:3, column:1});
      b3.addListener("execute", function (e)
      {
        l3.setValue(this.trn("I have an apple", "I have %1 apples", 2, this.tr("two")));
      }, this);


      // Translate with .po comment
      var b4 = new qx.ui.form.Button("The quick brown fox (with .po comment)");
      container.add(b4, {row:4,column:0});
      var l4 = new qx.ui.form.TextField();
      container.add(l4, {row:4, column:1});
      b4.addListener("execute", function (e)
      {
        l4.setValue(this.trc("The mammal fox that is.", "The quick brown fox"));
      }, this);

      // Mark the string "Orange" for later translation so we do not forget it
      // also we could grep for marktr calls and get them all for translation
      var b5 = new qx.ui.form.Button("Marktr Orange");
      container.add(b5, {row:5,column:0});
      var l5 = new qx.ui.form.TextField();
      container.add(l5, {row:5, column:1});
      b5.addListener("execute", function (e)
      {
        l5.setValue(this.marktr("Orange"));
      }, this);

      // Listening on locale change and act on it
      // show locale and territory
      var l6 = new qx.ui.basic.Label('Locale and territory');
      container.add(l6, {row:1, column:3});
      qx.locale.Manager.getInstance().addListener("changeLocale", function() {
        l6.setValue('Locale: '+qx.locale.Manager.getInstance().getLocale() + ' territory: ' + qx.locale.Manager.getInstance().getTerritory());
      }, this);

      return;
    }
  }

});

