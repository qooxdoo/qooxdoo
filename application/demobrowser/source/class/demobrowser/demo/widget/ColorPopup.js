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
      
      var mybtn = new qx.ui.form.Button("Open Popup");
      //mybtn.setLocation(20, 20);
      mybtn.addListener("execute", function() {
        mypop.setTop(qx.html.Location.getPageBoxBottom(this.getElement()));
        mypop.setLeft(qx.html.Location.getPageBoxLeft(this.getElement()));
        mypop.show();
      });

      var myview = new qx.ui.basic.Label("Selected Color");
      myview.setDecorator("inset");
      /*
      myview.setPadding(3, 6);
      myview.setBackgroundImage("static/image/dotted_white.gif");
      */
      doc.add(myview, {
        left : 100,
        top : 20
      })

      var mytables =
      {
        core : {
          label : "Basic Colors",
          values : [ "#000", "#333", "#666", "#999", "#CCC", "#FFF", "red", "green", "blue", "yellow", "teal", "maroon" ]
        },

        template : {
          label : "Template Colors",
          values : [ "#B07B30", "#B07BC9", "#E3AEC9", "#7A2A53" ]
        },

        recent : {
          label : "Recent Colors",

          // In this case we need named colors or rgb-value-strings, hex is not allowed currently
          values : [ "rgb(122,195,134)", "orange" ]
        }
      }

      var mypop = new qx.ui.control.ColorPopup(mytables);
      mypop.setValue("#23F3C1");

      doc.add(mybtn, {
        left : 20,
        top : 20
      });
      doc.add(mypop, {
        left : 100,
        top : 100
      });

      mypop.addEventListener("changeValue", function(e) {
        this.debug("Value Listener: " + e.getData());
        myview.setBackgroundColor(e.getData());
        myview.setBackgroundImage(e.getData() ? null : "static/image/dotted_white.gif");
      });

      mypop.addEventListener("changeRed", function(e) {
        this.debug("Red Listener: " + e.getData());
      });

      mypop.addEventListener("changeGreen", function(e) {
        this.debug("Green Listener: " + e.getData());
      });

      mypop.addEventListener("changeBlue", function(e) {
        this.debug("Blue Listener: " + e.getData());
      });

    }
  }
});
