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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.SplitPane_Simple",
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

      var doc = this.getRoot();
      var frame = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      doc.add(frame, {left : 40, top : 60});

      // //frame.setEdge(20);
      // the splitpane itself
      var splitpane = new qx.ui.splitpane.Pane("horizontal", 1, 2);

      // //splitpane.setEdge(0);
      frame.add(splitpane);
      return;

      // left Widget
      var leftWidget = new qx.ui.form.TextArea("LeftWidget");
      leftWidget.setWrap(true);
      leftWidget.setBackgroundColor("white");

      // //leftWidget.setWidth("100%");
      // //leftWidget.setHeight("100%");
      // rightWidget (another splitpane)
      var rightWidget = new qx.ui.splitpane.Pane;

      // //rightWidget.setHeight("100%");
      // //rightWidget.setWidth("100%");
      rightWidget.setLiveResize(true);

      // add widgets to splitpane
      splitpane.addLeft(leftWidget);
      splitpane.addRight(rightWidget);

      // right top widget
      var topWidget = new qx.ui.form.TextArea("Right Top Widget");
      topWidget.setBackgroundColor("white");

      // //topWidget.setHeight("100%");
      // //topWidget.setWidth("100%");
      // right bottom widget
      var bottomWidget = new qx.ui.embed.Iframe("http://www.qooxdoo.org");

      // //bottomWidget.setHeight("100%");
      // //bottomWidget.setWidth("100%");
      // add widgets to right splitpane
      rightWidget.addTop(topWidget);
      rightWidget.addBottom(bottomWidget);
    }
  }
});
