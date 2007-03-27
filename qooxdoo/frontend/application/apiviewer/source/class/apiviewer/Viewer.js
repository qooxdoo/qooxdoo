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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)
#resource(css:css)
#resource(image:image)

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
    qx.ui.layout.DockLayout.call(this);
    this.setEdge(0);

    this._subWidgets = {};

    this.addTop(this.__createHeader());
    var tree = new apiviewer.PackageTree();
    this.__registerWidget(tree, "tree");

    var buttonView = this.__createButtonView(
      tree,
      new apiviewer.InfoView()
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

    apiviewer.Viewer.instance = this;
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
        "<div id='qxversion'>qooxdoo " + qx.core.Version.toString() + "</div>"
      );
      header.setHtmlProperty("id", "header");
      header.setStyleProperty(
        "background",
        "#134275 url(" +
        qx.manager.object.AliasManager.getInstance().resolvePath("api/image/colorstrip.gif") +
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
    __createButtonView : function(treeWidget, infoWidget)
    {

      var buttonView = new qx.ui.pageview.buttonview.ButtonView();
      buttonView.set({
        width           : "100%",
        height          : "100%"
      });
      var treeButton = new qx.ui.pageview.buttonview.Button("Packages", apiviewer.TreeUtil.ICON_PACKAGE);
      treeButton.setShow("icon");
      treeButton.setToolTip( new qx.ui.popup.ToolTip("Packages"));
      var infoButton = new qx.ui.pageview.buttonview.Button("Legend", apiviewer.TreeUtil.ICON_INFO);
      infoButton.setShow("icon");
      infoButton.setToolTip( new qx.ui.popup.ToolTip("Information"));

      treeButton.setChecked(true);
      buttonView.getBar().add(treeButton, infoButton);

      var treePane = new qx.ui.pageview.buttonview.Page(treeButton);
      var infoPane = new qx.ui.pageview.buttonview.Page(infoButton);
      buttonView.getPane().add(treePane, infoPane);

      treePane.add(treeWidget);
      infoPane.add(infoWidget);

      return buttonView;
    },


    __createToolbar : function()
    {

      var self = this;
      function createButton(text, icon, clazz, checked, id)
      {
        if (!clazz) {
          clazz = qx.ui.toolbar.Button;
        }
        var button = new clazz(text, "icon/22/actions/" + icon + ".png");
        if (checked) {
          button.setChecked(true);
        }

        self.__registerWidget(button, id);
        return button;
      }

      var toolbar = new qx.ui.toolbar.ToolBar;
      toolbar.setHorizontalChildrenAlign("right");

      var part = new qx.ui.toolbar.Part;
      part.setHeight(28);
      toolbar.add(part);

      part.add(createButton("Show Inherited", "", qx.ui.toolbar.CheckBox, false, "btn_inherited"));
      part.add(createButton("Show Protected", "", qx.ui.toolbar.CheckBox, false, "btn_protected"));
      part.add(createButton("Show Private", "", qx.ui.toolbar.CheckBox, false, "btn_private"));

      return toolbar;
    },


    /**
     * Create the detail Frame and adds the Class-, Package and Loader-views to it.
     *
     * @return {qx.ui.layout.CanvasLayout} The detail Frame
     */
    __createDetailFrame : function()
    {
      detailFrame = new qx.ui.layout.CanvasLayout;
      detailFrame.set(
      {
        width           : "100%",
        height          : "1*",
        backgroundColor : "white",
        border          : qx.renderer.border.BorderPresets.getInstance().inset
      });

      detailFrame.setHtmlProperty("id", "DetailFrame");

      this._detailLoader = new qx.ui.embed.HtmlEmbed('<h1><div class="please">please wait</div>Loading data...</h1>');
      this._detailLoader.setHtmlProperty("id", "DetailLoader");
      this._detailLoader.setMarginLeft(20);
      this._detailLoader.setMarginTop(20);
      detailFrame.add(this._detailLoader);
      this.__registerWidget(this._detailLoader, "detail_loader");

      this._classViewer = new apiviewer.ClassViewer;
      detailFrame.add(this._classViewer);
      this.__registerWidget(this._classViewer, "class_viewer");

      this._packageViewer = new apiviewer.PackageViewer;
      detailFrame.add(this._packageViewer);
      this.__registerWidget(this._packageViewer, "package_viewer");

      return detailFrame;
    },


    /**
     * Creates the main frame at the right
     *
     * @param {qx.ui.toolbar.ToolBar} Toolbar of the main frame
     * @param {qx.ui.core.Widget} the detail widget
     * @return {qx.ui.layout.VerticalBoxLayout} the main frame
     */
    __createMainFrame : function(toolbar, detailFrame)
    {
      var mainFrame = new qx.ui.layout.VerticalBoxLayout();
      mainFrame.set({
        width           : "100%",
        height          : "100%"
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
      var mainSplitPane = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
      mainSplitPane.setLiveResize(true);
      mainSplitPane.addLeft(leftWidget);
      mainSplitPane.addRight(rightWidget);
      return mainSplitPane;
    },


    /**
     * Registers a widget under the given widget id to be used with
     * {@link #getWidgetById}.
     *
     * @param widget {qx.ui.core.Widget} the widget to register
     * @param id {String} the id of the widget.
     */
    __registerWidget : function(widget, id)
    {
      this._subWidgets[id] = widget;
    },


    /**
     * Returns the widget registered under the given id by {@link #__registerWidget}
     *
     * @param {String} the id of the widget
     * @return {qx.ui.core.Widget} the widget.
     */
    getWidgetById : function(id)
    {
      return this._subWidgets[id];
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
    this._disposeObjects("_tree", "_detailLoader", "_classViewer", "_packageViewer");
    this._disposeFields("_classTreeNodeHash");
  }
});
