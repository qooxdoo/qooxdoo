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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.test.SelectBox_EdgeCases",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scroller = new qx.ui.container.Scroll();
      this.container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      this.container.setAllowStretchX(false);
      this.container.setAllowGrowX(false);
      scroller.add(this.container);
      this.getRoot().add(scroller, {edge : 0});

      this.addBox1();
      this.addBox2();
      this.addBox3();
    },


    addBox1 : function()
    {
      this.container.add(new qx.ui.basic.Label("Long list"), {left: 25, top: 20});

      var selectBox3 = new qx.ui.form.SelectBox();
      selectBox3.setMaxListHeight(null);
      for (var i = 0; i < 300; i++) {
        var tempItem = new qx.ui.form.ListItem("" + i);
        selectBox3.add(tempItem);
      }
      this.container.add(selectBox3, {left: 20, top: 40});
    },

    addBox2 : function()
    {
      this.container.add(new qx.ui.basic.Label("Fonts"), {left: 25, bottom: 45});

      var selectBox4 = new qx.ui.form.SelectBox();
      var font1 = new qx.bom.Font(12, ["Tahoma"]);
      var font2 = new qx.bom.Font(15, ["Arial"]);
      var font3 = new qx.bom.Font(18, ["Courier New"]);
      var font4 = new qx.bom.Font(21, ["Times New Roman"]);
      var fonts = [font1, font2, font3, font4];
      for (var i = 0; i < fonts.length; i++) {
        var tempItem = new qx.ui.form.ListItem("Font " + (i + 1));
        tempItem.setFont(fonts[i]);
        selectBox4.add(tempItem);
      }
      this.container.add(selectBox4, {left: 20, bottom: 20});
    },

    addBox3 : function()
    {
      this.container.add(new qx.ui.basic.Label("Long button, short text"), {left: 205, top: 20});

      var selectBox5 = new qx.ui.form.SelectBox();
      selectBox5.setWidth(300);
      selectBox5.setMaxListHeight(100);
      for (var i = 0; i < 20; i++) {
        var tempItem = new qx.ui.form.ListItem("Item " + i);
        // enable every fifth element
        if (i % 5 == 1) {
          tempItem.setEnabled(false);
        }
        selectBox5.add(tempItem);
      }
      this.container.add(selectBox5, {left: 200, top: 40});
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("container");
  }
});
