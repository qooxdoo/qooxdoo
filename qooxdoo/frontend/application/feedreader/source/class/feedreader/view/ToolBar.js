/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("feedreader.view.ToolBar",
{
  extend : qx.ui.toolbar.ToolBar,
  
  construct : function()
  {
    this.base(arguments);
    
    // define commands
    var reload_cmd = new qx.client.Command("Control+R");
    reload_cmd.addEventListener("execute", this._fetchFeeds, this);

    var about_cmd = new qx.client.Command("F1");
    about_cmd.addEventListener("execute", this._showAboutWindow, this);

    // create toolbar
    this.setBorder("line-bottom");
    
    
    var addBtn = new qx.ui.toolbar.Button(this.tr("Add feed"), "icon/16/actions/dialog-ok.png");
    this.add(addBtn);
    
    var removeBtn = new qx.ui.toolbar.Button(this.tr("Remove feed"), "icon/16/actions/dialog-cancel.png");
    this.add(removeBtn);
    
    this.add(new qx.ui.toolbar.Separator());

    var reload_btn = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/16/actions/view-refresh.png");
    reload_btn.setCommand(reload_cmd);
    reload_btn.setToolTip(new qx.ui.popup.ToolTip(this.tr("(%1) Reload the feeds.", reload_cmd.toString())));
    this.add(reload_btn);
    
    this.add(new qx.ui.toolbar.Separator());

    var pref_btn = new qx.ui.toolbar.Button(this.tr("Preferences"), "icon/16/apps/preferences.png");
    pref_btn.addEventListener("execute", this.showPreferences, this);
    pref_btn.setToolTip(new qx.ui.popup.ToolTip(this.tr("Open preferences window.")));
    this.add(pref_btn);

    this.add(new qx.ui.basic.HorizontalSpacer());

    // poulate languages menu and add it to the toolbar
    var locales =
    {
      en : this.tr("English"),
      de : this.tr("German"),
      en : this.tr("English"),
      tr : this.tr("Turkish"),
      it : this.tr("Italian"),
      es : this.tr("Spanish"),
      sv : this.tr("Swedish"),
      ru : this.tr("Russian")
    };

    var availableLocales = qx.locale.Manager.getInstance().getAvailableLocales();
    var locale = qx.locale.Manager.getInstance().getLocale();
    var lang_menu = new qx.ui.menu.Menu();
    var radioManager = new qx.ui.selection.RadioManager("lang");

    for (var lang in locales)
    {
      if (availableLocales.indexOf(lang) == -1) {
        continue;
      }

      var menuButton = new qx.ui.menu.RadioButton(locales[lang], null, locale == lang);
      menuButton.setUserData("locale", lang);
      lang_menu.add(menuButton);
      radioManager.add(menuButton);
    }

    radioManager.addEventListener("changeSelected", function(e)
    {
      var lang = e.getValue().getUserData("locale");
      qx.locale.Manager.getInstance().setLocale(lang);
    });

    lang_menu.addToDocument();
    this.add(new qx.ui.toolbar.MenuButton("", lang_menu, "feedreader/images/locale.png"));

    var about_btn = new qx.ui.toolbar.Button(this.tr("Help"), "icon/16/actions/help-about.png");
    about_btn.setCommand(about_cmd);
    about_btn.setToolTip(new qx.ui.popup.ToolTip("(" + about_cmd.toString() + ")"));
    this.add(about_btn);
  },

  members :
  {




  }
});
