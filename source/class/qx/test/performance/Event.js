/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.performance.Event",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMeasure,

  events : {
    "plain" : "qx.event.type.Event",
    "data" : "qx.event.type.Data"
  },

  members :
  {
    FIRE_ITERATIONS : 10000,
    ADD_ITERATIONS : 5000,


    testFireEvent : function() {
      var that = this;
      this.measureRepeated(
        "fire plain events", function() {
          that.fireEvent("plain");
        },
        function() {}, this.FIRE_ITERATIONS
      );
    },


    testFireDataEvent : function() {
      var that = this;
      this.measureRepeated(
        "fire data events", function() {
          that.fireDataEvent("data", true, false);
        },
        function() {}, this.FIRE_ITERATIONS
      );
    },


    testFireDataEventCancelable : function() {
      var that = this;
      this.measureRepeated(
        "fire cancelable data events", function() {
          that.fireDataEvent("data", true, false, true);
        },
        function() {}, this.FIRE_ITERATIONS
      );
    },


    testAddListener : function() {
      var that = this;
      var handler = [];
      for (var i = 0; i < this.ADD_ITERATIONS; i++) {
        handler.push(function() {});
      }
      this.measureRepeated(
        "addListener", function(i) {
          that.addListener("plain", handler[i]);
        },
        function() {
          for (var i = 0; i < handler.length; i++) {
            that.removeListener("plain", handler[i]);
          }
        }, this.ADD_ITERATIONS
      );
    },


    testRemoveListener : function()
    {
      var handler = [];
      for (var i = 0; i < this.ADD_ITERATIONS; i++) {
        handler.push(function() {});
        this.addListener("plain", handler[i]);
      }
      var that = this;
      this.measureRepeated(
        "remove listeners", function(i) {
          that.removeListener("plain", handler[i]);
        },
        function() {}, this.ADD_ITERATIONS
      );
    },


    testRemoveListenerById : function() {
      var listeners = [];
      for (var i = 0; i < this.ADD_ITERATIONS; i++) {
        listeners.push(this.addListener("plain", function() {}));
      }
      var that = this;
      this.measureRepeated(
        "remove listeners by id", function(i) {
          that.removeListenerById(listeners[i]);
        },
        function() {}, this.ADD_ITERATIONS
      );
    },


    testExecutePlainListener : function() {
      var listeners = [];
      for (var i = 0; i < this.FIRE_ITERATIONS; i++) {
        listeners.push(this.addListener("plain", function() {}));
      }
      var that = this;
      this.measureRepeated(
        "execute plain listeners", function() {
          that.fireEvent("plain");
        },
        function() {
          for (var i = 0; i < listeners.length; i++) {
            that.removeListenerById(listeners[i]);
          }
        }, 1, this.FIRE_ITERATIONS
      );
    },


    testExecuteDataListener : function() {
      var listeners = [];
      for (var i = 0; i < this.FIRE_ITERATIONS; i++) {
        listeners.push(this.addListener("data", function() {}));
      }
      var that = this;
      this.measureRepeated(
        "execute data listeners", function() {
          that.fireDataEvent("data", true, false);
        },
        function() {
          for (var i = 0; i < listeners.length; i++) {
            that.removeListenerById(listeners[i]);
          }
        }, 1, this.FIRE_ITERATIONS
      );
    }
  }
});
