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

qx.Class.define("demobrowser.demo.widget.Iframe",
{
  extend : qx.application.Standalone,


  events :
  {
    "surfTo" : "qx.event.type.DataEvent"
  },

  members :
  {
    main : function()
    {
      this.base(arguments);



      //----------
      // frame
      //----------

      var frame = new qx.ui.embed.ThemedIframe();
      var d = this.getRoot();
      frame.addListener("load", function(e) {
        this.debug("Loaded: " + this.getSource());
      });

      // elastic
      frame.setSource("http://www.w3.org/");

      d.add(frame, {
        top : 100,
        right : 20,
        bottom : 20,
        left : 20
      });




      //-------------
      // radio group
      //-------------

      var rd1 = new qx.ui.form.RadioButton("W3C");
      rd1.setUserData("url", "http://www.w3.org/");
      var rd2 = new qx.ui.form.RadioButton("local");
      rd2.setUserData("url", "../welcome.html");

      rd1.setValue(true);

      var rbm = new qx.ui.form.RadioGroup(rd1, rd2);
      rbm.addListener("changeSelection", function(e) {
        this.setSource(e.getData()[0].getUserData("url"));
      }, frame);

      d.add(rd1, {
        left : 20,
        top : 48
      });

      d.add(rd2, {
        left : 120,
        top : 48
      });
    }
  }
});
