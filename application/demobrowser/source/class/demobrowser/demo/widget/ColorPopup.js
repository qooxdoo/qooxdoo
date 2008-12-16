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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/32/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-up.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-down.png)

#asset(qx/icon/${qx.icontheme}/32/apps/internet-feed-reader.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.ColorPopup",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var doc = this.getRoot();

      var mypop = new qx.ui.control.ColorPopup();
      mypop.exclude();
      mypop.setValue("#23F3C1");

      var mybtn = new qx.ui.form.Button("Open Popup");
      mybtn.addListener("mousedown", function(e)
      {
        mypop.placeToMouse(e)
        mypop.show();
      });

      var myview = new qx.ui.basic.Label("Selected Color").set({
        marginLeft: 10,
        padding : [3, 6],
        decorator : "main"
      });

      doc.add(myview, {
        left : 100,
        top : 20
      })

      doc.add(mybtn, {
        left : 20,
        top : 20
      });
      doc.add(mypop, {
        left : 100,
        top : 100
      });

      mypop.addListener("changeValue", function(e) {
        this.debug("Value Listener: " + e.getData());
        myview.setBackgroundColor(e.getData());
      });

      mypop.addListener("changeRed", function(e) {
        this.debug("Red Listener: " + e.getData());
      });

      mypop.addListener("changeGreen", function(e) {
        this.debug("Green Listener: " + e.getData());
      });

      mypop.addListener("changeBlue", function(e) {
        this.debug("Blue Listener: " + e.getData());
      });

    }
  }
});
