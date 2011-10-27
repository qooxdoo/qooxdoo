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

qx.Class.define("demobrowser.demo.layout.HSplit",
{
  extend : qx.application.Standalone,

  members :
  {
    /**
     * TODOC
     *
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      // Two Flex Tests
      this.addSplitPaneTwoFlexSimple();
      this.addSplitPaneTwoFlexWithOneMin();
      this.addSplitPaneTwoFlexWithOneMax();
      this.addSplitPaneTwoFlexWithTwoMin();
      this.addSplitPaneTwoFlexWithTwoMax();

      // One Flex Test
      this.addSplitPaneOneFlexSimple();
      this.addSplitPaneOneFlexSimpleWithMax();
      this.addSplitPaneOneFlexSimpleWithMin();

      // Auto Size
      this.addSplitPaneAuto();
    },


    addSplitPaneTwoFlexSimple : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:20, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithOneMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:20, top:100});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1; Min:250");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      leftWidget.setMinWidth(250);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithOneMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:20, top:180});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2; Max:100");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      rightWidget.setMaxWidth(100);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithTwoMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:20, top:260});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1; Min:250");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      leftWidget.setMinWidth(250);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2; Min:250");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      rightWidget.setMinWidth(250);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithTwoMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:20, top:340});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1; Max:100");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      leftWidget.setMaxWidth(100);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2; Max:100");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      rightWidget.setMaxWidth(100);
      splitpane.add(rightWidget, 2);
    },






    addSplitPaneOneFlexSimple : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:500, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:0");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:1");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      splitpane.add(rightWidget);
    },


    addSplitPaneOneFlexSimpleWithMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:500, top:100});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:0");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:1; Max:200");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      rightWidget.setMaxWidth(200);
      splitpane.add(rightWidget);
    },


    addSplitPaneOneFlexSimpleWithMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setWidth(400);
      splitpane.setHeight(60);
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:500, top:180});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:0; Min:350");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      leftWidget.setMinWidth(350);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:1");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      splitpane.add(rightWidget);
    },






    addSplitPaneAuto : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("horizontal");
      splitpane.setDecorator("main");
      this.getRoot().add(splitpane, {left:500, top:340});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Auto");
      leftWidget.setDecorator(null);
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Auto");
      rightWidget.setDecorator(null);
      rightWidget.setWrap(true);
      splitpane.add(rightWidget);
    }
  }
});
