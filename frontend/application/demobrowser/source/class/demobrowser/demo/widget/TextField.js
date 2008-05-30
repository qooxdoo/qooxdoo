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

qx.Class.define("demobrowser.demo.widget.TextField",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.VBox();
      box.setSpacing(10);

      var container = new qx.ui.container.Composite(box);
      container.setPadding(20);

      this.getRoot().add(container, {left:0,top:0});

      var input1 = new qx.ui.form.TextField("max5").set({
        maxLength: 5
      });
      container.add(input1);

      var input2 = new qx.ui.form.TextField("centered").set({
        padding: 10,
        allowGrowX: false,
        textAlign: "center"
      });
      container.add(input2);

      var input3 = new qx.ui.form.TextField("another").set({
        padding: 5,
        width: 200
      });
      container.add(input3);

      var input4 = new qx.ui.form.TextField("Web 2.0").set({
        decorator: "light-shadow",
        backgroundColor: "#FAEC84",
        font: qx.bom.Font.fromString("20px sans-serif"),
        padding: 7,
        width: 200
      });
      container.add(input4);

      input4.addListener("change", function(e) {
        this.debug("change event: " + e.getData());
      });
      input4.addListener("input", function(e) {
        this.debug("input event: " + e.getData());
      });

      var input6 = new qx.ui.form.TextField("read only").set({
        readOnly: true,
        padding: 5
      });
      container.add(input6);

      var input7 = new qx.ui.form.PasswordField("geheim").set({
        padding: 5
      });
      container.add(input7);

      var input8 = new qx.ui.form.TextField("A").set({
        padding: [0, 10],
        backgroundColor : "#DFDFDF",
        decorator : new qx.ui.decoration.Rounded().set({
          radius : 10,
          width : 1,
          color : "#ABABAB"
        })
      });
      container.add(input8);

      var input9 = new qx.ui.form.TextArea("text\narea").set({
        padding: 3,
        backgroundColor : "#DFDFDF",
        decorator : new qx.ui.decoration.Rounded().set({
          radius : 4,
          width : 1,
          color : "#ABABAB"
        })
      });
      container.add(input9);

      var input10 = new qx.ui.form.TextArea("text\narea\nnowrap").set({
        padding: 3,
        wrap : false
      });
      container.add(input10);

      var input11 = new qx.ui.form.TextField("large font").set({
        padding: 3,
        font : qx.bom.Font.fromString("24px sans-serif")
      });
      container.add(input11);

      var controls = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      controls.getLayout().setSpacing(8);


      var btnEnabled = new qx.ui.form.Button("Toggle enabled");
      var enable = false;
      btnEnabled.addListener("execute", function() {
        container.setEnabled(enable);
        enable = !enable;
      });
      controls.add(btnEnabled);


      var btnSend1 = new qx.ui.form.Button("Send content");
      btnSend1.addListener("execute", function() {
        this.debug("Sending content: " + input4.getValue());
      });
      controls.add(btnSend1);


      var btnSend2 = new qx.ui.form.Button("Send selection");
      btnSend2.setFocusable(false);
      btnSend2.setKeepFocus(true);
      btnSend2.addListener("execute", function() {
        this.debug("Sending selection: " + input4.getValue());
      });
      controls.add(btnSend2);


      this.getRoot().add(controls, {left:300, top:10});
    }
  }
});
