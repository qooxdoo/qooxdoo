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

qx.Class.define("demobrowser.demo.widget.List_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var l1 = new qx.ui.form.List;

      l1.set({ height: 200, width: 150 });

      var item;
      for( var i=1; i<=25; i++ )
      {
        item = new qx.ui.form.ListItem("Item No " + i, "icon/" + ((i % 4) ? "16" : "48") + "/places/folder.png");

        !(i % 9) && (item.setEnabled(false));
        l1.add(item);
      };

      this.getRoot().add(l1, 20, 20);

      var l2 = new qx.ui.form.List;

      l2.set({ height: 200, width: 150 });
      l2.getManager().setMultiSelection(false);

      var l2l = [ "red", "violett", "rose", "blue", "green", "cyan", "magenta", "yellow", "brown", "orange", "black", "white", "grey", "gray", "brown" ];

      for (var i=0; i<l2l.length; i++) {
        l2.add(new qx.ui.form.ListItem(l2l[i]));
      };

      this.getRoot().add(l2, 400, 48);




      var c1 = new qx.ui.form.CheckBox("Enable Multi-Selection");
      var c2 = new qx.ui.form.CheckBox("Enable Drag-Selection");
      var c3 = new qx.ui.form.CheckBox("Allow Deselection");
      var c4 = new qx.ui.form.CheckBox("Enable Inline Find");

      this.getRoot().add(c1, 180, 48);
      this.getRoot().add(c2, 180, 68);
      this.getRoot().add(c3, 180, 88);
      this.getRoot().add(c4, 180, 108);

      c1.setChecked(true);
      c2.setChecked(true);
      c3.setChecked(true);
      c4.setChecked(true);

      c1.addEventListener("changeChecked", function(e) {
        l1.getManager().setMultiSelection(e.getData());
      });

      c2.addEventListener("changeChecked", function(e) {
        l1.getManager().setDragSelection(e.getData());
      });

      c3.addEventListener("changeChecked", function(e) {
        l1.getManager().setCanDeselect(e.getData());
      });

      c4.addEventListener("changeChecked", function(e) {
        l1.setEnableInlineFind(e.getData());
      });





      var rd1 = new qx.ui.form.RadioButton("Show Label", "label");
      var rd2 = new qx.ui.form.RadioButton("Show Icon", "icon");
      var rd3 = new qx.ui.form.RadioButton("Show Both", "both");

      this.getRoot().add(rd1, 180, 128);
      this.getRoot().add(rd2, 180, 148);
      this.getRoot().add(rd3, 180, 168);

      rd3.setChecked(true);

      var rbm = new qx.ui.core.RadioManager( name, [rd1, rd2, rd3]);

      rbm.addEventListener("changeSelected", function(e)
      {
        for( var i=0; i<l1.getChildrenLength(); i++ ) {
          l1.getChildren()[i].setShow(e.getData().getValue());
        }
      });
    }
  }
});
