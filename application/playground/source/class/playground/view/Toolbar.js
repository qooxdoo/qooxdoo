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

************************************************************************ */
/* ************************************************************************

#asset(playground/images/*)

************************************************************************ */

/**
 * The playground toolbar containing all buttons and menus.
 */
qx.Class.define("playground.view.Toolbar", 
{
  extend : qx.ui.toolbar.ToolBar,


  /**
   * @param sampleNames {Array} An array containing all names of the samples as 
   *   String.
   */
  construct : function(sampleNames)
  {
    this.base(arguments);
        
    // left part
    var part1 = new qx.ui.toolbar.Part();
    this.add(part1);

    // run button
    var runButton = new qx.ui.toolbar.Button(
      this.tr("Run"), "icon/22/actions/media-playback-start.png"
    );
    part1.add(runButton);
    runButton.setToolTipText(this.tr("Run the source code"));
    runButton.addListener("execute", function() {
      this.fireEvent("run");
    }, this);

    // select sample button
    var selectSampleButton = new qx.ui.toolbar.MenuButton(
      this.tr("Samples"), "icon/22/actions/edit-copy.png"
    );
    part1.add(selectSampleButton);
    selectSampleButton.setToolTipText(this.tr("Select a sample"));
    selectSampleButton.setMenu(this.__createSampleMenu(sampleNames));

    // highlighting button
    this.__highlightButton = new qx.ui.form.ToggleButton(
      this.tr("Syntax Highlighting"), "icon/22/actions/check-spelling.png"
    );
    part1.add(this.__highlightButton);
    this.__highlightButton.setAppearance("toolbar-button");
    this.__highlightButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeHighlight", e.getData(), e.getOldData());
    }, this);
    var initValue = qx.bom.Cookie.get("playgroundHighlight") !== "false";
    this.__highlightButton.setValue(initValue);

    // gist button
    var gistButton = new qx.ui.toolbar.MenuButton(
      null, "playground/images/logo_gist.png"
    );
    part1.add(gistButton);
    gistButton.setToolTipText(this.tr("gist support"));
    this.__gistMenu = new playground.view.gist.GistMenu();
    gistButton.setMenu(this.__gistMenu);
    this.__gistMenu.addListener("changeGist", function(e) {
      this.fireDataEvent("changeGist", e.getData());
    }, this);
    this.__gistMenu.addListener("reload", function(e) {
      this.fireDataEvent("reloadGists", e.getData());
    }, this);
    this.__gistMenu.addListener("newGist", function() {
      this.fireEvent("newGist");
    }, this);
    this.__gistMenu.addListener("editGist", function(e) {
      this.fireDataEvent("editGist", e.getData());
    }, this);

    // spacer
    this.addSpacer();

    // right part
    var part2 = new qx.ui.toolbar.Part();
    this.add(part2);

    // log Check button
    this.__logCheckButton = new qx.ui.toolbar.CheckBox(
      this.tr("Log"), "icon/22/apps/utilities-log-viewer.png"
    );
    part2.add(this.__logCheckButton);
    this.__logCheckButton.setToolTipText(this.tr("Show log output"));
    this.__logCheckButton.addListener("changeValue", function(e) {
      this.fireDataEvent("changeLog", e.getData(), e.getOldData());
    }, this);

    // url shortening button
    var urlShortButton = new qx.ui.toolbar.Button(
      this.tr("Shorten URL"), "icon/22/actions/bookmark-new.png"
    );
    part2.add(urlShortButton);
    urlShortButton.setToolTipText(this.tr("Use tinyurl to shorten the url."));
    urlShortButton.addListener("execute", function() {
      this.fireEvent("shortenUrl");
    }, this);

    // api button
    var apiButton = new qx.ui.toolbar.Button(
      this.tr("API Viewer"), "icon/22/actions/help-contents.png"
    );
    part2.add(apiButton);
    apiButton.setToolTipText(this.tr("Open the qooxdoo API Viewer"));
    apiButton.addListener("execute", function() {
      this.fireEvent("openApi");
    }, this);

    // help button
    var helpButton = new qx.ui.toolbar.Button(
      this.tr("Manual"), "icon/22/actions/help-about.png"
    );
    part2.add(helpButton);
    helpButton.setToolTipText(this.tr("Open the qooxdoo Manual"));
    helpButton.addListener("execute", function() {
      this.fireEvent("openManual");
    }, this);
  },


  events : 
  {
    /**
     * Fired if the run button is pressed.
     */
    "run" : "qx.event.type.Event",
    
    /**
     * Fired if a new sample should be selected. The data contains the name of 
     * the new sample.
     */
    "changeSample" : "qx.event.type.Data",
    
    /**
     * Data event if the code highlighting should be used.
     */
    "changeHighlight" : "qx.event.type.Data",
    
    /**
     * Data event if the log should be shown.
     */
    "changeLog" : "qx.event.type.Data",
    
    /**
     * Event which will indicate a url shortening action.
     */
    "shortenUrl" : "qx.event.type.Event",

    /**
     * Event which will be fired to open the api.
     */
    "openApi" : "qx.event.type.Event",
    
    /**
     * Event which will be fired to open the manual.
     */
    "openManual" : "qx.event.type.Event",
    
    /**
     * Event signaling that a new gist has been selected.
     */
    "changeGist" : "qx.event.type.Data",
    
    /**
     * Event which will be fireed if the gists should be reloaded.
     */
    "reloadGists" : "qx.event.type.Data",
    
    /**
     * Fired if a new gist should be created.
     */
    "newGist" : "qx.event.type.Event",
    
    /**
     * Fired if the gist should be edited.
     */
    "editGist" : "qx.event.type.Event"
  },


  members :
  {
    __highlightButton : null,
    __logCheckButton : null,
    __gistMenu : null,
    
    /**
     * Controlls the presed state of the log button.
     * @param show {Boolean} True, if the button should be pressed.
     */
    showLog : function(show) {
      this.__logCheckButton.setValue(show);
    },
    
    
    /**
     * Controlls the enabled property of the highlight button.
     * @param value {Boolean} True, if the button should be enabled.
     */
    enableHighlighting : function(value) {
      this.__highlightButton.setEnabled(value);
    },
        
    
    /**
     * Generates a menu to select the samples.
     * @param sampleNames {Array} An array containing all names of the samples.
     * @return {qx.ui.menu.Menu} Menu of the samples.
     */
    __createSampleMenu : function(sampleNames)
    {
      var menu = new qx.ui.menu.Menu;

      for (var i = 0; i < sampleNames.length; i++)
      {
        var name = sampleNames[i];
        
        var sampleEntryButton = new qx.ui.menu.Button(
          name, "icon/22/actions/edit-paste.png"
        );
        menu.add(sampleEntryButton);

        sampleEntryButton.addListener(
          "execute", qx.lang.Function.bind(function(sample, e) {
            this.fireDataEvent("changeSample", sample);
          }, this, name)
        );
      }

      return menu;
    },
    
    
    /**
     * Updates the gists shown in the toolbar.
     * @param names {Array} An array of gist names.
     * @param texts {Array} An array of gist contents.
     */
    updateGists: function(names, texts) {
      this.__gistMenu.updateGists(names, texts);
    },
    
    
    /**
     * Signals that something went wrong during the loading of the gists.
     * @param invalid {Boolean} true, if something was wrong
     * @param message {String} The message what was wrong.
     */
    invalidGist : function(invalid, message) {
      this.__gistMenu.invalidUser(invalid, message);
    }
  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    this._disposeObjects("__highlightButton", "__logCheckButton");
  }
});
