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

qx.Class.define("demobrowser.demo.widget.Scrollbar_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("text");
      doc.setBackgroundColor("background");

      var vbar = new qx.ui.core.ScrollBar("vertical").set({
        height: 200,
        width: 20,
        maximum: 1000,
        value: 100
      })
      doc.add(vbar, 230, 10);

      vbar.addListener("scroll", function(e) {
        //this.debug("value: " + vbar.getValue());
      }, this);

      var hbar = new qx.ui.core.ScrollBar("horizontal");
      hbar.setWidth(200);
      doc.add(hbar, 10, 230);


      slider = new qx.ui.slider.Slider("vertical");
      doc.add(slider, 300, 10);

      var label = new qx.ui.basic.Label("Value:");
      doc.add(label, 330, 10);

      slider.addListener("changeValue", function() {
        label.setContent("Value: " + slider.getValue());
      });
    }
  }
});
