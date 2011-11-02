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

    this.setView(this._createView());
  },


  members :
  {



    __effect : null,
    __okButton : null,
    __showEffect : null,
    __dialog : null,
    __hideEffect : null,
    __container : null,

    checkInput : function()
    {
      this.__effect.start();
    },

    __prepareEffect : function()
    {
      this.__effect = new qx.fx.effect.combination.Shake(this.__container.getContainerElement().getDomElement());

      this.__showEffect = new qx.fx.effect.core.Fade(
        this.__dialog.getContainerElement().getDomElement()
      ).set({
        from : 0,
        to : 1,
        modifyDisplay : true
      });

      this.__hideEffect = new qx.fx.effect.core.Fade(
        this.__dialog.getContainerElement().getDomElement()
      ).set({
        from : 1,
        to : 0,
        modifyDisplay : true
      });

      this.__dialog.getContainerElement().getDomElement().style.display = "none";
    },

    showDialog : function()
    {
      this.__showEffect.start();
    },


    hideDialog : function()
    {
      this.__hideEffect.start();
    },

    _createView : function()
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

      view.add(this.__container, {left: 50, top: 50});

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
      }), {row: 0, column : 1, colSpan : 2});

      this.__container.add(field2.set({
        allowShrinkX: false,
        paddingTop: 3
      }), {row: 1, column : 1, colSpan : 2});

      /* Buttons */
      var okButton = this.__okButton =  new qx.ui.form.Button("OK");
      var cancelButton = new qx.ui.form.Button("Cancel");

      okButton.setAllowStretchX(false);

      this.__container.add(
        okButton,
        {
          row : 3,
          column : 1
        }
      );

      this.__container.add(
        cancelButton,
        {
          row : 3,
          column : 2
        }
      );

      /* Check input on click */
      okButton.addListener("execute", this.checkInput, this);

      /* Check input on click */
      cancelButton.addListener("execute", this.showDialog, this);

      this.__dialog = new qx.ui.groupbox.GroupBox().set({
        contentPadding: 16,
        width : 220
      });
      this.__dialog.setLayout(new qx.ui.layout.VBox(10));

      /* Labels  */
      var label1 = new qx.ui.basic.Label('<b "font-size:12pt;">Come on, log in!</b>');
      var label2 = new qx.ui.basic.Label("You can not continue otherwise.");

      label1.set({
        rich : true
      });

      this.__dialog.add(label1);
      this.__dialog.add(label2);

      var tmp = new qx.ui.form.Button("OK, fine!");
      tmp.setAllowStretchX(false);
      this.__dialog.add(tmp);

      /* Hide dialog on click */
      tmp.addListener("execute", this.hideDialog, this);

      view.add(this.__dialog, {top : 48, left : 40});

      qx.ui.core.queue.Manager.flush();
      this.__dialog.addListenerOnce("appear", this.__prepareEffect, this);


      return view;
    }


  }
});