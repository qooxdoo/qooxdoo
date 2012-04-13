/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/16/actions/edit-clear.png)
#asset(qx/icon/Tango/16/categories/system.png)
#asset(qx/icon/Tango/16/status/dialog-information.png)
#asset(qx/icon/Tango/16/status/dialog-warning.png)
#asset(qx/icon/Tango/16/status/dialog-error.png)

************************************************************************ */

qx.Class.define("qxc.ui.logpane.LogView", {
  extend : qx.ui.container.Composite,


  construct : function()
  {
    this.__logLevelData = [
      ["debug", "Debug", "icon/16/categories/system.png"],
      ["info", "Info", "icon/16/status/dialog-information.png"],
      ["warn", "Warning", "icon/16/status/dialog-warning.png"],
      ["error", "Error", "icon/16/status/dialog-error.png"]
    ];

    var layout = new qx.ui.layout.VBox();
    layout.setSeparator("separator-vertical");
    this.base(arguments, layout);
    this.setDecorator("main");

    // caption of the log pane
    var caption = new qx.ui.basic.Label(this.tr("Log")).set(
    {
      font       : "bold",
      padding    : 10,
      alignY     : "middle",
      allowGrowX : true,
      allowGrowY : true
    });
    //this.add(caption);

    //toolbar of the log pane
    this.__toolbar = new qx.ui.toolbar.ToolBar();
    this.__toolbar.add(caption);
    this.__toolbar.addSpacer();
    this.__toolbar.setBackgroundColor("white");
    var clearButton = new qx.ui.toolbar.Button(this.tr("Clear"), "icon/16/actions/edit-clear.png");
    clearButton.addListener("execute", function(e) {
      this.clear();
    }, this);
    this.__toolbar.add(clearButton);
    this.add(this.__toolbar);

    // log pane
    var logArea = new qx.ui.embed.Html('');
    logArea.set(
    {
      backgroundColor : "white",
      overflowY : "scroll",
      overflowX : "auto",
      font : "monospace",
      padding: 3
    });
    this.add(logArea, {flex : 1});

    // log appender
    this.__logAppender = new qx.log.appender.Element();
    qx.log.Logger.unregister(this.__logAppender);

    // Directly create DOM element to use
    this.__logElem = document.createElement("DIV");
    this.__logAppender.setElement(this.__logElem);

    logArea.addListenerOnce("appear", function() {
      logArea.getContentElement().getDomElement().appendChild(this.__logElem);
    }, this);
  },


  properties : {
    /** Shows the log level button */
    showLogLevel : {
      check : "Boolean",
      apply : "_applyShowLogLevel",
      init : false
    },

    /** Current set log level.*/
    logLevel :
    {
      check : ["debug", "info", "warn", "error"],
      init  : "debug",
      event : "changeLogLevel"
    }
  },

  members :
  {
    __logElem : null,
    __logAppender : null,
    __logLevelData : null,
    __logLevelButton : null,
    __toolbar : null,


    /**
     * Clears the log.
     */
    clear : function() {
      this.__logAppender.clear();
    },


    /**
     * Fetches all logged data from the qx logging system and puts in into the
     * log widget.
     *
     * @param Class {Logger?null} The logger class.
     */
    fetch : function(Logger)
    {
      if (!Logger) {
        Logger = qx.log.Logger;
      }
      // Register to flush the log queue into the appender.
      Logger.register(this.__logAppender);

      // Clear buffer
      Logger.clear();
    },


    /**
     * Returns the div use as log appender element.
     * @return {DIV} The appender element.
     */
    getAppenderElement : function() {
      return this.__logElem;
    },


    // property apply
    _applyShowLogLevel : function(value, old) {
      if (!this.__logLevelButton) {
        this.__logLevelButton = this.__createLogLevelMenu();
        this.__toolbar.add(this.__logLevelButton);
      }
      if (value) {
        this.__logLevelButton.show();
      } else {
        this.__logLevelButton.exclude();
      }
    },


    /**
     * Returns the menu button used to select the AUT's log level
     *
     * @return {qx.ui.toolbar.MenuButton}
     */
    __createLogLevelMenu : function()
    {
      var logLevelMenu = new qx.ui.menu.Menu();
      var logLevelMenuButton = new qx.ui.toolbar.MenuButton("Log Level", "icon/16/categories/system.png");
      logLevelMenuButton.setMenu(logLevelMenu);

      for (var i = 0,l = this.__logLevelData.length; i < l; i++) {
        var data = this.__logLevelData[i];
        var button = new qx.ui.menu.Button(data[1], data[2]);
        button.setUserData("model", data[0]);
        button.addListener("execute", function(ev) {
          var pressedButton = ev.getTarget();
          this.setLogLevel(pressedButton.getUserData("model"));
          logLevelMenuButton.setIcon(pressedButton.getIcon());
        }, this);
        logLevelMenu.add(button);
      }

      return logLevelMenuButton;
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__logAppender");
    this.__logElem = null;
  }
});
