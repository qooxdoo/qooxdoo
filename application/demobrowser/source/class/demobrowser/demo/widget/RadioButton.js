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

qx.Class.define("demobrowser.demo.widget.RadioButton",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var label = new qx.ui.basic.Label("What is your favorite color?");

      // create the main layout
      var mainLayout = new qx.ui.layout.VBox();
      mainLayout.setSpacing(10);

      // add the main layout to a container widget and to the document root
      var container = new qx.ui.container.Composite(mainLayout);
      container.setPadding(20);

      this.getRoot().add(container, {left:0,top:0});

      container.add(label);

      // Create some radio buttons
      var rbRed = new qx.ui.form.RadioButton("Red");
      var rbGreen = new qx.ui.form.RadioButton("Green");
      var rbYellow = new qx.ui.form.RadioButton("Yellow");
      var rbBlue = new qx.ui.form.RadioButton("Blue");

      // Add them to the container
      container.add(rbRed);
      container.add(rbGreen);
      container.add(rbYellow);
      container.add(rbBlue);

      // Add all radio buttons to the manager
      var manager = new qx.ui.form.RadioGroup(rbRed, rbGreen, rbYellow, rbBlue);

      // Add a listener to the "changeSelected" event
      manager.addListener("changeSelection", this._onChangeSelection, this);
    },

    /**
     * Reads the label of the selected radio button and
     * raises a alert box with this information in it.
     * @param e {qx.event.type.Data} The incoming data event
     * @lint ignoreDeprecated(alert)
     */
    _onChangeSelection : function(e)
    {
      var selectedButton = e.getData()[0];
      var color = selectedButton.getLabel();
      alert("Your favorite color is: " + color);
    }
  }
});
