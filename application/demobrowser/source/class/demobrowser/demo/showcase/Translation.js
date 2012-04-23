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
     * @lint ignoreDeprecated(alert)
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


      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(8, 8));
      this.getRoot().add(container, {top: 20, left: 20});

      var part0Label = new qx.ui.basic.Label("<b>Locale and language:</b>");
      part0Label.setRich(true);
      container.add(part0Label, {row: 0,column: 0, colSpan: 3});

      // Choose Locale
      var l0 = new qx.ui.basic.Label("Choose Locale:");
      l0.setMarginTop(5);
      l0.setAlignY('middle');
      container.add(l0, {row: 1, column: 0});

      var localeManager = qx.locale.Manager.getInstance();
      var locales = localeManager.getAvailableLocales().sort();
      var currentLocale = localeManager.getLocale();

      var select = new qx.ui.form.SelectBox();
      select.setAllowGrowY(false);
      select.setAlignY('middle');
      var defaultListItem = null;

      for (var i=0; i<locales.length; i++)
      {
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

      container.add(select, {row: 1, column: 1});

      // Listening on locale change and act on it
      // show locale and territory
      var l1 = new qx.ui.basic.Label('Locale');
      l1.setMarginTop(5);
      l1.setWidth(80);
      var l2 = new qx.ui.basic.Label('Territory');
      l2.setMarginTop(5);
      l2.setWidth(80);
      var l3 = new qx.ui.basic.Label('Language');
      l3.setMarginTop(5);
      l3.setWidth(80);

      var infoContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(3));
      infoContainer.add(l1);infoContainer.add(l2);infoContainer.add(l3);
      container.add(infoContainer, {row: 1, column: 2});

      qx.locale.Manager.getInstance().addListener("changeLocale", function()
      {
        var manager = qx.locale.Manager.getInstance();
        l1.setValue('Locale: '+manager.getLocale());
        l2.setValue('Territory: ' + manager.getTerritory());
        l3.setValue('Language: '+manager.getLanguage());
        translateLabels.apply(this);
        addTrLabel.setValue("Add translation<br>at runtime for: <b>"+localeManager.getLocale() +"</b>");
      }, this);

      function translateLabels()
      {
        // strings here must be present in the .po files in order to get translated.
        translation1.setValue(this.tr("Hello World"));
        translation1.setToolTipText("Simple Translate: this.tr('Hello World')");
        var applesNumber = parseInt(numberOfApples.getSelection()[0].getLabel());
        translation2.setValue(this.trn("I have an apple", "I have %1 apples", applesNumber, applesNumber));
        translation2.setToolTipText("Singular/Plural Translate: this.trn('I have an apple', I have %1 apples, " + applesNumber + ", applesNumber)");
        translation3.setValue(this.trc("The mammal fox that is.", "The quick brown fox"));
        translation3.setToolTipText("with .po comment: this.trc('The mammal fox that is.', 'The quick brown fox')");
        translation4.setValue(this.marktr("Orange"));
        translation4.setToolTipText("Mark the string 'Orange' for later translation so we do not forget it: this.marktr('Orange')");
        var messageId = showMessageId.getValue();
        if(messageId && messageId.length>0) {
          showTrLabel.setValue(localeManager.translate(messageId,[],localeManager.getLocale()));
        }
      }

      var part1Label = new qx.ui.basic.Label("<b>Static translation [found in .po files]. Hover the labels below to see more info.</b>");
      part1Label.setRich(true);
      part1Label.setMarginTop(15);
      container.add(part1Label, {row: 2,column: 0, colSpan: 4});

      var column1Header = new qx.ui.basic.Label("<i>MessageId</i>");
      column1Header.setRich(true);
      container.add(column1Header, {row: 3,column: 1});

      var column2Header = new qx.ui.basic.Label("<i>Translated Text</i>");
      column2Header.setRich(true);
      container.add(column2Header, {row: 3,column: 2});

      var translation1MId = new qx.ui.basic.Label("Hello World");
      container.add(translation1MId, {row: 4,column: 1});

      // Simple Translate
      var translation1 = new qx.ui.basic.Label(this.tr("Hello World"));
      container.add(translation1, {row: 4,column: 2});

      var translation1Info = new qx.ui.basic.Label("Simple messageId translation");
      container.add(translation1Info, {row: 4,column: 3});

      // Singular/Plural Translate
      var appleNumberSelectBoxLabel = new qx.ui.basic.Label("Number of apples:");
      appleNumberSelectBoxLabel.setAlignX('right');
      appleNumberSelectBoxLabel.setAlignY('bottom');
      container.add(appleNumberSelectBoxLabel, {row: 5,column: 0});

      var numberOfApples = new qx.ui.form.SelectBox();
      for (var i=1; i<5; i++)
      {
        var tempItem = new qx.ui.form.ListItem(i + "");
        numberOfApples.add(tempItem);
      }
      numberOfApples.setToolTipText("Number of apples");
      numberOfApples.setAlignY('top');
      numberOfApples.setAlignX('right');
      container.add(numberOfApples, {row: 6, column: 0});

      var translation2MId = new qx.ui.basic.Label("I have an apple");
      translation2MId.setAlignY('middle');
      container.add(translation2MId, {row: 5, column: 1, rowSpan: 2});

      var translation2 = new qx.ui.basic.Label(this.trn("I have an apple", "I have %1 apples", 1, 1));
      translation2.setAlignY('middle');
      container.add(translation2, {row: 5, column: 2, rowSpan: 2});

      var translation2Info = new qx.ui.basic.Label("Singular/Plural Translate<br>Choose a number from the select box<br>to see plural translation");
      translation2Info.setAlignY('middle');
      translation2Info.setRich(true);
      container.add(translation2Info, {row: 5,column: 3, rowSpan: 2});

      numberOfApples.addListener("changeSelection", function(e)
      {
        translateLabels.apply(this);
      });

      var translation3MId = new qx.ui.basic.Label("The quick brown fox");
      container.add(translation3MId, {row: 7, column: 1});

      // Translate with .po comment
      var translation3 = new qx.ui.basic.Label(this.trc("The mammal fox that is.", "The quick brown fox"));
      translation3.setWidth(140);
      container.add(translation3, {row: 7, column: 2});

      var translation3Info = new qx.ui.basic.Label("A comment: 'The mammal fox that is.'<br>is added in the .po file");
      translation3Info.setRich(true);
      container.add(translation3Info, {row: 7,column: 3});

      var translation4MId = new qx.ui.basic.Label("Orange");
      container.add(translation4MId, {row: 8, column: 1});

      // Mark the string "Orange" for later translation so we do not forget it
      // also we could grep for marktr calls and get them all for translation
      var translation4 = new qx.ui.basic.Label(this.marktr("Orange"));
      container.add(translation4, {row: 8, column: 2});

      var translation4Info = new qx.ui.basic.Label("Mark the string 'Orange' for later<br>translation so we do not forget it");
      translation4Info.setRich(true);
      container.add(translation4Info, {row: 8,column: 3});

      var part2Label = new qx.ui.basic.Label("<b>Dynamic translation. This is added at runtime.</b>");
      part2Label.setRich(true);
      part2Label.setMarginTop(15);
      container.add(part2Label, {row: 9,column: 0, colSpan: 3});

      var addTrLabel = new qx.ui.basic.Label("Add translation<br>at runtime for: <b>" + localeManager.getLocale() +"</b>");
      addTrLabel.setRich(true);
      addTrLabel.setWidth(120);
      container.add(addTrLabel, {row: 10,column: 0});
      var inputMessageId = new qx.ui.form.TextField("");
      inputMessageId.setToolTipText("MessageId");
      container.add(inputMessageId, {row: 10,column: 1});

      var inputDTranslation = new qx.ui.form.TextField("");
      inputDTranslation.setToolTipText("Translation");
      container.add(inputDTranslation, {row: 10,column: 2});

      var addTranslationButton = new qx.ui.form.Button("Add Translation");
      addTranslationButton.setAllowGrowY(false);
      container.add(addTranslationButton, {row: 10,column: 3});
      addTranslationButton.addListener("execute", function (e)
      {
        var map = {};
        map[inputMessageId.getValue()] = inputDTranslation.getValue();
        localeManager.addTranslation(localeManager.getLocale(),map);
        alert(inputDTranslation.getValue() + " has been added for messageId: " + inputMessageId.getValue() + " for locale: " + localeManager.getLocale());
      }, this);

      var showLabel = new qx.ui.basic.Label("MessageId:");
      container.add(showLabel, {row: 11,column: 0});

      var showMessageId = new qx.ui.form.TextField("");
      showMessageId.setToolTipText("MessageId");
      container.add(showMessageId, {row: 11,column: 1});

      var showTranslationButton = new qx.ui.form.Button("show Translation");
      container.add(showTranslationButton, {row: 11,column: 2});
      showTranslationButton.setAllowGrowY(false);
      showTranslationButton.addListener("execute", function (e)
      {
        var messageId = showMessageId.getValue();
        showTrLabel.setValue(localeManager.translate(messageId,[],localeManager.getLocale()));
      }, this);

      var showTrLabel = new qx.ui.basic.Label("click 'Show Translation' button to translate<br>the messageId in the current selected locale");
      showTrLabel.setRich(true);
      showTrLabel.setAlignY('middle');
      container.add(showTrLabel, {row: 11,column: 3});

      var addNewLocaleLabel = new qx.ui.basic.Label("Add new Locale<br> at runtime");
      addNewLocaleLabel.setRich(true);
      container.add(addNewLocaleLabel, {row: 12,column: 0});
      var inputNewLocaleName = new qx.ui.form.TextField("");
      inputNewLocaleName.setPlaceholder("en_QX");
      inputNewLocaleName.setToolTipText("Locale Name (ex: en_QX)");
      container.add(inputNewLocaleName, {row: 12,column: 1});

      var addNewLocaleButton = new qx.ui.form.Button("Add new Locale");
      addNewLocaleButton.setAllowGrowY(false);
      container.add(addNewLocaleButton, {row: 12,column: 2});
      addNewLocaleButton.addListener("execute", function (e)
      {
        var newLocaleName = inputNewLocaleName.getValue();
        if(newLocaleName!=null && newLocaleName.length<1)
        {
          alert("new Locale must not be empty string");
          return;
        }
        var locales = localeManager.getAvailableLocales();
        if(locales.indexOf(newLocaleName)!=-1)
        {
          alert(newLocaleName + " already exists");
        }
        else
        {
          localeManager.addTranslation(newLocaleName,{"demo": "demo"});
          alert(newLocaleName + " has been added");
          select.add(new qx.ui.form.ListItem(newLocaleName));
        }

      }, this);


      if (defaultListItem) {
        select.setSelection([defaultListItem]);
      }

      // data binding between the 2 text fields
      inputMessageId.bind("value", showMessageId, "value");
      showMessageId.bind("value", inputMessageId, "value");

      return;
    }
  }

});

