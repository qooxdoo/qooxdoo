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

qx.Class.define("demobrowser.demo.ui.Input_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var docLayout = new qx.ui.layout.VBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

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

      var input3 = new qx.ui.form.TextField("spell checked").set({
        padding: 5,
        width: 200,
        height: 30,
        spellCheck: true
      });
      docLayout.add(input3);

      var input4 = new qx.ui.form.TextField("styled").set({
        decorator: "light-shadow",
        backgroundColor: "#FAEC84",
        padding: 5,
        width: 200,
        height: 30
      });
      docLayout.add(input4);

      input4.addListener("changeValue", function(e) {
        this.debug("Value change: " + input4.getValue());
      });

      var input6 = new qx.ui.form.TextField("read only").set({
        readOnly: true,
        padding: 5
      });
      docLayout.add(input6);


      var controls = new qx.ui.core.Widget();
      controls.setLayout(new qx.ui.layout.VBox());

      var btn = new qx.ui.form.Button("toggle enabled");
      var enable = false;
      btn.addListener("execute", function() {
        container.setEnabled(enable);
        enable = !enable;
      });
      controls.getLayout().add(btn);
      doc.add(controls, 300, 10);

    }
  }
});
