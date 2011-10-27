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

qx.Class.define("demobrowser.demo.layout.VSplit",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroll = new qx.ui.container.Scroll();
      this.getRoot().add(scroll, {edge: 0});

      var root = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
        padding: 20,
        allowShrinkX: false,
        allowShrinkY: false
      })
      scroll.add(root);

      // Two Flex Tests
      root.add(this.getSplitPaneTwoFlexSimple(), {left: 0});
      root.add(this.getSplitPaneTwoFlexWithOneMin(), {left: 210});
      root.add(this.getSplitPaneTwoFlexWithOneMax(), {left: 420});
      root.add(this.getSplitPaneTwoFlexWithTwoMin(), {left: 630});
      root.add(this.getSplitPaneTwoFlexWithTwoMax(), {left: 840});

      // One Flex Test
      root.add(this.getSplitPaneOneFlexSimple(), {top: 550, left: 0});
      root.add(this.getSplitPaneOneFlexSimpleWithMax(), {top: 550, left: 210});
      root.add(this.getSplitPaneOneFlexSimpleWithMin(), {top: 550, left: 420});

      // Auto Size
      root.add(this.getSplitPaneAuto(), {top: 550, left: 630});
    },


    getSplitPaneTwoFlexSimple : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:1");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      splitpane.add(topWidget, 1);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:2");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      splitpane.add(bottomWidget, 2);

      return splitpane;
    },


    getSplitPaneTwoFlexWithOneMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:1; Min:250");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      topWidget.setMinHeight(250);
      splitpane.add(topWidget, 1);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:2");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      splitpane.add(bottomWidget, 2);

      return splitpane;
    },


    getSplitPaneTwoFlexWithOneMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:1");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      splitpane.add(topWidget, 1);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:2; Max:100");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      bottomWidget.setMaxHeight(100);
      splitpane.add(bottomWidget, 2);

      return splitpane;
    },


    getSplitPaneTwoFlexWithTwoMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:1; Min:250");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      topWidget.setMinHeight(250);
      splitpane.add(topWidget, 1);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:2; Min:250");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      bottomWidget.setMinHeight(250);
      splitpane.add(bottomWidget, 2);

      return splitpane;
    },


    getSplitPaneTwoFlexWithTwoMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:1; Max:100");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      topWidget.setMaxHeight(100);
      splitpane.add(topWidget, 1);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:2; Max:100");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      bottomWidget.setMaxHeight(100);
      splitpane.add(bottomWidget, 2);

      return splitpane;
    },


    getSplitPaneOneFlexSimple : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:0");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      splitpane.add(topWidget, 0);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:1");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      splitpane.add(bottomWidget);
      return splitpane;
    },


    getSplitPaneOneFlexSimpleWithMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:0");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      splitpane.add(topWidget, 0);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:1; Max:200");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      bottomWidget.setMaxHeight(200);
      splitpane.add(bottomWidget);

      return splitpane;
    },


    getSplitPaneOneFlexSimpleWithMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Flex:0; Min:350");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      topWidget.setMinHeight(350);
      splitpane.add(topWidget, 0);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Flex:1");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      splitpane.add(bottomWidget);

      return splitpane;
    },


    getSplitPaneAuto : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setDecorator("main");

      // Left
      var topWidget = new qx.ui.form.TextArea("Auto");
      topWidget.setDecorator(null);
      topWidget.setWrap(true);
      splitpane.add(topWidget, 0);

      // Right
      var bottomWidget = new qx.ui.form.TextArea("Auto");
      bottomWidget.setDecorator(null);
      bottomWidget.setWrap(true);
      splitpane.add(bottomWidget);

      return splitpane;
    }
  }
});
