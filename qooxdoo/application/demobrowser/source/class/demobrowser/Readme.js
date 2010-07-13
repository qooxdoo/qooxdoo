/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

/**
 * Displays a title (label) and text (in a groupbox).
 */

qx.Class.define("demobrowser.Readme", {

  extend : qx.ui.container.Scroll,

  construct : function(title, readmeText)
  {
    this.base(arguments);
    this.__container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    this.__container.set({
      padding: 10,
      decorator: "main"
    });
    this.add(this.__container);

    var title = title || "";
    this.setTitle(title);
    var readme = readmeText || "";
    this.setReadmeData(readme);

  },

  properties :
  {
    title :
    {
      apply : "_applyTitle"
    },

    readmeData :
    {
      apply : "_applyReadmeData"
    }
  },

  members :
  {
    __container : null,
    __title : null,
    __readme : null,

    _applyTitle : function(value, old)
    {
      if (value === old) {
        return;
      }

      if (this.__title) {
        this.__title.setValue("<h1>" + value + "</h1>");
        return
      }

      var titleLabel = this.__title = new qx.ui.basic.Label("<h1>" + value + "</h1>");
      titleLabel.setRich(true);
      this.__container.add(titleLabel);
    },

    _applyReadmeData : function(value, old)
    {
      if (value === old) {
        return;
      }

      if (this.__readme) {
        this.__readme.destroy();
      }

      var groupBox = this.__readme = new qx.ui.groupbox.GroupBox("Readme");
      groupBox.setLayout(new qx.ui.layout.VBox(5));

      var readmeText = value.replace(/\\n/g, "<br/>");
      var readmeLabel = new qx.ui.basic.Label(readmeText);
      readmeLabel.setRich(true);
      groupBox.add(readmeLabel);
      this.__container.add(groupBox);
    }

  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__title", "__readme", "__container");
  }

});