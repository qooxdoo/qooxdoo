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

      var container = new qx.ui.container.Composite(new qx.ui.layout.Grid(10,10));
      this.getRoot().add(container, {top: 20, left: 20});

      // First block

      var label = new qx.ui.basic.Label();
      label.setValue("Regular");
      var textArea = new qx.ui.form.TextArea();
      textArea.set({
        allowStretchY: false,
        value: this.__getLongValue()
      });
      container.add(label, {row: 0, column: 0});
      container.add(textArea, {row: 1, column: 0});

      label = new qx.ui.basic.Label();
      label.setValue("Auto-Size");
      var textAreaAuto = new qx.ui.form.TextArea();
      textAreaAuto.set({
        allowStretchY: false,
        value: this.__getLongValue(),
        autoSize: true
      });
      container.add(label, {row: 0, column: 1});
      container.add(textAreaAuto, {row: 1, column: 1});

      label = new qx.ui.basic.Label();
      label.setValue("Non-default minimal line height");
      var textAreaSmall = new qx.ui.form.TextArea();
      textAreaSmall.set({
        allowStretchY: false,
        value: "The quick brown fox…",
        autoSize: true,
        minimalLineHeight: 1,
        maxHeight : 300
      });
      container.add(label, {row: 0, column: 2});
      container.add(textAreaSmall, {row: 1, column: 2});

      // Second block

      label = new qx.ui.basic.Label();
      label.setValue("Minimal height");
      var textAreaMin = new qx.ui.form.TextArea();
      textAreaMin.set({
        allowStretchY: false,
        value: this.__getLongValue(),
        autoSize: true,
        minHeight: 200
      });
      container.add(label, {row: 2, column: 0});
      container.add(textAreaMin, {row: 3, column: 0});

      label = new qx.ui.basic.Label();
      label.setValue("Maximal height");
      var textAreaMax = new qx.ui.form.TextArea();
      textAreaMax.set({
        allowStretchY: false,
        value: this.__getLongValue(),
        autoSize: true,
        minHeight: 200,
        maxHeight: 300
      });
      container.add(label, {row: 2, column: 1});
      container.add(textAreaMax, {row: 3, column: 1});

      label = new qx.ui.basic.Label();
      label.setValue("Wrap handling");
      var textAreaWrap = new qx.ui.form.TextArea();
      textAreaWrap.set({
        allowStretchY: false,
        value: this.__getLongValue(),
        autoSize: true,
        minimalLineHeight: 2
      });
      var checkBox = new qx.ui.form.CheckBox("Wrap");
      checkBox.setValue(false);
      checkBox.setAllowStretchX(false);
      checkBox.bind("value", textAreaWrap, "wrap");
      container.add(label, {row: 2, column: 2});
      var subContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));
      container.add(subContainer, {row: 3, column: 2});
      subContainer.add(textAreaWrap, {row: 0, column: 0});
      subContainer.add(checkBox, {row: 1, column: 0});

    },

    __getLongValue: function() {
      var val = new qx.type.Array(2);
      for(var i=0; i < val.length; i++) {
        val[i] = "The quick brown fox jumps over the lazy dog. ";
      }
      return val.join("");
    }
  }
});
