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

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * The GUI definition of the API viewer.
 *
 * The connections between the GUI components are established in
 * the {@link Controller}.
 */
qx.Class.define("apiviewer.Viewer",
{
  extend : qx.ui.layout.DockLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    this.setEdge(0);

    this.addTop(this.__createHeader());
    var tree = new apiviewer.ui.PackageTree();
    tree.setId("tree");

    var buttonView = this.__createButtonView(
      tree,
      new apiviewer.ui.SearchView(),
      new apiviewer.ui.LegendView()
    );

    var mainFrame = this.__createMainFrame(
      this.__createToolbar(),
      this.__createDetailFrame()
    );

    this.add(
      this.__createVerticalSplitter(
        buttonView,
        mainFrame
      )
    );
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
        "<div class='version'>qooxdoo " + qx.core.Version.toString() + "</div>"
      );
      header.setHtmlProperty("id", "header");
      header.setStyleProperty(
        "background",
        "#134275 url(" +
        qx.io.Alias.getInstance().resolve("api/image/colorstrip.gif") +
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
     * @return {qx.ui.pageview.buttonview.ButtonView} The configured button view widget
     */
    __createButtonView : function(treeWidget, searchWidget, infoWidget)
    {
      var buttonView = new qx.ui.pageview.buttonview.ButtonView();
      buttonView.set({
        width : "100%",
        height : "100%",
        border : "line-right"
      });

      var treeButton = new qx.ui.pageview.buttonview.Button("Packages", apiviewer.TreeUtil.ICON_PACKAGE);
      treeButton.setShow("icon");
      treeButton.setToolTip( new qx.ui.popup.ToolTip("Packages"));
      var searchButton = new qx.ui.pageview.buttonview.Button("Search", apiviewer.TreeUtil.ICON_SEARCH);
      searchButton.setShow("icon");
      searchButton.setToolTip( new qx.ui.popup.ToolTip("Search"));
      var infoButton = new qx.ui.pageview.buttonview.Button("Legend", apiviewer.TreeUtil.ICON_INFO);
      infoButton.setShow("icon");
      infoButton.setToolTip( new qx.ui.popup.ToolTip("Information"));

      treeButton.setChecked(true);
      buttonView.getBar().add(treeButton, searchButton, infoButton);

      var treePane = new qx.ui.pageview.buttonview.Page(treeButton);
      var searchPane = new qx.ui.pageview.buttonview.Page(searchButton);
      var infoPane = new qx.ui.pageview.buttonview.Page(infoButton);

      var pane = buttonView.getPane();
      pane.add(treePane, searchPane, infoPane);
      pane.setPadding(0);

      treePane.add(treeWidget);
      searchPane.add(searchWidget);
      infoPane.add(infoWidget);

      return buttonView;
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
      toolbar.set({
        horizontalChildrenAlign : "right",
        backgroundColor : "background",
        height : 29,
        border : "line-bottom"
      });

      var part = new qx.ui.toolbar.Part;
      toolbar.add(part);

      part.add(createButton(
        "Inherited",
        qx.ui.toolbar.CheckBox,
        apiviewer.TreeUtil.iconNameToIconPath("ICON_METHOD_PUB_INHERITED"),
        "Show inherited items.",
        false,
        "btn_inherited"
      ));
      part.add(createButton(
        "Protected",
        qx.ui.toolbar.CheckBox,
        apiviewer.TreeUtil.iconNameToIconPath("ICON_METHOD_PROT"),
        "Show protected items.",
        false,
        "btn_protected"
      ));
      part.add(createButton(
        "Private",
        qx.ui.toolbar.CheckBox,
        apiviewer.TreeUtil.iconNameToIconPath("ICON_METHOD_PRIV"),
        "Show private and internal items.",
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
      var detailFrame = new qx.ui.layout.CanvasLayout;
      detailFrame.set(
      {
        width           : "100%",
        height          : "1*",
        backgroundColor : "white",
        id              : "content"
      });

      detailFrame.setHtmlProperty("id", "content");

      this._detailLoader = new qx.ui.embed.HtmlEmbed('<h1><small>please wait</small>Loading data...</h1>');
      this._detailLoader.setHtmlProperty("id", "SplashScreen");
      this._detailLoader.setMarginLeft(20);
      this._detailLoader.setMarginTop(20);
      this._detailLoader.setId("detail_loader");
      detailFrame.add(this._detailLoader);

      this._classViewer = new apiviewer.ui.ClassViewer;
      this._classViewer.setId("class_viewer");
      detailFrame.add(this._classViewer);

      this._packageViewer = new apiviewer.ui.PackageViewer;
      this._packageViewer.setId("package_viewer");
      detailFrame.add(this._packageViewer);

      return detailFrame;
    },


    /**
     * Creates the main frame at the right
     *
     * @param toolbar {qx.ui.toolbar.ToolBar} Toolbar of the main frame
     * @param detailFrame {qx.ui.core.Widget} the detail widget
     * @return {qx.ui.layout.VerticalBoxLayout} the main frame
     */
    __createMainFrame : function(toolbar, detailFrame)
    {
      var mainFrame = new qx.ui.layout.VerticalBoxLayout();
      mainFrame.set({
        width  : "100%",
        height : "100%",
        border : "line-left"
      });

      mainFrame.add(toolbar, detailFrame);
      return mainFrame;
    },


    /**
     * Creates the vertival splitter and populates the split panes
     *
     * @param leftWidget {qx.ui.core.Widget} the widget on the left of the splitter
     * @param rightWidget {qx.ui.core.Widget} the widget on the right of the splitter
     * @return {qx.ui.splitpane.HorizontalSplitPane} the split pane
     */
    __createVerticalSplitter : function(leftWidget, rightWidget)
    {
      var mainSplitPane = new qx.ui.splitpane.HorizontalSplitPane("1*", "4*");
      mainSplitPane.setLiveResize(false);
      mainSplitPane.addLeft(leftWidget);
      mainSplitPane.addRight(rightWidget);
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
