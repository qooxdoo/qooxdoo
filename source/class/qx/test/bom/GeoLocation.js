/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

qx.Class.define("qx.test.bom.GeoLocation",
{
  extend : qx.dev.unit.TestCase,
  include: [
    qx.dev.unit.MMock,
    qx.dev.unit.MRequirements
  ],

  members :
  {
    _geo: null,
    _position: null,

    hasGeolocation: function() {
      return qx.core.Environment.get("html.geolocation");
    },

    setUp: function() {
      this._position = {
        timestamp: (new Date()).getTime(),
        coords: {
          latitude: 1,
          longitude: 2,
          altitude: 3,
          accuracy: 4,
          altitudeAccuracy: 5,
          heading: 6,
          speed: 7
        }
      };
      this.require(["geolocation"]);
      this._geo = qx.bom.GeoLocation.getInstance();
    },

    tearDown: function() {
      qx.bom.GeoLocation.$$instance = undefined;
      this._geo.dispose();
      this._geo = null;
      this._position = null;
    },

    testGetCurrentPosition: function() {
      var that = this;

      //test the position event
      var getCurrentPositionStub = this.stub(
        this._geo._geolocation,
        "getCurrentPosition",
        function(succ, err, config) {
          succ(that._position);
      });

      this.assertEventFired(this._geo, "position", function() {
        that._geo.getCurrentPosition(false, 1000, 1000);
        that.assert(getCurrentPositionStub.called);

      }, function(e) {
        that.assertEquals(that._position.timestamp, e.getTimestamp());
        that.assertEquals(that._position.coords.latitude, e.getLatitude());
        that.assertEquals(that._position.coords.longitude, e.getLongitude());
        that.assertEquals(that._position.coords.altitude, e.getAltitude());
        that.assertEquals(that._position.coords.accuracy, e.getAccuracy());
        that.assertEquals(that._position.coords.altitudeAccuracy, e.getAltitudeAccuracy());
        that.assertEquals(that._position.coords.heading, e.getHeading());
        that.assertEquals(that._position.coords.speed, e.getSpeed());
      });

      getCurrentPositionStub.restore();

      //test the error event
      var getCurrentPositionStub = this.stub(
        this._geo._geolocation,
        "getCurrentPosition",
        function(succ, err, config) {
          err({code: 1, message: "Error"});
      });

      this.assertEventFired(this._geo, "error", function() {
        that._geo.getCurrentPosition(false, 1000, 1000);
        that.assert(getCurrentPositionStub.called);

      }, function(e) {
        that.assertEquals(1, e.getData().code);
        that.assertEquals("Error", e.getData().message);
      });

      getCurrentPositionStub.restore();

    },

    testWatchPosition: function() {
      var that = this;
      var watchStub = this.stub(
        this._geo._geolocation,
        "watchPosition",
        function(succ, err, config) {
          succ(that._position);
          return 200;
      });
      var clearWatchStub = this.stub(this._geo._geolocation, "clearWatch");

      this.assertEventFired(this._geo, "position", function() {
        that._geo.startWatchPosition(false, 1000, 1000);
        that.assert(watchStub.called);
        that.assertEquals(200, that._geo._watchId);

      }, function(e) {
        that.assertEquals(that._position.timestamp, e.getTimestamp());
        that.assertEquals(that._position.coords.latitude, e.getLatitude());
        that.assertEquals(that._position.coords.longitude, e.getLongitude());
        that.assertEquals(that._position.coords.altitude, e.getAltitude());
        that.assertEquals(that._position.coords.accuracy, e.getAccuracy());
        that.assertEquals(that._position.coords.altitudeAccuracy, e.getAltitudeAccuracy());
        that.assertEquals(that._position.coords.heading, e.getHeading());
        that.assertEquals(that._position.coords.speed, e.getSpeed());
      });


      this._geo.stopWatchPosition();
      this.assert(clearWatchStub.called);
      that.assertNull(that._geo._watchId);

      watchStub.restore();
      clearWatchStub.restore();
    }
  }
});
