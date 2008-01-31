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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("feedreader.view.ToolBar",
{
  extend : qx.ui.toolbar.ToolBar,

  construct : function(controller)
  {
    this.base(arguments);

    // Apply style
    this.setBorder("line-bottom");

    // Link for controller
    this._controller = controller;

    // Define commands
    var reloadCmd = new qx.client.Command("Control+R");
    reloadCmd.addEventListener("execute", this._controller.reload, this._controller);

    var aboutCmd = new qx.client.Command("F1");
    aboutCmd.addEventListener("execute", this._controller.showAbout, this._controller);

    var prefCmd = new qx.client.Command("Control+P");
    prefCmd.addEventListener("execute", this._controller.showPreferences, this._controller);

    var addFeedCmd = new qx.client.Command("Control+A");
    addFeedCmd.addEventListener("execute", this._controller.showAddFeed, this._controller);

    var removeFeedCmd = new qx.client.Command("Control+D");
    removeFeedCmd.addEventListener("execute", this._controller.showRemoveFeed, this._controller);

    // Add buttons
    var addBtn = new qx.ui.toolbar.Button(this.tr("Add feed"), "icon/16/actions/dialog-ok.png");
    addBtn.setCommand(addFeedCmd);
    this.add(addBtn);

    var removeBtn = new qx.ui.toolbar.Button(this.tr("Remove feed"), "icon/16/actions/dialog-cancel.png");
    removeBtn.setCommand(removeFeedCmd);
    this.add(removeBtn);

    this.add(new qx.ui.toolbar.Separator());

    var reloadBtn = new qx.ui.toolbar.Button(this.tr("Reload"), "icon/16/actions/view-refresh.png");
    reloadBtn.setCommand(reloadCmd);
    reloadBtn.setToolTip(new qx.ui.popup.ToolTip(this.tr("(%1) Reload the feeds.", reloadCmd.toString())));
    this.add(reloadBtn);

    this.add(new qx.ui.toolbar.Separator());

    var prefBtn = new qx.ui.toolbar.Button(this.tr("Preferences"), "icon/16/apps/preferences.png");
    prefBtn.setCommand(prefCmd);
    prefBtn.setToolTip(new qx.ui.popup.ToolTip(this.tr("Open preferences window.")));
    this.add(prefBtn);

    this.add(new qx.ui.basic.HorizontalSpacer());

    // Poulate languages menu and add it to the toolbar
    var locales =
    {
      en : this.tr("English"),
      de : this.tr("German"),
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
    this.add(new qx.ui.toolbar.MenuButton(null, lang_menu, "feedreader/images/locale.png"));

    var about_btn = new qx.ui.toolbar.Button(this.tr("Help"), "icon/16/actions/help-about.png");
    about_btn.setCommand(aboutCmd);
    about_btn.setToolTip(new qx.ui.popup.ToolTip("(" + aboutCmd.toString() + ")"));
    this.add(about_btn);
  }
});
