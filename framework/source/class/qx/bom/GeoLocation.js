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
 * GeoLocation provides access to geographical location information
 * associated with the hosting device.
 *
 * For more information see:
 * http://www.w3.org/TR/geolocation-API
 *
 */
qx.Class.define("qx.bom.GeoLocation",
{
  extend : qx.core.Object,
  type : "singleton",


  construct: function() {
    this._geolocation = navigator.geolocation;
  },


  events:
  {
    /** Fired when the position is updated */
    "position": "qx.event.type.GeoPosition",

    /** Fired when an error occurs */
    "error": "qx.event.type.Data"
  },


  members:
  {
    _watchId: null,
    _geolocation: null,

    /**
     * Retrieves the current position and calls the "position" event.
     *
     * @param enableHighAccuracy {Function} provide the best possible results
     * @param timeout {Function} maximum time in ms that is allowed to pass from
     * the call to getCurrentPosition() or watchPosition() until the corresponding
     * callback is invoked.
     * @param maximumAge {Function} cache the position for a specified time.
     */
    getCurrentPosition: function(enableHighAccuracy, timeout, maximumAge)
    {
      var errorHandler = qx.lang.Function.bind(this._errorHandler, this);
      var successHandler = qx.lang.Function.bind(this._successHandler, this);
      this._geolocation.getCurrentPosition(successHandler, errorHandler, {
        enableHighAccuracy: enableHighAccuracy,
        timeout: timeout,
        maximumAge: maximumAge
      });
    },


    /**
     * Starts to watch the position. Calls the "position" event, when the position changed.
     *
     * @param enableHighAccuracy {Function} provide the best possible results
     * @param timeout {Function} maximum time in ms that is allowed to pass from
     * the call to getCurrentPosition() or watchPosition() until the corresponding
     * callback is invoked.
     * @param maximumAge {Function} cache the position for a specified time.
     */
    startWatchPosition: function(enableHighAccuracy, timeout, maximumAge)
    {
      this.stopWatchPosition();

      var errorHandler = qx.lang.Function.bind(this._errorHandler, this);
      var successHandler = qx.lang.Function.bind(this._successHandler, this);

      this._watchId = this._geolocation.watchPosition(successHandler, errorHandler, {
        enableHighAccuracy: enableHighAccuracy,
        timeout: timeout,
        maximumAge: maximumAge
      });
    },


    /**
     * Stops watching the position.
     */
    stopWatchPosition: function() {
      if (this._watchId != null) {
        this._geolocation.clearWatch(this._watchId);
        this._watchId = null;
      }
    },


    /**
     * Success handler.
     *
     * @param position {Function} position event
     */
    _successHandler: function(position) {
      this.fireEvent("position", qx.event.type.GeoPosition, [position]);
    },


    /**
     * The Error handler.
     *
     * @param error {Function} error event
     */
    _errorHandler: function(error) {
      this.fireDataEvent("error", error);
    }
  },


  destruct: function() {
    this.stopWatchPosition();
  }
});
