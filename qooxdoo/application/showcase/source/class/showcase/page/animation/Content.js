/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("showcase.page.animation.Content",
{
  extend : showcase.AbstractContent,
  
  construct : function(page) {
    this.base(arguments, page);

    this.setView(this.__createView());
  },
    
  
  members :
  {
    __effect : null,
    __container : null,
    __okButton : null,

    checkInput : function()
    {
      this.__effect.start();
    },

    __prepareEffect : function()
    {
      this.__effect = new qx.fx.effect.combination.Shake(this.__container.getContainerElement().getDomElement());
    },


    __createView : function() 
    {
      var view = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      /* Container layout */
      var layout = new qx.ui.layout.Grid(9, 5);
      layout.setColumnAlign(0, "right", "top");
      layout.setColumnAlign(2, "right", "top");

      /* Container widget */
      this.__container = new qx.ui.groupbox.GroupBox().set({
        contentPadding: [16, 16, 16, 16]
      });
      this.__container.setLayout(layout);

      view.add(this.__container, {left: 10, top: 30});

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



      return view;
    }
    
    
  }
});