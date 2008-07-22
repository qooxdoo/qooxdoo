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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The GUI definition of the API viewer.
 *
 * The connections between the GUI components are established in
 * the {@link Controller}.
 */
qx.Class.define("apiviewer.Viewer",
{
  extend : qx.ui.container.Composite,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);
    
    this.setLayout(new qx.ui.layout.Dock);

    this.add(this.__createHeader(), {
      edge : "north"
    });

    var tree = new apiviewer.ui.PackageTree();
    tree.setId("tree");

    var buttonView = this.__createTabView(
        tree,
        new apiviewer.ui.SearchView(),
        new apiviewer.ui.LegendView()
      );

    var mainFrame = this.__createMainFrame(
      this.__createToolbar(),
      this.__createDetailFrame()
    );

    this.add(this.__createVerticalSplitter(
      buttonView, mainFrame));

  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Create the header widget
     *
     * @return {qx.ui.embed.HtmlEmbed} The header widget
     */
    __createHeader : function()
    {
      var header = new qx.ui.embed.HtmlEmbed(
        "<h1>" +
        "<span>" + qx.core.Setting.get("apiviewer.title") + "</span>" +
        " API Documentation" +
        "</h1>" +
        "<div class='version'>qooxdoo " + qx.core.Setting.get("qx.version") + "</div>"
      );
      
      var el = header.getContentElement();
      el.setAttribute("id", "header");
      
      el.setStyle(
        "background",
        "#134275 url(" +
        qx.util.ResourceManager.toUri("apiviewer/image/colorstrip.gif") +
        ") top left repeat-x"
      );

      header.setHeight(70);

      return header;
    },


    /**
     * Creates the button view widget on the left
     *
     * @param treeWidget {qx.ui.core.Widget} The widget for the "tree" pane
     * @param infoWidget {qx.ui.core.Widget} The widget for the "legend" pane
     * @return {qx.ui.tabview.TabView} The configured button view widget
     */
    __createTabView : function(treeWidget, searchWidget, infoWidget)
    {
      
      var tabView = new qx.ui.tabview.TabView;
      
      var packageTab = new qx.ui.tabview.Page("Packages", apiviewer.TreeUtil.ICON_PACKAGE);
      packageTab.setLayout(new qx.ui.layout.VBox());
      packageTab.setToolTip( new qx.ui.popup.ToolTip("Packages"));
      packageTab.add(new qx.ui.basic.Label("Packages"));
      tabView.add(packageTab);
      
      var searchTab = new qx.ui.tabview.Page("Search", apiviewer.TreeUtil.ICON_SEARCH);
      searchTab.setLayout(new qx.ui.layout.VBox());
      searchTab.setToolTip( new qx.ui.popup.ToolTip("Search"));
      searchTab.add(new qx.ui.basic.Label("Search"));
      tabView.add(searchTab);
      
      var infoTab = new qx.ui.tabview.Page("Information", apiviewer.TreeUtil.ICON_INFO);
      infoTab.setLayout(new qx.ui.layout.VBox());
      infoTab.setToolTip( new qx.ui.popup.ToolTip("Information"));
      infoTab.add(new qx.ui.basic.Label("Information"));
      tabView.add(infoTab);
      
      
      /*
      var buttonView = new qx.legacy.ui.pageview.buttonview.ButtonView();
      buttonView.set({
        width : "100%",
        height : "100%",
        border : "line-right"
      });

      var treeButton = new qx.legacy.ui.pageview.buttonview.Button("Packages", apiviewer.TreeUtil.ICON_PACKAGE);
      treeButton.setShow("icon");
      treeButton.setToolTip( new qx.legacy.ui.popup.ToolTip("Packages"));
      var searchButton = new qx.legacy.ui.pageview.buttonview.Button("Search", apiviewer.TreeUtil.ICON_SEARCH);
      searchButton.setShow("icon");
      searchButton.setToolTip( new qx.legacy.ui.popup.ToolTip("Search"));
      var infoButton = new qx.legacy.ui.pageview.buttonview.Button("Legend", apiviewer.TreeUtil.ICON_INFO);
      infoButton.setShow("icon");
      infoButton.setToolTip( new qx.legacy.ui.popup.ToolTip("Information"));

      treeButton.setChecked(true);
      buttonView.getBar().add(treeButton, searchButton, infoButton);

      var treePane = new qx.legacy.ui.pageview.buttonview.Page(treeButton);
      var searchPane = new qx.legacy.ui.pageview.buttonview.Page(searchButton);
      var infoPane = new qx.legacy.ui.pageview.buttonview.Page(infoButton);

      var pane = buttonView.getPane();
      pane.add(treePane, searchPane, infoPane);
      pane.setPadding(0);

      treePane.add(treeWidget);
      searchPane.add(searchWidget);
      infoPane.add(infoWidget);
      */

      return tabView;
    },


   /**
     * Creates the tool bar
     *
     * @return {qx.ui.toolbar.ToolBar} The configured tool bar
     */
    __createToolbar : function()
    {
      function createButton(text, clazz, icon, tooltip, checked, id)
      {
        if (!clazz) {
          clazz = qx.ui.toolbar.Button;
        }
        var button = new clazz(text, icon);
        if (checked) {
          button.setChecked(true);
        }

        if (tooltip) {
          button.setToolTip( new qx.ui.popup.ToolTip(tooltip));
        }

        button.setId(id);
        return button;
      }

      var toolbar = new qx.ui.toolbar.ToolBar;
      /*
      toolbar.set({
        horizontalChildrenAlign : "right",
        backgroundColor : "background",
        height : 29,
        border : "line-bottom"
      });
      */

      var part = new qx.ui.toolbar.Part;
      toolbar.add(part);

      part.add(createButton(
        "Expand",
        qx.ui.toolbar.CheckBox,
        "apiviewer/image/property18.gif",
        "Expand properties",
        false,
        "btn_expand"
      ));
      part.add(createButton(
        "Inherited",
        qx.ui.toolbar.CheckBox,
        "apiviewer/image/method_public_inherited18.gif",
        "Show inherited items",
        false,
        "btn_inherited"
      ));
      part.add(createButton(
        "Protected",
        qx.ui.toolbar.CheckBox,
        "apiviewer/image/method_protected18.gif",
        "Show protected items",
        false,
        "btn_protected"
      ));
      part.add(createButton(
        "Private",
        qx.ui.toolbar.CheckBox,
        "apiviewer/image/method_private18.gif",
        "Show private/internal items",
        false,
        "btn_private"
      ));

      return toolbar;
    },


    /**
     * Create the detail Frame and adds the Class-, Package and Loader-views to it.
     *
     * @return {qx.ui.layout.CanvasLayout} The detail Frame
     */
    __createDetailFrame : function()
    {
      //var detailFrame = new qx.legacy.ui.layout.CanvasLayout;
      var detailFrame = new qx.ui.container.Composite;
      detailFrame.setLayout(new qx.ui.layout.Canvas);
      
      /*
      detailFrame.set(
      {
        width           : "100%",
        height          : "1*",
        backgroundColor : "white",
        id              : "content"
      });
      */

      //detailFrame.setHtmlProperty("id", "content");

      this._detailLoader = new qx.ui.embed.HtmlEmbed('<h1><small>please wait</small>Loading data...</h1>');
      /*
      this._detailLoader.setHtmlProperty("id", "SplashScreen");
      this._detailLoader.setMarginLeft(20);
      this._detailLoader.setMarginTop(20);
      */
      this._detailLoader.setId("detail_loader");
      detailFrame.add(this._detailLoader);

      ////this._classViewer = new apiviewer.ui.ClassViewer;
      this._classViewer = new qx.ui.core.Widget;
      this._classViewer.setId("class_viewer");
      detailFrame.add(this._classViewer);

      ////this._packageViewer = new apiviewer.ui.PackageViewer;
      this._packageViewer = new qx.ui.core.Widget;
      this._packageViewer.setId("package_viewer");
      detailFrame.add(this._packageViewer);

      return detailFrame;
    },


    /**
     * Creates the main frame at the right
     *
     * @param toolbar {qx.legacy.ui.toolbar.ToolBar} Toolbar of the main frame
     * @param detailFrame {qx.legacy.ui.core.Widget} the detail widget
     * @return {qx.legacy.ui.layout.VerticalBoxLayout} the main frame
     */
    __createMainFrame : function(toolbar, detailFrame)
    {
      var mainFrame = new qx.ui.container.Composite;
      mainFrame.setLayout(new qx.ui.layout.VBox);
      
      /*
      mainFrame.set({
        width  : "100%",
        height : "100%",
        border : "line-left"
      });
      */

      mainFrame.add(toolbar);
      mainFrame.add(detailFrame);

      return mainFrame;
    },


    /**
     * Creates the vertival splitter and populates the split panes
     *
     * @param leftWidget {qx.ui.core.Widget} the widget on the left of the splitter
     * @param rightWidget {qx.ui.core.Widget} the widget on the right of the splitter
     * @return {qx.legacy.ui.splitpane.HorizontalSplitPane} the split pane
     */
    __createVerticalSplitter : function(leftWidget, rightWidget)
    {
      /*
      var mainSplitPane = new qx.legacy.ui.splitpane.HorizontalSplitPane("1*", "4*");
      mainSplitPane.setLiveResize(false);
      mainSplitPane.addLeft(leftWidget);
      mainSplitPane.addRight(rightWidget);
      return mainSplitPane;
      */
      
      
      var mainSplitPane = new qx.ui.splitpane.Pane("horizontal");
      mainSplitPane.add(leftWidget, 1);
      mainSplitPane.add(rightWidget, 4);
      return mainSplitPane;
    }

  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "apiviewer.title"            : "qooxdoo",
    "apiviewer.initialTreeDepth" : 1
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_classTreeNodeHash");
    this._disposeObjects("_tree", "_detailLoader", "_classViewer", "_packageViewer");
  }
});
