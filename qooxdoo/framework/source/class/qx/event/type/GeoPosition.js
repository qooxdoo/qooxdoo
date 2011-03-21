/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)

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
  extend : qx.core.Object,
  
  /**
   * Create a new instance.
   *
   * @param position {Map} a position map.
   */
  construct : function(position)
  {
    this.base(arguments);
    this.setTimestamp(position.timestamp);
    this.setLatitude(position.coords.latitude);
    this.setLongitude(position.coords.longitude);
    this.setAltitude(position.coords.altitude);
    this.setAccuracy(position.coords.accuracy);
    this.setAltitudeAccuracy(position.coords.altitudeAccuracy);
    this.setHeading(position.coords.heading);
    this.setSpeed(position.coords.speed);
  },


  properties :
  {
    /**
     *  Attribute represents the time when the Position object was acquired.
     */
    timestamp :
    {
      check : "Integer"
    },
    
    /**
     *  Attributes is the geographic coordinates specified in decimal degrees
     */
    latitude : {
      check : "Number"
    },


    /**
     *  Attributes is the geographic coordinates specified in decimal degrees
     */
    longitude : {
      check : "Number"
    },


    /**
     * Attribute denotes the height of the position, specified in meters above the ellipsoid.
     */
    altitude : {
      check : "Number",
      nullable : true
    },


    /**
     * Attribute denotes the accuracy level of the latitude and longitude coordinates.
     */
    accuracy : {
      check : "Number"
    },

    /**
     * Attribute is specified in meters.
     */
    altitudeAccuracy : {
      check : "Number",
      nullable : true
    },


    /**
     * Attribute denotes the direction of travel of the hosting device and is 
     * specified in degrees, where 0° ≤ heading < 360°, counting clockwis
     * relative to the true north. 
     */
    heading : {
      nullable : true
    },


    /**
     * Attribute denotes the current ground speed of the hosting device and is 
     * specified in meters per second.
     */
    speed : {
      nullable : true
    }
  }
});
