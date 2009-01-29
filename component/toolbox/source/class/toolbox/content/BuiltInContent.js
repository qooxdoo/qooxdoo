/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-09 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/*)

************************************************************************ */

/**
 * This class contains the whole content of the Built-in pane
 */
qx.Class.define("toolbox.content.BuiltInContent",
{
  extend : qx.ui.container.Composite,

  // Built-in list
  statics : { BUILTINLIST : null },

  construct : function(widgets)
  {
    this.base(arguments);

    this.__adminHost = "127.0.0.1";
    this.__adminPort = "8000";
    this.__adminPath = "/component/toolbox/tool/bin/nph-qxadmin_cgi.py";
    this.builtInWidgets = {};

    var layout = new qx.ui.layout.Grid(5, 5);
    this.myLogFrame = widgets["pane.logFrame"];
    this.setLayout(layout);
    this.setBackgroundColor("white");
    this.setPadding(4, 4, 4, 4);

    this.add(this.__getDemoBrowser(),
    {
      row     : 0,
      column  : 0,
      rowSpan : 0,
      colSpan : 0
    });

    this.add(this.__getApiViewer(),
    {
      row     : 0,
      column  : 1,
      rowSpan : 0,
      colSpan : 0
    });

    this.add(this.__getPlayground(),
    {
      row     : 0,
      column  : 2,
      rowSpan : 0,
      colSpan : 0
    });
    
    this.add(this.__getTestrunner(),
    {
      row     : 1,
      column  : 0,
      rowSpan : 0,
      colSpan : 0
    });
    
    this.add(this.__getPortal(),
    {
      row     : 1,
      column  : 1,
      rowSpan : 0,
      colSpan : 0
    });

    this.add(this.__getFeedreader(),
    {
      row     : 1,
      column  : 2,
      rowSpan : 0,
      colSpan : 0
    });
    
    // loads the built-in list
    this.__loadBuiltInList();
  },

  members :
  {
    /**
     * returns the Demobrowser 
     *
     * @return {var} box1 the Demobrowser
     */
    __getDemoBrowser : function()
    {
      //generate source
      var generateSource = new qx.ui.form.Button("Generate Source");
      generateSource.addListener("execute", this.__generateDemobrowserSource, this);
      
      //generate build
      var generateBuild = new qx.ui.form.Button("Generate Build");
      generateBuild.addListener("execute", this.__generateDemobrowserBuild, this);
      
      //Open source 
      var openSourceDemobrowser = new qx.ui.form.Button("   Open Source   ");
      openSourceDemobrowser.setEnabled(false);
      this.builtInWidgets["builtInApps.openSourceDemobrowser"] = openSourceDemobrowser;
	  openSourceDemobrowser.addListener("execute", function() {
        window.open("/application/demobrowser/source/index.html");
      }, this);
      
      //Open build
      var openBuildDemobrowser = new qx.ui.form.Button("   Open Build   ");
      openBuildDemobrowser.setEnabled(false);
      this.builtInWidgets["builtInApps.openBuildDemobrowser"] = openBuildDemobrowser;
      openBuildDemobrowser.addListener("execute", function() {
        window.open("/application/demobrowser/build/index.html");
      }, this);

      // Button container
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      container.add(generateSource);
      container.add(generateBuild);
      container2.add(openSourceDemobrowser);
	  container2.add(openBuildDemobrowser);

      var box1 = new qx.ui.groupbox.GroupBox();
      box1.setLayout(new qx.ui.layout.Grid(5, 5));

      // Demobrowser header
      var demoBrowserHeaderLabel = new qx.ui.basic.Label('<h2>Demo Browser</h2>').set({ rich : true });

      // Demobrowser description
      var demoBrowserDescriptionLabel = new qx.ui.basic.Label('<p> Contains many examples and tests for widgets,<br> layouts and other framework functionality.</p>').set({ rich : true });

      // Demobrowser image
      var demoBrowserImage = new qx.ui.basic.Image("toolbox/image/builtin-apps/demobrowser.png");

      box1.add(demoBrowserHeaderLabel,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(demoBrowserImage,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(demoBrowserDescriptionLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(container,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      box1.add(container2,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      return box1;
    },


    /**
     * returns the Api Viewer
     *
     * @return {var} box1 the Api Viewer
     */
    __getApiViewer : function()
    {
      var box1 = new qx.ui.groupbox.GroupBox();
      box1.setLayout(new qx.ui.layout.Grid(5, 5));

      var openApiButton = new qx.ui.form.Button("Open API Viewer");

      openApiButton.addListener("execute", function() {
        window.open("/framework/api/index.html");
      }, this);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      container.add(openApiButton);

      // Api viewer header
      var apiViewerHeaderLabel = new qx.ui.basic.Label('<h2>API Viewer</h2>').set({ rich : true });

      // Api viewer description
      var apiViewerDescriptionLabel = new qx.ui.basic.Label('<p>Standalone API reference application including<br>search capabilities.</p>').set({ rich : true });

      // Api viewer image
      var apiViewerImage = new qx.ui.basic.Image("toolbox/image/builtin-apps/apiviewer.png");

      box1.add(apiViewerHeaderLabel,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(apiViewerImage,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(apiViewerDescriptionLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(container,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      return box1;
    },


    /**
     * returns the Playground
     *
     * @return {var} box1 the Playground
     */
    __getPlayground : function()
    {
      var box1 = new qx.ui.groupbox.GroupBox();
      box1.setLayout(new qx.ui.layout.Grid(5, 5));

      //generate source
      var generateSource = new qx.ui.form.Button("Generate Source");
      generateSource.addListener("execute", this.__generatePlaygroundSource, this);

      //generate source
      var generateBuild = new qx.ui.form.Button("Generate Build");
      generateBuild.addListener("execute", this.__generatePlaygroundBuild, this);

      
      //open source
      var openSourcePlayground = new qx.ui.form.Button("   Open Source   ");
      this.builtInWidgets["builtInApps.openSourcePlayground"] = openSourcePlayground;
      openSourcePlayground.addListener("execute", function() {
      	window.open("/application/playground/source/index.html");
      }, this);
      openSourcePlayground.setEnabled(false);

      //open build
      var openBuildPlayground = new qx.ui.form.Button("   Open Build    ");
      this.builtInWidgets["builtInApps.openBuildPlayground"] = openBuildPlayground;
      openBuildPlayground.addListener("execute", function() {
      	window.open("/application/playground/build/index.html");
      }, this);
      openBuildPlayground.setEnabled(false);
      
      
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      container.add(generateSource);
      container.add(generateBuild);
      container2.add(openSourcePlayground);
      container2.add(openBuildPlayground);

      // Playground header
      var playgroundHeaderLabel = new qx.ui.basic.Label('<h2>Playground</h2>').set({ rich : true });

      // Playground description
      var playgroundDescriptionLabel = new qx.ui.basic.Label('<p>Play and experiment with source code<br/>and see the results immediately.</p>').set({ rich : true });

      // Playground image
      var playgroundImage = new qx.ui.basic.Image("toolbox/image/builtin-apps/playground.png");

      box1.add(playgroundHeaderLabel,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(playgroundImage,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(playgroundDescriptionLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(container,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      box1.add(container2,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      return box1;
    },

    /**
     * returns the Testrunner
     *
     * @return {var} box1 the Testrunner
     */
    __getTestrunner : function()
    {
      var box1 = new qx.ui.groupbox.GroupBox();
      box1.setLayout(new qx.ui.layout.Grid(5, 5));

      //generate source
      var generateSource = new qx.ui.form.Button("Generate Source");
      generateSource.addListener("execute", this.__generateTestrunnerSource, this);

      //generate source
      var generateBuild = new qx.ui.form.Button("Generate Build");
      generateBuild.addListener("execute", this.__generateTestrunnerBuild, this);

      
      //open source
      var openSourceTestrunner = new qx.ui.form.Button("   Open Source   ");
      this.builtInWidgets["builtInApps.openSourceTestrunner"] = openSourceTestrunner;
      openSourceTestrunner.addListener("execute", function() {
      	window.open("/component/testrunner/source/index.html");
      }, this);
      openSourceTestrunner.setEnabled(false);

      //open build
      var openBuildTestrunner = new qx.ui.form.Button("   Open Build    ");
      this.builtInWidgets["builtInApps.openBuildTestrunner"] = openBuildTestrunner;
      openBuildTestrunner.addListener("execute", function() {
      	window.open("/component/testrunner/build/index.html");
      }, this);
      openBuildTestrunner.setEnabled(false);
      
      
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      container.add(generateSource);
      container.add(generateBuild);
      container2.add(openSourceTestrunner);
      container2.add(openBuildTestrunner);

      // Testrunner header
      var testrunnerHeaderLabel = new qx.ui.basic.Label('<h2>Testrunner</h2>').set({ rich : true });

      // Testrunner description
      var testrunnerDescriptionLabel = new qx.ui.basic.Label('<p>Integrated unit testing framework similar<br/>to (but not requiring) JSUnit.</p>').set({ rich : true });

      // Testrunner image
      var testrunnerImage = new qx.ui.basic.Image("toolbox/image/builtin-apps/testrunner.png");

      box1.add(testrunnerHeaderLabel,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(testrunnerImage,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(testrunnerDescriptionLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(container,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      box1.add(container2,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      return box1;
    },
    
    /**
     * returns the Portal
     *
     * @return {var} box1 the Portal
     */
    __getPortal : function()
    {
      var box1 = new qx.ui.groupbox.GroupBox();
      box1.setLayout(new qx.ui.layout.Grid(5, 5));

      //generate source
      var generateSource = new qx.ui.form.Button("Generate Source");
      generateSource.addListener("execute", this.__generatePortalSource, this);

      //generate source
      var generateBuild = new qx.ui.form.Button("Generate Build");
      generateBuild.addListener("execute", this.__generatePortalBuild, this);

      
      //open source
      var openSourcePortal = new qx.ui.form.Button("   Open Source   ");
      this.builtInWidgets["builtInApps.openSourcePortal"] = openSourcePortal;
      openSourcePortal.addListener("execute", function() {
      	window.open("/application/portal/source/index.html");
      }, this);
      openSourcePortal.setEnabled(false);

      //open build
      var openBuildPortal = new qx.ui.form.Button("   Open Build    ");
      this.builtInWidgets["builtInApps.openBuildPortal"] = openBuildPortal;
      openBuildPortal.addListener("execute", function() {
      	window.open("/application/portal/build/index.html");
      }, this);
      openBuildPortal.setEnabled(false);
      
      
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      container.add(generateSource);
      container.add(generateBuild);
      container2.add(openSourcePortal);
      container2.add(openBuildPortal);

      // Testrunner header
      var portalHeaderLabel = new qx.ui.basic.Label('<h2>Portal</h2>').set({ rich : true });

      // Testrunner description
      var portalDescriptionLabel = new qx.ui.basic.Label('<p>A low-level, DOM-oriented application without<br/>any high-level qooxdoo widgets.</p>').set({ rich : true });

      // Testrunner image
      var portalImage = new qx.ui.basic.Image("toolbox/image/builtin-apps/portal.png");

      box1.add(portalHeaderLabel,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(portalImage,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(portalDescriptionLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(container,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      box1.add(container2,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      return box1;
    },
    

    /**
     * returns the Feedreader
     *
     * @return {var} box1 the Feedreader
     */
    __getFeedreader : function()
    {
      var box1 = new qx.ui.groupbox.GroupBox();
      box1.setLayout(new qx.ui.layout.Grid(5, 5));

      //generate source
      var generateSource = new qx.ui.form.Button("Generate Source");
      generateSource.addListener("execute", this.__generateFeedreaderSource, this);

      //generate source
      var generateBuild = new qx.ui.form.Button("Generate Build");
      generateBuild.addListener("execute", this.__generateFeedreaderBuild, this);

      
      //open source
      var openSourceFeedreader = new qx.ui.form.Button("   Open Source   ");
      this.builtInWidgets["builtInApps.openSourceFeedreader"] = openSourceFeedreader;
      openSourceFeedreader.addListener("execute", function() {
      	window.open("/application/feedreader/source/index.html");
      }, this);
      openSourceFeedreader.setEnabled(false);

      //open build
      var openBuildFeedreader = new qx.ui.form.Button("   Open Build    ");
      this.builtInWidgets["builtInApps.openBuildFeedreader"] = openBuildFeedreader;
      openBuildFeedreader.addListener("execute", function() {
      	window.open("/application/feedreader/build/index.html");
      }, this);
      openBuildFeedreader.setEnabled(false);
      
      
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
      container.add(generateSource);
      container.add(generateBuild);
      container2.add(openSourceFeedreader);
      container2.add(openBuildFeedreader);

      // Feedreader header
      var feedreaderHeaderLabel = new qx.ui.basic.Label('<h2>Feedreader</h2>').set({ rich : true });

      // Feedreader description
      var feedreaderDescriptionLabel = new qx.ui.basic.Label('<p>A typical rich internet application (RIA)<br/>for displaying RSS feeds.</p>').set({ rich : true });

      // Playground image
      var feedreaderImage = new qx.ui.basic.Image("toolbox/image/builtin-apps/feedreader.png");

      box1.add(feedreaderHeaderLabel,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(feedreaderImage,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(feedreaderDescriptionLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      box1.add(container,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });
      
      box1.add(container2,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 0
      });

      return box1;
    },
    
    
    /**
     * loads the created built-in list
     *
     * @return {void} 
     */
    __loadBuiltInList : function() {
      toolbox.builder.Builder.prepareList(this.__adminPath, this.myLogFrame, this.builtInWidgets, "builtIn");
    },


    /**
     * generates the source-version of the Demobrowser
     *
     * @return {void} 
     */
    __generateDemobrowserSource : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "demobrowser", "", this.myLogFrame, this.builtInWidgets, "source", true, "application");
      return;
    },


    /**
     * generates the build-version of the Demobrowser
     *
     * @return {void} 
     */
    __generateDemobrowserBuild : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "demobrowser", "", this.myLogFrame, this.builtInWidgets, "build", true, "application");
      return;
    },


    /**
     * generates the source-version of the Playground
     *
     * @return {void} 
     */
    __generatePlaygroundSource : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "playground", "", this.myLogFrame, this.builtInWidgets, "source", true, "application");
      return;
    },
    
    /**
     * generates the build-version of the Playground
     *
     * @return {void} 
     */
    __generatePlaygroundBuild : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "playground", "", this.myLogFrame, this.builtInWidgets, "build", true, "application");
      return;
    },
    
    /**
     * generates the source-version of the Testrunner
     *
     * @return {void} 
     */
    __generateTestrunnerSource : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "testrunner", "", this.myLogFrame, this.builtInWidgets, "source", true, "component");
      return;
    },
    
    /**
     * generates the build-version of the Testrunner
     *
     * @return {void} 
     */
    __generateTestrunnerBuild : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "testrunner", "", this.myLogFrame, this.builtInWidgets, "build", true, "component");
      return;
    },
    
    /**
     * generates the source-version of Portal
     *
     * @return {void} 
     */
    __generatePortalSource : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "portal", "", this.myLogFrame, this.builtInWidgets, "source", true, "application");
      return;
    },
    
    /**
     * generates the build-version of Portal
     *
     * @return {void} 
     */
    __generatePortalBuild : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "portal", "", this.myLogFrame, this.builtInWidgets, "build", true, "application");
      return;
    },
    
    /**
     * generates the source-version of the Feedreader
     *
     * @return {void} 
     */
    __generateFeedreaderSource : function()
    {
    	toolbox.builder.Builder.generateTarget(this.__adminPath, "feedreader", "", this.myLogFrame, this.builtInWidgets, "source", true, "application");
      return;
    },
    
    /**
     * generates the build-version of the Feedreader
     *
     * @return {void} 
     */
    __generateFeedreaderBuild : function()
    {
    	toolbox.builder.Builder.generateTarget(this.__adminPath, "feedreader", "", this.myLogFrame, this.builtInWidgets, "build", true, "application");
      return;
    }
  }
});