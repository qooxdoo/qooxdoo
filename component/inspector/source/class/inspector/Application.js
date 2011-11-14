/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
/* ************************************************************************

#asset(inspector/*)
#ignore(qxinspector)

************************************************************************ */

/**
 * This is the main application class of your custom application "inspector"
 */
qx.Class.define("inspector.Application",
{
  extend : qx.application.Standalone,

  construct : function()
  {
    this.base(arguments);

    var uri = qx.util.ResourceManager.getInstance().toUri("inspector/css/domview.css");
    qx.bom.Stylesheet.includeFile(uri);
    uri = qx.util.ResourceManager.getInstance().toUri("inspector/css/consoleview.css");
    qx.bom.Stylesheet.includeFile(uri);
    uri = qx.util.ResourceManager.getInstance().toUri("inspector/css/sourceview.css");
    qx.bom.Stylesheet.includeFile(uri);
    uri = qx.util.ResourceManager.getInstance().toUri("inspector/css/propertylisthtml.css");
    qx.bom.Stylesheet.includeFile(uri);
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __checkCount : null,
    __frameUnsafeAttempt : null,

    /*
     * Toolbar
     */
    _toolbar : null,

    /*
     * Inspector
     */
    _container : null,
    _iFrame : null,
    _loading : null,
    __selector : null,
    _loadedWindow : null,


    __inspectorModel : null,
    __state : null,


    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreUndefined(qxinspector)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug"))
      {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      this.__inspectorModel = new inspector.components.InspectorModel(this);
      this.__selector = new inspector.components.Selector(this.__inspectorModel);
      this.__state = new inspector.components.State();
      this.__state.setIgnoreChanges(true);

      this._container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      this.getRoot().add(this._container, {edge : 0});

      this.__createToolbar();
      this.__setEnabledToolbar(false);

      var startUrl = "..";
      var cookieUrl = qx.bom.Cookie.get("url");
      if (cookieUrl == undefined || cookieUrl == "") {
        cookieUrl = startUrl;
      }

      if (window.qxinspector != undefined && qxinspector.local)
      {
        this._toolbar.getTextField().setVisibility("hidden");
        startUrl = "index.html";
      }
      else {
        startUrl = cookieUrl;
      }

      // create the iFrame
      this._loading = true;
      this._iFrame = new qx.ui.embed.Iframe(startUrl);
      this._iFrame.setDecorator(null);
      this._container.add(this._iFrame, {flex : 1});

      this._iFrame.addListener("load", this.__onLoad, this);
      this._toolbar.getTextField().setValue(startUrl);
    },


    __onLoad : function()
    {
      this.__checkCount = 0;
      this.__inspectorModel.setWindow(null);
      this.__inspectorModel.setInspected(null);
      this.__initInspector();

      var iFrameSource = this._iFrame.getSource();
      try {
        iFrameSource = this._iFrame.getWindow().location.pathname;
      } catch (ex) {}

      if (window.qxinspector == undefined) {
        this._toolbar.getTextField().setValue(iFrameSource);
      }

      // save the url in a cookie
      qx.bom.Cookie.set("url", iFrameSource, 7);
    },


    __initInspector : function()
    {
      this._loadedWindow = this._iFrame.getContentElement().getWindow();

      this.__setEnabledToolbar(false);
      // check if the app is loaded correctly
      if (!this.__checkWorking()) {
        return;
      }
      this.__setEnabledToolbar(true);

      this._loading = false;

      // select the root of the new app
      this.__inspectorModel.setWindow(this._loadedWindow);
      this.__inspectorModel.setInspected(this._loadedWindow.qx.core.Init.getApplication().getRoot());

      // check for the cookies
      this.__state.setIgnoreChanges(false);
      this.__state.restoreState();
    },


    /*
    -------------------------------------------------------------------------
      Initialize helper
    -------------------------------------------------------------------------
    */


    /**
     * @lint ignoreDeprecated(alert)
     * @return {Boolean}
     */
    __checkWorking: function()
    {
      // try to access the javascript objects in the iframe
      try {
        this.__checkCount++;

        // also break if its undefined
        if (this.__checkCount > 30) {
          throw new Error("No qooxdoo application root found!");
        }
        try {
          // try to get the root element of the application
          this._loadedWindow.qx.core.Init.getApplication().getRoot();

          return true;
        } catch (ex) {
          qx.event.Timer.once(this.__initInspector, this, 500);

          // check if inspect fails because of security restrictions
          try {
            // check if we can access the iframe
            this._loadedWindow.document;

            // if we get here, there are no security restrictions - try again
            return false;

          } catch(ex) {
            if (window.location.protocol == "file:" && !this.__frameUnsafeAttempt) {
              alert("Failed to inspect application loaded from the file system.\n\n" +
                    "The security settings of your browser may prohibit to access " +
                    "frames loaded using the file protocol. Please try the http " +
                    "protocol instead.");

              // prohibit the alert from being shown again
              this.__frameUnsafeAttempt = true;
            }
          }

        }
      } catch (ex) {
        // signal that the inspector is not working
        this._toolbar.getSelectedWidgetLabel().setValue(
          " Can not access the javascript in the iframe!"
        );
        this.__inspectorModel.setWindow(null);
        return false;
      }
    },


    /*
    -------------------------------------------------------------------------
      Create helper
    -------------------------------------------------------------------------
    */


    __createToolbar: function()
    {
      // create the toolbar itself
      this._toolbar = new inspector.view.ToolBar(this.__inspectorModel, this.__state);
      this._container.add(this._toolbar);

      this._toolbar.addListener("changeTextFieldValue", this._reloadIframe, this);
      this._toolbar.addListener("executeReloadButton", this._reloadIframe, this);
      this._toolbar.addListener("changeInspectButtonValue", function(e) {
        if (e.getData()) {
          this.__selector.start();
        } else {
          this.__selector.stop();
        }
      }, this);
    },


    _reloadIframe: function(e)
    {
      this._loading = true;

      var iFrameSource = this._iFrame.getSource();
      try {
        iFrameSource = this._iFrame.getWindow().location.pathname;
      } catch (ex) {}

      if (iFrameSource != this._toolbar.getTextField().getValue()) {
        this._iFrame.setSource(this._toolbar.getTextField().getValue());
      }
      else
      {
        if (e.getType() == "execute") {
          if (this._iFrame.getSource != iFrameSource) {
            this._iFrame.setSource(iFrameSource);
          } else {
            this._iFrame.reload();
          }
        }
      }
    },


    __setEnabledToolbar : function(value) {
      this._toolbar.setEnabledToolbar(value);
    },


    /*
    -------------------------------------------------------------------------
      Selection functions
    -------------------------------------------------------------------------
    */


    getSelectedObject : function() {
      return this.__inspectorModel.getInspected();
    },


    setWidgetByHash : function(hash, initiator)
    {
      // check the initiator
      if (initiator == "console") {
        initiator = this._toolbar.getConsoleWindow();
        // tell the console to go to the default view
        this._toolbar.getConsoleWindow().goToDefaultView();
      }
      var object = this._loadedWindow.qx.core.ObjectRegistry.fromHashCode(hash);
      this.__inspectorModel.setInspected(object);
    },


    inspectObjectByDomSelecet: function(index, key)
    {
      if (this._toolbar.getConsoleWindow() != null) {
          this._toolbar.getConsoleWindow().inspectObjectByDomSelecet(index, key);
      }
    },


    inspectObjectByInternalId: function(id)
    {
      // if the console exists
      if (this._toolbar.getConsoleWindow() != null) {
        // tell the consol to do the rest
        this._toolbar.getConsoleWindow().inspectObjectByInternalId(id);
      }
    },


    select: function(object, initiator)
    {
      qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      // if its currently loaiding, do nothing
      if (this._loading || !object) {
        return;
      }
      this.__inspectorModel.setInspected(object);
    },


    /*
    -------------------------------------------------------------------------
      Internal stuff
    -------------------------------------------------------------------------
    */


    getIframeWindowObject : function() {
      return this._loadedWindow;
    }
  },


  destruct : function()
  {
    this._loadedWindow = null;
    this._disposeObjects("_container", "_toolbar", "_iFrame", "__selector");
  }
});
