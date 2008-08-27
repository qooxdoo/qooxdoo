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
        height: 100
      });

      // Create container for the right:
      var container2 = new qx.ui.container.Composite(new qx.ui.layout.Grow).set({
        padding : 10
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

      // Add the first container to the pane. Flex = 0 means that this child should not grow
      pane.add(container1, 0);

      // Add the second container. Flex = 1 means that this child should consume all available space.
      pane.add(container2, 1);

      // Finally add the pane to the root widget.
      this.getRoot().add(pane, {left:20, top:20});
    },

    /**
     * Toggles the SplitPane's orientation
     */
    _toggle : function()
    {
      var orientation = this.__pane.getOrientation();
      this.__pane.setOrientation(orientation == "horizontal" ? "vertical" : "horizontal");
    }

  }
});
