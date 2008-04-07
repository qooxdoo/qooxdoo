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

qx.Class.define("demobrowser.demo.widget.Input_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var docLayout = new qx.ui.layout.VBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      this.getRoot().add(container, 0, 0);

      var input1 = new qx.ui.form.TextField("max5").set({
        maxLength: 5
      });
      docLayout.add(input1);

      var input2 = new qx.ui.form.TextField("centered").set({
        padding: 10,
        allowGrowX: false,
        textAlign: "center"
      });
      docLayout.add(input2);

      var input3 = new qx.ui.form.TextField("another").set({
        padding: 5,
        width: 200
      });
      docLayout.add(input3);

      var input4 = new qx.ui.form.TextField("Web 2.0").set({
        decorator: "light-shadow",
        backgroundColor: "#FAEC84",
        font: qx.bom.Font.fromString("20px sans-serif"),
        padding: 7,
        width: 200
      });
      docLayout.add(input4);

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
      docLayout.add(input6);

      var input7 = new qx.ui.form.PasswordField("geheim").set({
        padding: 5
      });
      docLayout.add(input7);

      var input8 = new qx.ui.form.TextField("A").set({
        padding: [0, 10],
        backgroundColor : "#DFDFDF",
        decorator : new qx.ui.decoration.Rounded().set({
          radius : 10,
          width : 1,
          color : "#ABABAB"
        })
      });
      docLayout.add(input8);

      var input9 = new qx.ui.form.TextArea("text\narea").set({
        padding: 3,
        backgroundColor : "#DFDFDF",
        decorator : new qx.ui.decoration.Rounded().set({
          radius : 4,
          width : 1,
          color : "#ABABAB"
        })
      });
      docLayout.add(input9);

      var input10 = new qx.ui.form.TextArea("text\narea\nnowrap").set({
        padding: 3,
        wrap : false
      });
      docLayout.add(input10);

      var input11 = new qx.ui.form.TextField("large font").set({
        padding: 3,
        font : qx.bom.Font.fromString("24px sans-serif")
      });
      docLayout.add(input11);

      var controls = new qx.ui.core.Widget();
      controls.setLayout(new qx.ui.layout.VBox());
      controls.getLayout().setSpacing(8);

      var btnEnabled = new qx.ui.form.Button("Toggle enabled");
      var enable = false;
      btnEnabled.addListener("execute", function() {
        container.setEnabled(enable);
        enable = !enable;
      });
      controls.getLayout().add(btnEnabled);


      var btnSend = new qx.ui.form.Button("Send content");
      btnSend.addListener("execute", function() {
        this.debug("Sending content: " + input4.getValue());
      });
      controls.getLayout().add(btnSend);


      this.getRoot().add(controls, 300, 10);
    }
  }
});
