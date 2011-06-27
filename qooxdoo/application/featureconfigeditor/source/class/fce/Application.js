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
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Tool used to create configuration maps for feature-based builds
 */
qx.Class.define("fce.Application",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __featureSelector : null,
    
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
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
      
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
      this.getRoot().add(container, {edge: 0});
      container.add(this._createHeader());
      
      var innerContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      container.add(innerContainer, {flex: 1});
      
      this.__featureSelector = new fce.view.FeatureSelector();
      this.__featureSelector.setMargin(20);
      innerContainer.add(this.__featureSelector, {flex: 1});
      innerContainer.add(this._createHelpBox(), {flex: 1});
      
      var env = new fce.Environment();
      env.addListenerOnce("changeFeatures", function(ev) {
        var clientFeatures = ev.getData();
        var reporter = this.__getReporter();
        if (reporter) {
          reporter.compare(clientFeatures);
        }
        
        var envData = {
          detected : clientFeatures
        };
        this.__featureSelector.setFeatureData(envData);
      }, this);
      env.check();
      
    },
    
    
    /**
     * Creates the application header
     * 
     * @return {qx.ui.container.Composite} Header widget
     */
    _createHeader : function()
    {
      var layout = new qx.ui.layout.HBox();
      var header = new qx.ui.container.Composite(layout);
      header.setAppearance("app-header");

      var title = new qx.ui.basic.Label("Feature Configuration Editor");
      var version = new qx.ui.basic.Label("qooxdoo " + qx.core.Environment.get("qx.version"));

      header.add(title);
      header.add(new qx.ui.core.Spacer, {flex : 1});
      header.add(version);

      return header;
    },
    
    
    /**
     * Creates the help text box
     * 
     * @return {qx.ui.container.Composite} Help box
     */
    _createHelpBox : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      container.setMargin(20);
      var helpHeader = new qx.ui.basic.Label("Help");
      helpHeader.setFont("bigger");
      container.add(helpHeader);
      var helpText = new qx.ui.basic.Label("Meaningful help text goes here...");
      container.add(helpText);
      
      return container;
    },
    
    
    /**
     * Creates a {@link fce.Reporter} instance if the <em>fce.reportServer.host</em>,
     * <em>fce.reportServer.addUrl</em> and <em>fce.reportServer.getUrl</em> 
     * environment settings are defined.
     * 
     * @return {fce.Reporter|null} Reporter instance or null
     */
    __getReporter : function()
    {
      var server = qx.core.Environment.get("fce.reportServerHost");
      var addUrl = qx.core.Environment.get("fce.reportServerAddUrl");
      var getUrl = qx.core.Environment.get("fce.reportServerGetUrl");
      
      if (server && addUrl && getUrl) {
        return new fce.Reporter(server, addUrl, getUrl);
      }
      
      return null;
    }
  },
  
  destruct : function()
  {
    this._disposeObjects("__featureSelector");
  }
});
