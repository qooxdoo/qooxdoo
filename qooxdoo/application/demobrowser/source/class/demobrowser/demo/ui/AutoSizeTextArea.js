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

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      this.getRoot().add(container, {top: 20, left: 20});

      var textArea = new qx.ui.form.TextArea();
      textArea.set({
        placeholder: "Regular Text-Area",
        allowStretchY: false
      });
      container.add(textArea);

      var textAreaAuto = new qx.ui.form.TextArea();
      textAreaAuto.set({
        placeholder: "Auto-Size Text-Area",
        allowStretchY: false,
        autoSize: true,
        autoSizeMaxHeight: 300
      });
      container.add(textAreaAuto);
    }
  }
});
