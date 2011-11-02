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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.SplitPane",
{
  extend : qx.application.Standalone,

  members :
  {
    __pane : null,

    main: function()
    {
      this.base(arguments);

      // Create a scroll container and an outer container
      var scroller = new qx.ui.container.Scroll();
      var outerContainer = new qx.ui.container.Composite(new qx.ui.layout.Basic());
      outerContainer.setAllowStretchX(false);
      scroller.add(outerContainer);

      // Create a horizontal split pane
      var pane = new qx.ui.splitpane.Pane("horizontal").set({
        width : 450,
        height : 300
      });

      this.__pane = pane;

      // Create container with fixed dimensions for the left:
      var container1 = new qx.ui.container.Composite(new qx.ui.layout.Grow).set({
        width : 200,
        height: 100,
        decorator : "main"
      });

      // Create container for the right:
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.VBox(10)).set({
        padding : 10,
        maxWidth : 450,
        decorator : "main"
      });

      // Create some content here ...
      var tree = this.__createDummyTree();
      var button = new qx.ui.form.Button("Toggle Splitpane Orientation").set({
        allowGrowX : false,
        allowGrowY : false
      });

      // Add a listener to the button
      button.addListener("execute", this._toggle, this);
      var label = new qx.ui.basic.Label("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
      label.setRich(true);

      // ... and add it to the containers
      container1.add(tree);
      container2.add(button);
      container2.add(label);

      this._container1 = container1;
      this._container2 = container2;

      // Add the first container to the pane. Flex = 0 means that this child should not grow
      pane.add(container1, 0);

      // Add the second container. Flex = 1 means that this child should consume all available space.
      pane.add(container2, 1);

      // Add the pane to the outer container.
      outerContainer.add(pane, {left:20, top:40});

      // Finally add the scroll container to the root widget.
      this.getRoot().add(scroller, {edge : 0});

      var controlLayout = new qx.ui.layout.VBox(5);
      var controlContainer = new qx.ui.container.Composite(controlLayout);

      var show1 = new qx.ui.form.RadioButton("Show first pane");
      var show2 = new qx.ui.form.RadioButton("Show second pane");
      var show3 = new qx.ui.form.RadioButton("Show both panes");

      show1.setUserData("value", "first");
      show2.setUserData("value", "second");
      show3.setUserData("value", "both");

      show3.setValue(true);

      controlContainer.add(show1);
      controlContainer.add(show2);
      controlContainer.add(show3);

      var rbm = new qx.ui.form.RadioGroup(show1, show2, show3);

      rbm.addListener("changeSelection", this._changeVisiblity, this);

      outerContainer.add(controlContainer, {left:490, top:42});

      button.focus();


      // offset controll
      var offsetLabel = new qx.ui.basic.Label();
      this.getRoot().add(offsetLabel, {left: 490, top: 120});
      var offsetSlider = new qx.ui.form.Slider().set({
        minimum: 0, maximum: 30, value: 6, width: 100
      });
      this.getRoot().add(offsetSlider, {left: 490, top: 140});

      offsetSlider.bind("value", pane, "offset");
      offsetSlider.bind("value", offsetLabel, "value", {converter: function(data) {
        return "Offset (" + data + "):";
      }});
    },

    /**
     * Toggles the SplitPane's orientation
     */
    _toggle : function()
    {
      var orientation = this.__pane.getOrientation();
      this.__pane.setOrientation(orientation == "horizontal" ? "vertical" : "horizontal");
    },

    /**
     * Changes the SplitPane's children visibility
     * @param e {qx.event.type.Data} Incoming data event
     */
    _changeVisiblity : function(e)
    {
      var data = e.getData()[0].getUserData("value");

      if(data == "both")
      {
        this._container1.show();
        this._container2.show();
      }
      else if(data == "first")
      {
        this._container1.show();
        this._container2.exclude();
      }
      else if(data == "second")
      {
        this._container1.exclude();
        this._container2.show();
      }
    },

    /**
     * Returns a tree filled with dummy values.
     * @return {qx.ui.tree.Tree} The tree
     */
    __createDummyTree : function()
    {
      var tree = new qx.ui.tree.Tree();
      tree.setDecorator(null);

      var root = new qx.ui.tree.TreeFolder("/");
      root.setOpen(true);
      tree.setRoot(root);

      var te1 = new qx.ui.tree.TreeFolder("Desktop");
      te1.setOpen(true)
      root.add(te1);

      var te1_1 = new qx.ui.tree.TreeFolder("Files");
      var te1_2 = new qx.ui.tree.TreeFolder("Workspace");
      var te1_3 = new qx.ui.tree.TreeFolder("Network");
      var te1_4 = new qx.ui.tree.TreeFolder("Trash");
      te1.add(te1_1, te1_2, te1_3, te1_4);

      var te1_2_1 = new qx.ui.tree.TreeFile("Windows (C:)");
      var te1_2_2 = new qx.ui.tree.TreeFile("Documents (D:)");
      te1_2.add(te1_2_1, te1_2_2);



      var te2 = new qx.ui.tree.TreeFolder("Inbox");

      var te2_1 = new qx.ui.tree.TreeFolder("Presets");
      var te2_2 = new qx.ui.tree.TreeFolder("Sent");
      var te2_3 = new qx.ui.tree.TreeFolder("Trash");

      for (var i=0; i<100; i++) {
        te2_3.add(new qx.ui.tree.TreeFile("Junk #" + i));
      }

      var te2_4 = new qx.ui.tree.TreeFolder("Data");
      var te2_5 = new qx.ui.tree.TreeFolder("Edit");

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5);

      root.add(te2);

      return tree;
    }

  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__pane", "_container1", "_container2");
  }
});
