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

qx.Class.define("demobrowser.demo.layout.VSplitLayout",
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
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:20, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1");
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2");
      rightWidget.setWrap(true);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithOneMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:140, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1; Min:250");
      leftWidget.setWrap(true);
      leftWidget.setMinHeight(250);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2");
      rightWidget.setWrap(true);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithOneMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:260, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1");
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2; Max:100");
      rightWidget.setWrap(true);
      rightWidget.setMaxHeight(100);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithTwoMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:380, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1; Min:250");
      leftWidget.setWrap(true);
      leftWidget.setMinHeight(250);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2; Min:250");
      rightWidget.setWrap(true);
      rightWidget.setMinHeight(250);
      splitpane.add(rightWidget, 2);
    },


    addSplitPaneTwoFlexWithTwoMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:500, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:1; Max:100");
      leftWidget.setWrap(true);
      leftWidget.setMaxHeight(100);
      splitpane.add(leftWidget, 1);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:2; Max:100");
      rightWidget.setWrap(true);
      rightWidget.setMaxHeight(100);
      splitpane.add(rightWidget, 2);
    },






    addSplitPaneOneFlexSimple : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:620, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:0");
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:1");
      rightWidget.setWrap(true);
      splitpane.add(rightWidget);
    },


    addSplitPaneOneFlexSimpleWithMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:740, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:0");
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:1; Max:200");
      rightWidget.setWrap(true);
      rightWidget.setMaxHeight(200);
      splitpane.add(rightWidget);
    },


    addSplitPaneOneFlexSimpleWithMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:860, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Flex:0; Min:350");
      leftWidget.setWrap(true);
      leftWidget.setMinHeight(350);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Flex:1");
      rightWidget.setWrap(true);
      splitpane.add(rightWidget);
    },






    addSplitPaneAuto : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setDecorator("black");
      this.getRoot().add(splitpane, {left:980, top:20});

      // Left
      var leftWidget = new qx.ui.form.TextArea("Auto");
      leftWidget.setWrap(true);
      splitpane.add(leftWidget, 0);

      // Right
      var rightWidget = new qx.ui.form.TextArea("Auto");
      rightWidget.setWrap(true);
      splitpane.add(rightWidget);
    }
  }
});
