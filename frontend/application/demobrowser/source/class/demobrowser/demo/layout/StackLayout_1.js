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

qx.Class.define("demobrowser.demo.layout.StackLayout_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);

      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var container = new qx.ui.core.Widget();
      var containerLayout = new qx.ui.layout.HBox();
      containerLayout.setSpacing(20);
      container.setLayout(containerLayout);
      doc.add(container, 0, 0);

      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // "normal" size, auto-sized
      var widget1 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.Stack();

      var widgets1 = [];
      widgets1[0] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "red", height: 300});
      widgets1[1] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue"});
      widgets1[2] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "orange", width: 200});
      widgets1[3] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"});
      widgets1[4] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "fuchsia"});

      for (var i=0; i<widgets1.length; i++)
      {
        var widget = widgets1[i];
        layout1.add(widget);
        widget.addListener("click", qx.lang.Function.bind(function(index) {
          layout1.setSelected(widgets1[(index+1) % widgets1.length]);
        }, this, [i]));

        widget.addListener("appear", qx.lang.Function.bind(function(index) {
          this.debug("Appear of widget: " + index);
        }, this, [i]));

        widget.addListener("disappear", qx.lang.Function.bind(function(index) {
          this.debug("Disappear of widget: " + index);
        }, this, [i]));

        widget.addListener("show", qx.lang.Function.bind(function(index) {
          this.debug("Show widget: " + index);
        }, this, [i]));

        widget.addListener("hide", qx.lang.Function.bind(function(index) {
          this.debug("Hide widget: " + index);
        }, this, [i]));
      }
      widget1.setLayout(layout1);

      containerLayout.add(widget1);


      // resize to selected, auto-sized
      var widget2 = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow", allowGrowY: false});
      layout2 = new qx.ui.layout.Stack();
      layout2.setResizeToSelected(true);

      var widgets2 = [];
      widgets2[0] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "red", height: 300});
      widgets2[1] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "blue"});
      widgets2[2] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "orange", width: 200});
      widgets2[3] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "green"});
      widgets2[4] = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "fuchsia"});

      for (var i=0; i<widgets2.length; i++)
      {
        var widget = widgets2[i];
        layout2.add(widget);
        widget.addListener("click", qx.lang.Function.bind(function(index) {
          layout2.setSelected(widgets2[(index+1) % widgets2.length]);
        }, this, [i]));
      }
      widget2.setLayout(layout2);

      containerLayout.add(widget2);
    }
  }
});
