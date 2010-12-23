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
        value: this.__getQxValue()
      });
      container.add(label, {row: 0, column: 0});
      container.add(textArea, {row: 1, column: 0});

      var label = new qx.ui.basic.Label();
      label.setValue("Auto-Size");
      var textAreaAuto = new qx.ui.form.TextArea();
      textAreaAuto.set({
        allowStretchY: false,
        value: this.__getQxValue(),
        autoSize: true
      });
      container.add(label, {row: 0, column: 1});
      container.add(textAreaAuto, {row: 1, column: 1});

      var label = new qx.ui.basic.Label();
      label.setValue("Wrap handling");
      var textAreaWrap = new qx.ui.form.TextArea();
      textAreaWrap.set({
        allowStretchY: false,
        value: this.__getQxValue(),
        autoSize: true,
        wrap: false
      });
      var button = new qx.ui.form.ToggleButton("Wrap");
      button.setAllowStretchX(false);
      button.addListener("changeValue", function() {
        textAreaWrap.toggleWrap();
      });
      container.add(label, {row: 0, column: 2});
      var subContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));
      container.add(subContainer, {row: 1, column: 2});
      subContainer.add(textAreaWrap, {row: 0, column: 0});
      subContainer.add(button, {row: 1, column: 0});

      // Second block

      var label = new qx.ui.basic.Label();
      label.setValue("Minimal height");
      var textAreaMin = new qx.ui.form.TextArea();
      textAreaMin.set({
        allowStretchY: false,
        autoSize: true,
        minHeight: 200
      });
      container.add(label, {row: 2, column: 0});
      container.add(textAreaMin, {row: 3, column: 0});

      var label = new qx.ui.basic.Label();
      label.setValue("Maximal height");
      var textAreaMax = new qx.ui.form.TextArea();
      textAreaMax.set({
        allowStretchY: false,
        autoSize: true,
        minHeight: 200,
        maxHeight: 300
      });
      container.add(label, {row: 2, column: 1});
      container.add(textAreaMax, {row: 3, column: 1});

      var label = new qx.ui.basic.Label();
      label.setValue("Non-default minimal line height");
      var textAreaSmall = new qx.ui.form.TextArea();
      textAreaSmall.set({
        allowStretchY: false,
        autoSize: true,
        minimalLineHeight: 1,
        maxHeight : 300
      });
      container.add(label, {row: 2, column: 2});
      container.add(textAreaSmall, {row: 3, column: 2});

    },

    __getQxValue: function() {
      return "qooxdoo is a comprehensive and innovative framework for creating " +
             "rich internet applications (RIAs). Leveraging object-oriented " +
             "JavaScript allows developers to build impressive cross-browser " +
             "applications. No HTML, CSS nor DOM knowledge is needed.";
    }
  }
});
