/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The feed reader preference window
 *
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
 * @asset(qx/icon/${qx.icontheme}/16/apps/preferences-theme.png)
 * @asset(qx/icon/${qx.icontheme}/16/apps/preferences-display.png)
 * @asset(qx/icon/${qx.icontheme}/16/apps/preferences-locale.png)
 */
qx.Class.define("feedreader.view.desktop.PreferenceWindow",
{
  extend : qx.ui.window.Window,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, this.tr("Preferences"), "icon/16/apps/preferences-theme.png");

    // set the properties of the window
    this.set(
    {
      modal         : true,
      showMinimize  : false,
      showMaximize  : false,
      allowMaximize : false
    });

    // Create the content with a helper
    this._addContent();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adds the content of the window.
     */
    _addContent : function()
    {
      // Set the layout of the window
      var windowLayout = new qx.ui.layout.VBox(10);
      this.setLayout(windowLayout);
      this.setMinWidth(350);

      // Create and add a groupbox
      var groupBox = new qx.ui.groupbox.GroupBox(this.tr("Language"), "icon/16/apps/preferences-locale.png");
      groupBox.setMinWidth(150);
      groupBox.setLayout(new qx.ui.layout.VBox());
      this.add(groupBox);

      // Create radio manager
      var radioManager = new qx.ui.form.RadioGroup();
      var resetter = new qx.ui.form.Resetter();

      // Create the radio buttons for the languages
      var languages = { "en" : "English",
                        "cs" : "Češka",
                        "de" : "Deutsch",
                        "es" : "Español",
                        "fr" : "Français",
                        "it" : "Italiano",
                        "nl" : "Nederlands",
                        "ro" : "Română",
                        "sv" : "Svenska" };

      var localeManager = qx.locale.Manager.getInstance();

      // Check for a mismatch of available and used locales
      if (qx.core.Environment.get("qx.debug"))
      {
        var availableLocales = localeManager.getAvailableLocales(true).sort().join(", ");
        var usedLocales = Object.keys(languages).sort().join(", ");

        if(availableLocales !== usedLocales)
        {
          this.warn("Mismatch of locales: \navailable: " + availableLocales +
            "\nused     : " + usedLocales);
        }
      }

      var radioButton;
      for (var lang in languages )
      {
        radioButton = new qx.ui.form.RadioButton(languages[lang]);
        radioButton.setUserData("language", lang);

        // add to radioManager and groupBox
        radioManager.add(radioButton);
        groupBox.add(radioButton);

        // Select entry containing current language
        if (localeManager.getLanguage() == lang) {
          radioManager.setSelection([radioButton]);
        }

        resetter.add(radioButton);
      }


      // Theme switch
      var groupBox = new qx.ui.groupbox.GroupBox(this.tr("Theme"), "icon/16/apps/preferences-display.png");
      groupBox.setMinWidth(150);
      groupBox.setLayout(new qx.ui.layout.VBox());
      this.add(groupBox);

      // Create radio manager
      var themeRadioManager = new qx.ui.form.RadioGroup();
      var themeResetter = new qx.ui.form.Resetter();

      var themes = {
        "Indigo" : qx.theme.Indigo,
        "Simple" : qx.theme.Simple,
        "Modern" : qx.theme.Modern,
        "Classic" : qx.theme.Classic
      };

      for (var name in themes) {
        radioButton = new qx.ui.form.RadioButton(name);
        radioButton.setUserData("theme", themes[name]);
        groupBox.add(radioButton);
        themeRadioManager.add(radioButton);
        themeResetter.add(radioButton);
      }

      // add the button bar
      var buttonBarLayout = new qx.ui.layout.HBox(10, "right");
      var buttonBar = new qx.ui.container.Composite(buttonBarLayout);

      var cancelButton = new qx.ui.form.Button(this.tr("Cancel"), "icon/16/actions/dialog-cancel.png");
      cancelButton.addListener("execute", function() {
        resetter.reset();
        themeResetter.reset();
        this.close();
      }, this);

      var okButton = new qx.ui.form.Button(this.tr("OK"), "icon/16/actions/dialog-ok.png");
      okButton.addListener("execute", function(e) {
        // set the current selected radio button as the new value to reset to
        resetter.redefine();
        themeResetter.redefine();

        // change language
        var selectedLanguage = radioManager.getSelection()[0].getUserData("language");
        qx.io.PartLoader.require([selectedLanguage], function ()
        {
          qx.locale.Manager.getInstance().setLocale(selectedLanguage);
        }, this);

        // change theme
        var selectedThemeRadio = themeRadioManager.getSelection()[0];
        qx.theme.manager.Meta.getInstance().setTheme(selectedThemeRadio.getUserData("theme"));

        this.close();
      }, this);

      buttonBar.add(cancelButton);
      buttonBar.add(okButton);

      this.add(buttonBar);
    }
  }
});
