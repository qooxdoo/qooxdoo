/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * qooxdoo profiler.
 *
 * All functions of qooxdoo classes (constructors, members, statics) can be profiled
 * using this class.
 *
 * To enable profiling this class must be loaded <b>before</b> <code>qx.Class</code> is
 * loaded. This can be achieved by making <code>qx.core.Aspect</code> and
 * <code>qx.dev.Profile</code> a load time dependency of <code>qx.Class</code>.
 * Further more the variant <code>qx.aspects</code> must be set to <code>on</code>.
 */
qx.Bootstrap.define("qx.dev.Profile",
{
  statics :
  {
    __profileData : {},
    __callStack : [],
    __doProfile : true,
    __callOverhead : undefined,
    __calibrateCount : 4000,


    /**
     * Clear profiling data and start profiling.
     */
    start : function()
    {
      this.__doProfile = true;
      this.__profileData = {};
      this.__callStack = [];
    },


    /**
     * Stop profiling.
     */
    stop : function() {
      this.__doProfile = false;
    },


    /**
     * Return the profiling data as JSON data structure.
     *
     * Example:
     * <pre class="javascript">
     * {
     *   "qx.core.ObjectRegistry.toHashCode (static)":{
     *     *     "totalTime":3,
     *     "ownTime":3,
     *     "callCount":218,
     *     "subRoutineCalls":0,
     *     "name":"qx.core.ObjectRegistry.toHashCode",
     *     "type":"static"
     *   },
     *   "qx.core.Object.addListener (member)":{
     *     "totalTime":19,
     *     "ownTime":12,
     *     "callCount":59,
     *     "subRoutineCalls":251,
     *     "name":"qx.core.Object.addListener",
     *     "type":"member"
     *   },
     *   "qx.ui.table.cellrenderer.Default (constructor)":{
     *     "totalTime":2,
     *     "ownTime":1,
     *     "callCount":1,
     *     "subRoutineCalls":4,
     *     "name":"qx.ui.table.cellrenderer.Default",
     *     "type":"constructor"
     *   }
     * }
     * </pre>
     *
     * @return {Map} The current profiling data.
     */
    getProfileData : function() {
      return this.__profileData;
    },


    /**
     * Show profiling results in a popup window. The results are sorted by the
     * function's own time.
     *
     * @param maxLength {Integer?100} maximum number of entries to display.
     */
    showResults : function(maxLength)
    {
      this.stop();
      this.normalizeProfileData();

      var data = qx.lang.Object.getValues(this.__profileData);
      data = data.sort(function(a,b) {
        return a.calibratedOwnTime<b.calibratedOwnTime ? 1: -1
      });

      data = data.slice(0, maxLength || 100);

      var str = ["<table><tr><th>Name</th><th>Type</th><th>Own time</th><th>Avg time</th><th>calls</th></tr>"];
      for (var i=0; i<data.length; i++)
      {
        var profData = data[i];
        if (profData.name == "qx.core.Aspect.__calibrateHelper") {
          continue;
        }
        str.push("<tr><td>");
        str.push(profData.name, "()");
        str.push("</td><td>");
        str.push(profData.type);
        str.push("</td><td>");
        str.push(profData.calibratedOwnTime.toPrecision(3));
        str.push("ms</td><td>");
        str.push((profData.calibratedOwnTime/profData.callCount).toPrecision(3));
        str.push("ms</td><td>");
        str.push(profData.callCount);
        str.push("</td></tr>");
      }

      str.push("</table>");

      var win = window.open("about:blank", "profileLog");
      var doc = win.document;

      doc.open();
      doc.write("<html><head><style type='text/css'>body{font-family:monospace;font-size:11px;background:white;color:black;}</style></head><body>");
      doc.write(str.join(""));
      doc.write("</body></html>");
      doc.close();
    },


    /**
     * Measure the overhead of calling a wrapped function vs. callling a
     * unwrapped function.
     *
     * @param count {Integer} Number of iterations to measure.
     * @return {Number} Overhead of a wrapped function call in milliseconds.
     */
    __calibrate : function(count)
    {
      // we use eval to unroll the loop because we don't want to measure the loop overhead.

      // Measure wrapped function
      var fcn;
      var code = ["var fcn = function(){ var fcn=qx.dev.Profile.__calibrateHelper;"];
      for (var i=0; i<count; i++) {
        code.push("fcn();");
      }
      code.push("};");
      eval(code.join(""));
      var start = new Date();
      fcn();
      var end = new Date();
      var profTime = end - start;

      // Measure unwrapped function
      var code = [
        "var plainFunc = function() {};",
        "var fcn = function(){ var fcn=plainFunc;"
      ];
      for (var i=0; i<count; i++) {
        code.push("fcn();");
      }
      code.push("};");
      eval(code.join(""));

      var start = new Date();
      fcn();
      var end = new Date();
      var plainTime = end - start;

      // Compute per call overhead
      return ((profTime - plainTime) / count);
    },


    /**
     * Helper to measure overhead.
     */
    __calibrateHelper : function() {},


    /**
     * Normalize profiling data by substracting the overhead of wrapping from the
     * function's own time.
     */
    normalizeProfileData : function()
    {
      if (this.__callOverhead == undefined) {
        this.__callOverhead = this.__calibrate(this.__calibrateCount);
      }

      for (var key in this.__profileData)
      {
        var profileData = this.__profileData[key];

        profileData.calibratedOwnTime = Math.max(profileData.ownTime - (profileData.subRoutineCalls * this.__callOverhead), 0);
        profileData.calibratedAvgTime = profileData.calibratedOwnTime / profileData.callCount;
      }
    },


    /**
     * This function will be called before each function call. (Start timing)
     *
     * @param fullName {String} Full name of the function including the class name.
     * @param fcn {Function} Function to time.
     * @param type {String} Function type as in parameter with same name to
     *                      {@link qx.core.Aspect#addAdvice}
     * @param args {Arguments} The arguments passed to the wrapped function
     */
    profileBefore : function(fullName, fcn, type, args)
    {
      var me = qx.dev.Profile;

      if (!me.__doProfile) {
        return;
      }

      var callData = {
        subRoutineTime : 0,
        subRoutineCalls : 0
      };

      me.__callStack.push(callData);
      callData.startTime = new Date();
    },


    /**
     * This function will be called after each function call. (Stop timing)
     *
     * @param fullName {String} Full name of the function including the class name.
     * @param fcn {Function} Function to time.
     * @param type {String} Function type as in parameter with same name to
     *                      {@link qx.core.Aspect#addAdvice}
     * @param args {Arguments} The arguments passed to the wrapped function
     * @param returnValue {var} return value of the wrapped function.
     */
    profileAfter : function(fullName, fcn, type, args, returnValue)
    {
      var me = qx.dev.Profile;
      if (!me.__doProfile) {
        return;
      }

      var endTime = new Date();
      var callData = me.__callStack.pop();
      var totalTime = endTime - callData.startTime;
      var ownTime = totalTime - callData.subRoutineTime;

      if (me.__callStack.length > 0)
      {
        var lastCall = me.__callStack[me.__callStack.length-1];
        lastCall.subRoutineTime += totalTime;
        lastCall.subRoutineCalls += 1;
      }

      var fcnKey = fullName + " (" + type + ")";

      if (me.__profileData[fcnKey] === undefined)
      {
        me.__profileData[fcnKey] = {
          totalTime: 0,
          ownTime: 0,
          callCount: 0,
          subRoutineCalls: 0,
          name: fullName,
          type : type
        };
      }

      var functionData = me.__profileData[fcnKey];
      functionData.totalTime += totalTime;
      functionData.ownTime += ownTime;
      functionData.callCount += 1;
      functionData.subRoutineCalls += callData.subRoutineCalls;
    }
  },


  defer : function(statics)
  {
    if (qx.core.Variant.isSet("qx.aspects", "on"))
    {
      // Inform user
      qx.log.Logger.debug("Enable global profiling...");

      // Add advices for profiling
      qx.core.Aspect.addAdvice(statics.profileBefore, "before");
      qx.core.Aspect.addAdvice(statics.profileAfter, "after");

      statics.__calibrateHelper = qx.core.Aspect.wrap("qx.dev.Profile.__calibrateHelper", statics.__calibrateHelper, "static");
    }
  }
});
