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
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)
     * Andreas Ecker (ecker)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * GeoPosition event used by GeoLocation class.
 *
 *
 */
qx.Class.define("qx.event.type.GeoPosition",
{
  extend : qx.event.type.Event,

  /**
   * Create a new instance.
   */
  construct : function()
  {
    this.base(arguments);
  },


  properties :
  {
    /**
     *  The time when the position was acquired.
     */
    timestamp :
    {
      check : "Number"
    },

    /**
     * The angular distance north or south of the earth's equator, measured in
     * decimal degrees along a meridian
     */
    latitude : {
      check : "Number"
    },


    /**
     * The angular distance on the earth's surface, measured east or west from
     * the prime meridian at Greenwich, England, in decimal degrees
     */
    longitude : {
      check : "Number"
    },


    /**
     * The height of the position, specified in meters above the earth's
     * surface.
     */
    altitude : {
      check : "Number",
      nullable : true
    },


    /**
     * The accuracy level of the latitude and longitude coordinates specified
     * in meters.
     */
    accuracy : {
      check : "Number"
    },

    /**
     * The accuracy level of the altitude specified in meters.
     */
    altitudeAccuracy : {
      check : "Number",
      nullable : true
    },


    /**
     * The direction of travel of the hosting device specified in degrees in a
     * range from 0 to 360, counting clockwise relative to the true north.
     *
     * If the implementation cannot provide heading information, the value of
     * this attribute must be null. If the hosting device is stationary (i.e.
     * the value of the speed attribute is 0), then the value of the heading
     * property must be NaN.
     */
    heading : {
      nullable : true
    },


    /**
     * The current ground speed of the hosting device specified in meters per
     * second.
     *
     * If the implementation cannot provide speed information, the value of
     * this property must be null.
     */
    speed : {
      check : function(data) {return qx.lang.Type.isNumber(data);},
      nullable : true
    }
  },

  members: {
    /**
    * Initialize the fields of the event.
    *
    * @param position {Map} a position map.
    */
    init: function(position) {
      this.setTimestamp(position.timestamp);
      this.setLatitude(position.coords.latitude);
      this.setLongitude(position.coords.longitude);
      this.setAltitude(position.coords.altitude);
      this.setAccuracy(position.coords.accuracy);
      this.setAltitudeAccuracy(position.coords.altitudeAccuracy);
      this.setHeading(position.coords.heading);
      this.setSpeed(position.coords.speed);
    }
  }
});