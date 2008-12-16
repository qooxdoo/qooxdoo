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
 * The Resizer widget acts as a wrapper of another widget. It allows the child
 * widget to be resized by the end user.
 */
qx.Class.define("demobrowser.demo.widget.Resizer",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.getRoot().add(this._getResizer(), {left: 20, top: 20});
      this.getRoot().add(this._getResizerList(), {left: 400, top: 20});
    },


    _getResizerList : function()
    {
      var list = new qx.ui.form.List().set({
        width: 100,
        height: 200,
        minWidth: 50,
        minHeight: 100
      });

      for (var i = 0; i < 100; i++) {
        list.add(new qx.ui.form.ListItem('Option number '+i));
      }

      var resizer = new qx.ui.container.Resizer();
      resizer.setLayout(new qx.ui.layout.Grow());
      resizer.add(list);

      return resizer;
    },


    _getResizer : function()
    {
      var tArea = new qx.ui.form.TextArea;
      tArea.setValue("Resize me\nI'm resizable");

      var resizer = new qx.ui.container.Resizer().set({
        minWidth: 100,
        minHeight: 50,
        width: 200,
        height: 100,
        resizeAllEdges : false
      });

      resizer.setLayout(new qx.ui.layout.Canvas());
      resizer.add(tArea, {top: 0, right: 0, bottom: 0, left: 0});

      return resizer;
    }
  }
});
