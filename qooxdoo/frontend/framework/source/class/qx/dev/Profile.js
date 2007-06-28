/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.core.Aspect)
#ignore(auto-require)

************************************************************************ */

/**
 * qooxdoo profiler.
 *
 * All functions of qooxdoo classes (constructors, members, statics) can be profiled
 * using this class.
 *
 * To enable profiling this class must be loaded <b>before</b> <code>qx.Class</code> is
 * loaded. This can be achieved by adding the parameter
 * <code>--add-require qx.Class:qx.dev.Profile</code> to the generator call building the
 * applications. Further more the variant <code>qx.aspect</code> must be set to
 * <code>on</code>.
 */
qx.Class.define("qx.dev.Profile", {

  statics :
  {

    __profileData : {},
    __callStack : [],
    __doProfile : true,
    __callOverhead : undefined,


    /**
     * Clear profiling data and enable profiling.
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
    end : function()
    {
      this.__doProfile = true;
    },


    /**
     * Show profiling results in a popup window. The results are sorted by the function's
     * own time.
     *
     * @param maxLength {Integer} maximum number of entries to display.
     */
    openProfileWindow : function(maxLength)
    {
      this.normalizeProfileData();
      this.end();
      var data = qx.lang.Object.getValues(this.__profileData);
      data = data.sort(function(a,b) { return a.calibratedOwnTime<b.calibratedOwnTime ? 1: -1});
      data = data.slice(0,maxLength || 20);

      var str = ["<table><tr><th>Name</th><th>Own time</th><th>calls</th></tr>"];
      for (var i=0; i<data.length; i++) {
        var profData = data[i];
        if (profData.name == "qx.core.Aspect.__calibrateHelper") {
          continue;
        }
        str.push("<tr><td>")
        str.push(profData.name);
        str.push("</td><td>");
        str.push(profData.calibratedOwnTime.toPrecision(3));
        str.push("ms</td><td>");
        str.push(profData.callCount);
        str.push("</td></tr>");
      }
      str.push("</table>");

      var win = new qx.client.NativeWindow("about:blank", "profileLog");
      win.open();
      var doc = win._window.document;
      doc.open();
      doc.write("<html><body>");
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
    __calibrate : function(count) {
      var code = ["function(){ var fcn=qx.dev.Profile.__calibrateHelper;"];
      for (var i=0; i<count; i++) {
        code.push("fcn();");
      }
      code.push("};");
      fcn = eval(code.join(""));
      var start = new Date();
      fcn();
      var end = new Date();
      var profTime = end - start;

      var plainFunc = function() {};
      var code = ["function(){ var fcn=plainFunc;"];
      for (var i=0; i<count; i++) {
        code.push("fcn();");
      }
      code.push("};");
      fcn = eval(code.join(""));

      var start = new Date();
      fcn();
      var end = new Date();
      var plainTime = end - start;

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
        this.__callOverhead = this.__calibrate(4000);
      }
      for (var key in this.__profileData) {
        var profileData = this.__profileData[key];
        profileData.calibratedOwnTime = Math.max(profileData.ownTime - (profileData.subRoutineCalls * this.__callOverhead), 0);
        profileData.calibratedAvgTime = profileData.calibratedOwnTime / profileData.callCount;
      }
    },


    /**
     * This function will be called before each function call. (Start timing)
     *
     * @param fullname {String} Full name of the function including the class name.
     * @param fcn {Function} Function to time.
     * @param args {Arguments} The arguments passed to the wrapped function
     */
    profilePre : function(fullName, fcn, args) {
      var me = qx.dev.Profile;
      if (!me.__doProfile) {
        return;
      }
      var callData = {
        subRoutineTime : 0,
        subRoutineCalls : 0,
        name : fullName
      };
      me.__callStack.push(callData);
      callData.startTime = new Date();
    },


    /**
     * This function will be called after each function call. (End timing)
     *
     * @param fullname {String} Full name of the function including the class name.
     * @param fcn {Function} Function to time.
     * @param args {Arguments} The arguments passed to the wrapped function
     * @param returnValue {var} return value of the wrapped function.
     */
    profilePost : function(fullName, fcn, args, returnValue) {
      var me = qx.dev.Profile;
      if (!me.__doProfile) {
        return;
      }
      var endTime = new Date();
      var callData = me.__callStack.pop();
      var totalTime = endTime - callData.startTime;
      var ownTime = totalTime - callData.subRoutineTime;

      if (me.__callStack.length > 0) {
        var lastCall = me.__callStack[me.__callStack.length-1];
        lastCall.subRoutineTime += totalTime;
        lastCall.subRoutineCalls += 1;
      }

      if(me.__profileData[fullName] === undefined) {
        me.__profileData[fullName] = {
          totalTime: 0,
          ownTime: 0,
          callCount: 0,
          subRoutineCalls: 0,
          name: fullName
        }
      }
      var functionData = me.__profileData[fullName];
      functionData.totalTime += totalTime;
      functionData.ownTime += ownTime;
      functionData.callCount += 1;
      functionData.subRoutineCalls += callData.subRoutineCalls;
    }

  },


  defer : function(statics)
  {
    qx.core.Aspect.register("pre", "*", "", statics.profilePre);
    qx.core.Aspect.register("post", "*", "", statics.profilePost);
    statics.__calibrateHelper = qx.core.Aspect.wrap("qx.core.Aspect.__calibrateHelper", "static", statics.__calibrateHelper);
  }

});