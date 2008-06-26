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

qx.Class.define("demobrowser.demo.animation.Login_Sample",
{
  extend : qx.application.Standalone,

  members :
  {

  	checkInput : function()
  	{
  		this.__effect.start();
  	},

  	__prepareEffect : function()
  	{
  	  this.__effect = new qx.fx.effect.combination.Shake(this.__container.getContainerElement().getDomElement());
  	},

    main: function()
    {
      this.base(arguments);

      /* Container layout */
      var layout = new qx.ui.layout.Grid(9, 5);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnAlign(2, "right", "top");

      /* Container widget */
      this.__container = new qx.ui.container.Composite(layout).set({
        decorator: "pane",
        padding: 16,
        backgroundColor: "pane"
      });

      this.getRoot().add(this.__container, {left:40, top:40});

      /* Labels */
      var labels = ["Name", "Password"];
      for (var i=0; i<labels.length; i++) {
        this.__container.add(new qx.ui.basic.Label(labels[i]).set({
          allowShrinkX: false,
          paddingTop: 3
        }), {row: i, column : 0});
      }
      
      /* Text fields */
			var field1 = new qx.ui.form.TextField();
			var field2 = new qx.ui.form.PasswordField();

			this.__container.add(field1.set({
        allowShrinkX: false,
        paddingTop: 3
      }), {row: 0, column : 1});

			this.__container.add(field2.set({
        allowShrinkX: false,
        paddingTop: 3
      }), {row: 1, column : 1});

			/* Button */
			var button1 = this.__okButton =  new qx.ui.form.Button("Login");
			button1.setAllowStretchX(false);

      this.__container.add(
        button1,
        {
          row : 3,
          column : 1
        }
      );

			/* Check input on click */
      button1.addListener("execute", this.checkInput, this);

			/* Prepare effect as soon as the container is ready */
			this.__container.addListener("appear", this.__prepareEffect, this);

    }
  }
});
