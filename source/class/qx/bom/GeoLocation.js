/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)
     * Andreas Ecker (ecker)

************************************************************************ */


/**
 *
 * GeoLocation provides access to geographical location information
 * associated with the hosting device.
 *
 * For more information see:
 * http://www.w3.org/TR/geolocation-API/
 * 
 * This class does not need to be disposed, but you would obviously call 
 * stopWatchPosition() to top watching and free up resources consumed
 * by startWatchPosition().  The destructor will do this for you, if
 * you call dispose()
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
     * @param enableHighAccuracy {Boolean} provide the best possible results
     * @param timeout {Integer} maximum time in ms that is allowed to pass from
     * the call to getCurrentPosition() or watchPosition() until the corresponding
     * callback is invoked.
     * @param maximumAge {Integer} cache the position for a specified time.
     */
    getCurrentPosition: function(enableHighAccuracy, timeout, maximumAge)
    {
      var successHandler = qx.lang.Function.bind(this._successHandler, this);
      var errorHandler;

      if (qx.core.Environment.get("os.name") === "android" &&
          qx.core.Environment.get("browser.name").indexOf("chrome") !== -1)
      {
        errorHandler = function() {
          var boundDefaultHandler = this._errorHandler.bind(this);
          this._geolocation.getCurrentPosition(successHandler, boundDefaultHandler, {
            enableHighAccuracy: enableHighAccuracy,
            timeout: timeout,
            maximumAge: maximumAge
          });
        }.bind(this);
      } else {
        errorHandler = qx.lang.Function.bind(this._errorHandler, this);
      }

      this._geolocation.getCurrentPosition(successHandler, errorHandler, {
        enableHighAccuracy: enableHighAccuracy,
        timeout: timeout,
        maximumAge: maximumAge
      });
    },


    /**
     * Starts to watch the position. Calls the "position" event, when the position changed.
     *
     * @param enableHighAccuracy {Boolean} provide the best possible results
     * @param timeout {Integer} maximum time in ms that is allowed to pass from
     * the call to getCurrentPosition() or watchPosition() until the corresponding
     * callback is invoked.
     * @param maximumAge {Integer} cache the position for a specified time.
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
     * @param position {Object} position event
     */
    _successHandler: function(position) {
      this.fireEvent("position", qx.event.type.GeoPosition, [position]);
    },


    /**
     * The Error handler.
     *
     * @param error {Object} error event
     */
    _errorHandler: function(error) {
      this.fireDataEvent("error", error);
    }
  },


  destruct: function() {
    this.stopWatchPosition();
  }
});
