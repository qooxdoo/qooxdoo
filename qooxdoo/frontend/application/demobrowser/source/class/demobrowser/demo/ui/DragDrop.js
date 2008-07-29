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

/* ************************************************************************


************************************************************************ */

qx.Class.define("demobrowser.demo.ui.DragDrop",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var root = this.getRoot();

      var target = new qx.ui.form.List;
      target.setDropable(true);
      root.add(target, { left : 20, top: 20 });

      var source = new qx.ui.form.List;
      source.setDragable(true);
      source.add(new qx.ui.form.ListItem("Item 1"));
      source.add(new qx.ui.form.ListItem("Item 2"));
      source.add(new qx.ui.form.ListItem("Item 3"));
      source.add(new qx.ui.form.ListItem("Item 4"));
      source.add(new qx.ui.form.ListItem("Item 5"));
      root.add(source, { left : 200, top : 20 });


      var data = null;

      source.addListener("dragstart", function(e)
      {
        this.debug("UI Start: " + e.getTarget());
        data = this.getSelection();
      }, source);

      source.addListener("dragend", function(e)
      {
        this.debug("UI End: " + e.getTarget());
      }, source);

      target.addListener("dragover", function(e)
      {
        this.debug("UI Over: " + e.getTarget());
      }, target);

      target.addListener("dragout", function(e)
      {
        this.debug("UI Out: " + e.getTarget());
      }, target);

      target.addListener("dragdrop", function(e)
      {
        this.debug("UI DragDrop: " + e.getData());
      }, target);

    }
  }
});
