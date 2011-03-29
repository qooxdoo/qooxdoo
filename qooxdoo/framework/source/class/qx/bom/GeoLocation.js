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
    "position": "qx.event.type.Data",

    /** Fired when an error occurs */
    "error": "qx.event.type.Data"
  },


  members:
  {
    _watchId: null,
    _geolocation: null,


    /**
     * Retrieves the current postion and calls the "positon" event.
     *
     * @param enableHighAccuracy {Function} provide the best possible results
     * @param timeout {Function} maximum time in ms that is allowed to pass from
     * the call to getCurrentPosition() or watchPosition() until the corresponding
     * callback is invoked.
     * @param maximumAge {Function} cache the position for a specified time.
     */
    getCurrentPosition: function(enableHighAccuracy, timeout, maximumAge)
    {
      var successHandler = qx.lang.Function.bind(this._successHandler, this);
      var errorHandler = qx.lang.Function.bind(this._errorHandler, this);
      var wrappedHandler = qx.bom.GeoLocation._createHandler(successHandler);

      this._geolocation.getCurrentPosition(wrappedHandler, errorHandler, {
        enableHighAccuracy: enableHighAccuracy,
        timeout: timeout,
        maximumAge: maximumAge
      });
    },


    /**
     * Starts to watch the postion. Calls the "positon" event, when the position changed.
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

      var successHandler = qx.lang.Function.bind(this._successHandler, this);
      var errorHandler = qx.lang.Function.bind(this._errorHandler, this);
      var wrappedHandler = this._createHandler(successHandler);

      this._watchId = this._geolocation.watchPosition(wrappedHandler, errorHandler, {
        enableHighAccuracy: enableHighAccuracy,
        timeout: timeout,
        maximumAge: maximumAge
      });
    },


    /**
     * Stops watching the position.
     */
    stopWatchPosition: function() {
      this._geolocation.clearWatch(this._watchId);
    },


    /**
     * Success handler.
     *
     * @param position {Function} position event
     */
    _successHandler: function(position) {
      this.fireDataEvent("position", position);
    },


    /**
     * The Error handler.
     *
     * @param error {Function} error event
     */
    _errorHandler: function(error) {
      this.fireDataEvent("error", error);
    },


    /**
     * Create a handler
     *
     * @param cb {Function} callback
     * @return {Function} handler
     */
    _createHandler : function(cb)
    {
      return function(position) {
        var position = new qx.event.type.GeoPosition(position);
        cb.call(null, position);
      };
    }
  },


  destruct: function()
  {
    this.stopWatchPosition();
  }
});
