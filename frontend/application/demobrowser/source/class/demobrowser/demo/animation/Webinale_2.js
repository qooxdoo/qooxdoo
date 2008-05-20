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

qx.Class.define("demobrowser.demo.animation.Webinale_2",
{
  extend : qx.application.Standalone,

  members :
  {
    __prepareEffects : function()
    {
      this.__showEffect = new qx.fx.effect.combination.Grow(this.__dialog.getContainerElement().getDomElement());
      this.__hideEffect = new qx.fx.effect.combination.Shrink(this.__dialog.getContainerElement().getDomElement());
    },


		showDialog : function()
		{
			this.__dialog.setOpacity(1);
			this.__showEffect.start();
		},


		hideDialog : function()
		{
			this.__hideEffect.start();
		},


    main: function()
    {
      this.base(arguments);
      
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);

      var layout = new qx.ui.layout.VBox();

      this.__container = new qx.ui.container.Composite(layout).set({
        decorator: "pane",
        padding: 16,
        backgroundColor: "pane"
      });

      this.getRoot().add(this.__container, {left:40, top:40});


      var layout2 = new qx.ui.layout.Grid(9, 5);
      layout2.setColumnAlign(0, "right", "top");
      layout2.setColumnAlign(2, "right", "top");

      var layout2 = new qx.ui.layout.VBox();

			this.__dialog = new qx.ui.container.Composite(layout2).set({
        decorator: "pane",
        padding: 16,
        width:500,
        height:150,
        backgroundColor: "pane"
      });
      
      var buttons = [
      	"Don't save",
      	"Cancel",
      	"Save..."
     	];
      
      for(var i=0; i<buttons.length; i++)
      {
      	var tmp = new qx.ui.form.Button(buttons[i]);
	      this.__dialog.add(tmp);
	      tmp.addListener("execute", this.hideDialog, this);
      }

      
      var text = "Lorem ipsum dolor sit amet, consectetuer sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.\n\nDuis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.\n\nUt wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi";
      
      var textarea1 = new qx.ui.form.TextArea(text);

      // text area
      this.__container.add(textarea1.set({
      	width: 400,
        height: 250
      }));
      
      var button1 = new qx.ui.form.Button("close");
      
      button1.addListener("execute", this.showDialog, this);
      
      this.__container.add(button1);
      
      this.getRoot().add(this.__dialog, {
        left:120,
        top:60,
      });

			this.__dialog.setOpacity(0);
      this.__dialog.addListener("appear", this.__prepareEffects, this);

//			this.__dialog.include();      
//			debugger;
//      this.__dialog.setVisibility("visible");
      //this.__dialog.setVisibility("hidden");

    }
  }
});
