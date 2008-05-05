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

/* ************************************************************************


************************************************************************ */
var w1;
qx.Class.define("demobrowser.demo.widget.Iframe_1",
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
      // qx.ui.embed.Iframe
      //----------

      w1 = new qx.ui.embed.Iframe();
      var d = this.getRoot();
      w1.addListener("load", function(e) {
        this.debug("Loaded: " + this.getSource());
      });
      // elastic
      w1.setSource("http://www.gmx.de");

      d.add(w1, {
        top : 100,
        right : 20,
        bottom : 20,
        left : 20
      } );


      function changeURL(e) {
        this.setSource(e.getData());
      };

      // make qx.ui.embed.Iframe react to event "surfTo" via function changeURL()
      this.addListener("surfTo", changeURL, w1);

      //-------------
      // radio group
      //-------------

      var rd1 = new qx.ui.form.RadioButton("GMX").set({value: "http://www.gmx.de"});
      var rd2 = new qx.ui.form.RadioButton("web.de").set({value:"http://www.web.de"});
/*
      rd1.set( { left: 20, top: 48, checked: true } );
      rd2.set( { left: 120, top: 48 } );
*/
      rd1.setChecked(true);
      var rbm = new qx.ui.core.RadioManager(rd1, rd2);

      // elements of radio group fire event "surfTo"
      rbm.addListener("changeSelected", function(e)
      {
        this.dispatchEvent( new qx.event.type.DataEvent("surfTo", e.getValue().getValue() ) );
      }, this);
      d.add(rd1, {
        left : 20,
        top : 48
      })
      d.add(rd2, {
        left : 120,
        top : 48
      });
    }
  }
});
