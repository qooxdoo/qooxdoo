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

qx.Class.define("demobrowser.demo.ui.Font",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var label = new qx.ui.basic.Label("Hello World").set({
        decorator: new qx.ui.decoration.Single(1, "solid", "red")
      });
      this.getRoot().add(label, {left:20, top:20});

      var controls = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({spacing: 10}));
      this.getRoot().add(controls, {left:200, top:20});

      var b1 = new qx.ui.form.Button("Serif, 16px");
      controls.add(b1);

      var b2 = new qx.ui.form.Button("Serif, 24px");
      controls.add(b2);

      var b3 = new qx.ui.form.Button("Sans Serif, 16px");
      controls.add(b3);

      var b4 = new qx.ui.form.Button("Sans Serif, 24px");
      controls.add(b4);

      var b5 = new qx.ui.form.Button("Sans Serif, 24px bold");
      controls.add(b5);

      b1.addListener("execute", function() {
        label.setFont(qx.bom.Font.fromString("16px serif"));
      });

      b2.addListener("execute", function() {
        label.setFont(qx.bom.Font.fromString("24px serif"));
      });

      b3.addListener("execute", function() {
        label.setFont(qx.bom.Font.fromString("16px sans-serif"));
      });

      b4.addListener("execute", function() {
        label.setFont(qx.bom.Font.fromString("24px sans-serif"));
      });

      b5.addListener("execute", function() {
        label.setFont(qx.bom.Font.fromString("24px sans-serif bold"));
      });
    }
  }
});
