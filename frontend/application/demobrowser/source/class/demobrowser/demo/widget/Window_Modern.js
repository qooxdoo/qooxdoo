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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/categories/internet.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Window_Modern",
{
  extend : qx.application.Standalone,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);

      var win = this._createWindow();
      this.getRoot().add(win, { left : 40, top  : 30 });
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Window} TODOC
     */
    _createWindow : function()
    {
      var win = new qx.ui.window.Window("Modern Window", "icon/16/categories/internet.png");

      win.setMinWidth(400);
      win.setMinHeight(300);
      win.setResizeMethod("opaque");

      win.setLayout(new qx.ui.layout.Grow);

      var mainPane = new qx.ui.splitpane.Pane("horizontal");
      //mainPane.setDecorator("black");
      this._win.add(mainPane);

      // Left pane
      var leftWidget = new qx.ui.form.TextArea("Tree");
      leftWidget.setDecorator(null);
      leftWidget.setWidth(100);
      leftWidget.setWrap(true);
      mainPane.add(leftWidget, 0);

      // Right pane
      var rightWidget = new qx.ui.container.Composite;
      rightWidget.setLayout(new qx.ui.layout.Grow);
      mainPane.add(rightWidget, 1);

      // Right splitpane
      var rightPane = new qx.ui.splitpane.Pane("vertical");
      rightPane.setWidth(200);
      rightWidget.add(rightPane);

      // Content for right widget
      var list = new qx.ui.form.TextArea("List");
      list.setDecorator(null);
      var content = new qx.ui.form.TextArea("Content");
      content.setDecorator(null);

      rightPane.add(list, 1);
      rightPane.add(content, 2);
    }
  }
});
