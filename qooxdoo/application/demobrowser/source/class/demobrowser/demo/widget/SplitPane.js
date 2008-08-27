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

qx.Class.define("demobrowser.demo.widget.SplitPane",
{
  extend : qx.application.Standalone,

  members :
  {
    __pane : null,
    
    main: function()
    {
      this.base(arguments);

      // Create a horizontal split pane
      var pane = new qx.ui.splitpane.Pane("horizontal").set({
        width : 600,
        height : 400
      });

      this.__pane = pane;

      // Create container with fixed dimensions for the left:
      var container1 = new qx.ui.container.Composite(new qx.ui.layout.Grow).set({
        padding : 10,
        width : 100,
        height: 100,
        decorator : "main"
      });

      // Create container for the right:
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.Grow).set({
        padding : 10,
        decorator : "main"
      });

      // Create some content here ...
      var label = new qx.ui.basic.Label("First pane");
      var button = new qx.ui.form.Button("Toggle Splitpane Orientation").set({
        allowGrowX : false,
        allowGrowY : false
      });

      // Add a listener to the button
      button.addListener("execute", this._toggle, this);

      // ... and add it to the containers
      container1.add(label);
      container2.add(button);

      this._container1 = container1;
      this._container2 = container2;

      // Add the first container to the pane. Flex = 0 means that this child should not grow
      pane.add(container1, 0);

      // Add the second container. Flex = 1 means that this child should consume all available space.
      pane.add(container2, 1);

      // Finally add the pane to the root widget.
      this.getRoot().add(pane, {left:20, top:40});


      var controlLayout = new qx.ui.layout.VBox(5);
      var controlContainer = new qx.ui.container.Composite(controlLayout);

      var show1 = new qx.ui.form.RadioButton("Show first pane");
      var show2 = new qx.ui.form.RadioButton("Show second pane");
      var show3 = new qx.ui.form.RadioButton("Show both panes");

      show1.setValue("first");
      show2.setValue("second");
      show3.setValue("both");

      show3.setChecked(true);

      controlContainer.add(show1);
      controlContainer.add(show2);
      controlContainer.add(show3);

      var rbm = new qx.ui.form.RadioGroup(show1, show2, show3);

      rbm.addListener("changeValue", this._changeVisiblity, this);

      this.getRoot().add(controlContainer, {left:645, top:42});

      button.focus();

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
     */
    _changeVisiblity : function(e)
    {
      var data = e.getData();
      
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

    }

  }
});
