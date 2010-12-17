/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.AutoSizeTextArea",
{
  extend : qx.application.Standalone,


  construct : function()
  {
    this.base(arguments);
  },

  members :
  {
    main : function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(20,20));
      this.getRoot().add(container, {top: 20, left: 20});

      // First block

      var label = new qx.ui.basic.Label();
      label.setValue("Regular");
      var textArea = new qx.ui.form.TextArea();
      textArea.set({
        allowStretchY: false
      });
      container.add(label, {row: 0, column: 0});
      container.add(textArea, {row: 1, column: 0});

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size");
      var textAreaAuto = new qx.ui.form.TextArea();
      textAreaAuto.set({
        allowStretchY: false,
        autoSize: true
      });
      container.add(label, {row: 0, column: 1});
      container.add(textAreaAuto, {row: 1, column: 1});

      // Second block

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size (minimal height)");
      var textAreaMin = new qx.ui.form.TextArea();
      textAreaMin.set({
        allowStretchY: false,
        autoSize: true,
        minHeight: 200
      });
      container.add(label, {row: 2, column: 0});
      container.add(textAreaMin, {row: 3, column: 0});

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size (maximal height)");
      var textAreaMax = new qx.ui.form.TextArea();
      textAreaMax.set({
        allowStretchY: false,
        autoSize: true,
        minHeight: 100,
        maxHeight: 200
      });
      container.add(label, {row: 2, column: 1});
      container.add(textAreaMax, {row: 3, column: 1});
    }
  }
});
