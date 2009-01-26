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
 * This class contains the whole content of the Home pane
 */
qx.Class.define("toolbox.content.BuiltInContent",
{
  extend : qx.ui.container.Composite, include : qx.ui.core.MNativeOverflow,

  construct : function(widgets)
  {
    this.base(arguments);
    
    this.__adminHost = "127.0.0.1";
    this.__adminPort = "8000";
    this.__adminPath = "/component/toolbox/tool/bin/nph-qxadmin_cgi.py";
    
    var layout = new qx.ui.layout.Grid(5, 5);
    this.myLogFrame = widgets["pane.logFrame"];
    this.setLayout(layout);
    this.setBackgroundColor("white");
    this.setPadding(4, 4, 4, 4);
	
    this.set({
      overflowX : "scroll", 
      overflowY : "scroll"
    });
    
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
	


  },
  
  members : 
  {
  	__getDemoBrowser : function()
  	{
  		var generateSource = new qx.ui.form.Button("Generate Source");
	    var generateBuild = new qx.ui.form.Button("Generate Build");
	    var openDemoButton = new qx.ui.form.Button(" Open ");
	    
	    generateSource.addListener("execute", this.__generateDemobrowserSource, this);
	    generateBuild.addListener("execute", this.__generateDemobrowserBuild, this);
	    openDemoButton.addListener("execute", this.__openDemoBrowserSource, this);
	    
	    //Button container
	    var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
	    container.add(generateSource);
	    container.add(generateBuild);
	    container.add(openDemoButton);
	    
	    var box1 = new qx.ui.groupbox.GroupBox();
	    box1.setLayout(new qx.ui.layout.Grid(5, 5));

	    //Demo Browser header
	    var demoBrowserHeaderLabel = new qx.ui.basic.Label('<h2>Demo Browser</h2>').set({ rich : true });
	
	    //Demo Browser description
	    var demoBrowserDescriptionLabel = new qx.ui.basic.Label('<p> Contains many examples and tests for widgets,<br> layouts and other framework functionality.</p>' 
	    ).set({ rich : true });
	
	    // Demo Browser image
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
	    
	    return box1;
  	},
  	
  	__getApiViewer : function()
  	{   
	    var box1 = new qx.ui.groupbox.GroupBox();
	    box1.setLayout(new qx.ui.layout.Grid(5, 5));
	    
	    var openApiButton = new qx.ui.form.Button(" Open ");
	    openApiButton.addListener("execute", this.__openApiViewerSource, this);
	    
	    var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "left", null));
	    container.add(openApiButton);
	    
	    //Demo Browser header
	    var apiViewerHeaderLabel = new qx.ui.basic.Label('<h2>API Viewer</h2>').set({ rich : true });
	
	    //Demo Browser description
	    var apiViewerDescriptionLabel = new qx.ui.basic.Label('<p>Standalone API reference application including<br>search capabilities.</p>' 
	    ).set({ rich : true });
	
	    // Demo Browser image
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
  	
  	__generateDemobrowserSource : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "demobrowser", "", this.myLogFrame, null, "source", true, "application");
      return;
    },
    
    __generateDemobrowserBuild : function()
    {
      toolbox.builder.Builder.generateTarget(this.__adminPath, "demobrowser", "", this.myLogFrame, null, "build", true, "application");
      return;
    },
    
    __openDemoBrowserSource : function() {
      toolbox.builder.Builder.openApplication(this.__adminPath, "demobrowser", "", this.myLogFrame, "source", true, "application");
    },
    
    __openApiViewerSource : function() {
      toolbox.builder.Builder.openApplication(this.__adminPath, "apiviewer", "", this.myLogFrame, "source", true, "component");
    }
    
    
    
  }
});