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
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:20, top:20});

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
    },


    addSplitPaneTwoFlexWithOneMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:140, top:20});

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
    },


    addSplitPaneTwoFlexWithOneMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:260, top:20});

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
    },


    addSplitPaneTwoFlexWithTwoMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:380, top:20});

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
    },


    addSplitPaneTwoFlexWithTwoMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:500, top:20});

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
    },






    addSplitPaneOneFlexSimple : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:620, top:20});

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
    },


    addSplitPaneOneFlexSimpleWithMax : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:740, top:20});

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
    },


    addSplitPaneOneFlexSimpleWithMin : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setHeight(400);
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:860, top:20});

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
    },






    addSplitPaneAuto : function()
    {
      var splitpane = new qx.ui.splitpane.Pane("vertical");
      splitpane.setDecorator("dark");
      this.getRoot().add(splitpane, {left:980, top:20});

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
    }
  }
});
