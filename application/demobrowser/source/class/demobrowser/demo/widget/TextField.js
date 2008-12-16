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

      var input1 = new qx.ui.form.TextField("max15").set({
        maxLength: 15
      });
      input1.focus();
      input1.addListener("input", function(e) {
        this.debug("Input: " + e.getData());
      }, this);
      input1.addListener("changeValue", function(e) {
        this.debug("ChangeValue: " + e.getData());
      }, this);
      container.add(input1);

      var input4 = new qx.ui.form.TextField("Web 2.0").set({
        font: qx.bom.Font.fromString("20px sans-serif"),
        padding: 6
      });
      container.add(input4);

      var input6 = new qx.ui.form.TextField("read only").set({
        readOnly: true
      });
      container.add(input6);

      var input9 = new qx.ui.form.TextArea("text\narea");
      container.add(input9);

      var input10 = new qx.ui.form.TextArea("text\narea\nnowrap");
      input10.setWrap(false);
      container.add(input10);

      var input11 = new qx.ui.form.TextArea("text\narea\nmonospace");
      input11.setFont("monospace");
      container.add(input11);





      var controls = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
      controls.setPadding(20);

      var btnEnabled = new qx.ui.form.Button("Toggle enabled");
      var enable = false;
      btnEnabled.addListener("execute", function() {
        container.setEnabled(enable);
        enable = !enable;
      });
      controls.add(btnEnabled);


      var btnSend1 = new qx.ui.form.Button("Send content");
      btnSend1.addListener("execute", function() {
        this.debug("Sending content: " + input1.getValue());
      });
      controls.add(btnSend1);


      var btnSend2 = new qx.ui.form.Button("Send selection");
      btnSend2.setFocusable(false);
      btnSend2.setKeepFocus(true);
      btnSend2.addListener("execute", function() {
        this.debug("Sending selection: " + input1.getSelection());
      });
      controls.add(btnSend2);


      this.getRoot().add(controls, {left:200, top:0});
    }
  }
});
