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

qx.Class.define("demobrowser.demo.widget.CheckBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var label = new qx.ui.basic.Label("What do you need for the beach?");

      // create the main layout
      var mainLayout = new qx.ui.layout.VBox();
      mainLayout.setSpacing(10);

      // add the main layout to a container widget and to the document root
      var container = new qx.ui.container.Composite(mainLayout);
      container.setPadding(20);

      this.getRoot().add(container, {left:0,top:0});

      container.add(label);

      // Create some radio buttons
      var cbOil = new qx.ui.form.CheckBox("Sun Oil");
      var cbTowel = new qx.ui.form.CheckBox("Towel");
      var cbBeer = new qx.ui.form.CheckBox("Beer");
      var cbBT =  new qx.ui.form.CheckBox("Bathing togs");

      this._checkBoxes = [ cbOil, cbTowel, cbBeer, cbBT ];

      // Add them to the container
      container.add(cbOil);
      container.add(cbTowel);
      container.add(cbBeer);
      container.add(cbBT);

      var btOk = new qx.ui.form.Button("OK");
      btOk.addListener("execute", this._onExecute, this);
      btOk.setAllowGrowX(false);

      container.add(btOk);
    },

    /**
     * Reads the labels of all checked checkboxes and raises an
     * alert box with these values in it.
     * @param e {qx.event.type.Data} The incoming data event
     * @lint ignoreDeprecated(alert)
     */
    _onExecute : function(e)
    {
      var cbs = this._checkBoxes;
      var count = 0;
      var str = "";

      for (var i=0; i<cbs.length; i++)
      {
        if (cbs[i].getValue())
        {
          count++;
          str += (cbs[i].getLabel()  + ", ");
        }
      }

      if (count > 0)
      {
        str = str.substring(0, str.length-2);
        alert("You need these things for the beach: " + str);
      }
      else
      {
        alert("Are you sure you need nothing for the beach?");
      }
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeArray("_checkBoxes");
  }
});
