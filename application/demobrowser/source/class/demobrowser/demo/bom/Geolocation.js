/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Geolocation",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var label1 = qx.bom.Label.create("Finding Your Location...", true);
      label1.style.width = "400px";
      label1.style.height = "100px";
      document.body.appendChild(label1);

      if(!qx.core.Environment.get("html.geolocation")){
        qx.bom.Label.setValue(label1, "Geolocation Not Supported");
        return;
      }

      var geo = qx.bom.GeoLocation.getInstance();

      geo.addListener("position", function(position) {
        //todo: maybe add a map here
        qx.bom.Label.setValue(label1,
        "<p>Latitude: " + position.getLatitude() + "</p>" +
        "<p>Longitude: " + position.getLongitude() + "</p>");
      }, this);

      geo.addListener("error", function(error) {
        var errors = ["Permission Denied", "Position Unavailable", "Timeout"];
        var positionError = error.getData();
        console.log(positionError);
        qx.bom.Label.setValue(label1, "Failed: " + errors[positionError.code-1]);
      }, this);

        geo.getCurrentPosition();
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
  }
});
