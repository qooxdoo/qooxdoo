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

/**
 * Test the edge case were the available height is normally enough. The content
 * however requires a higher width than the available width. This means it creates
 * a horizontal scrollbar and this way stoles the height the required size.
 */
qx.Class.define("demobrowser.demo.ui.ScrollContainer_EdgeCaseHeight",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      scrollContainer = new qx.ui.container.Scroll();
      scrollContainer.set({
        width: 200,
        height: 300
      });

      this.getRoot().add(scrollContainer, {left: 10, top: 10});
      scrollContainer.add(this.generateBox());

      // Area size toggle
      var toggle1 = new qx.ui.form.Button("Toggle pane");
      var grow1 = true;
      toggle1.addListener("execute", function()
      {
        scrollContainer.setWidth(grow1 ? 300 : 200);
        grow1 = !grow1;
      });
      this.getRoot().add(toggle1, {left: 330, top: 20});

      // Content size toggle
      var toggle2 = new qx.ui.form.Button("Toggle content");
      var grow2 = true;
      toggle2.addListener("execute", function()
      {
        scrollContainer.getChild().setWidth(grow2 ? 100 : 300);
        grow2 = !grow2;
      });
      this.getRoot().add(toggle2, {left: 430, top: 20});

      // Scrollbar change
      var mgr1 = this.generateScrollbarConfig("ScrollbarX:", 100);
      var mgr2 = this.generateScrollbarConfig("ScrollbarY:", 120);

      mgr1.addListener("changeValue", function(e) {
        scrollContainer.setScrollbarX(e.getData());
      });

      mgr2.addListener("changeValue", function(e) {
        scrollContainer.setScrollbarY(e.getData());
      });
    },

    generateScrollbarConfig : function(label, top)
    {
      var composite = new qx.ui.container.Composite(new qx.ui.layout.HBox(6));
      var label = new qx.ui.basic.Label(label);

      label.setMarginRight(20);

      var radio1 = new qx.ui.form.RadioButton("Auto");
      var radio2 = new qx.ui.form.RadioButton("On");
      var radio3 = new qx.ui.form.RadioButton("Off");

      radio1.setValue("auto");
      radio2.setValue("on");
      radio3.setValue("off");

      radio1.setChecked(true);

      var mgr = new qx.ui.form.RadioGroup(radio1, radio2, radio3);

      composite.add(label);
      composite.add(radio1);
      composite.add(radio2);
      composite.add(radio3);

      this.getRoot().add(composite, {left: 330, top: top});

      return mgr;
    },

    generateBox : function()
    {
      var box = new qx.ui.basic.Label("Content size: 300x300").set({
        width: 300,
        height: 300,
        allowShrinkX: false,
        allowShrinkY: false,
        backgroundColor: "blue",
        textColor: "white",
        padding: 10,
        decorator: new qx.ui.decoration.Single(4, "solid", "black")
      });
      return box;
    }
  }
});
