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
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#require(qx.core.Aspect)
#ignore(auto-require)

************************************************************************ */

qx.Class.define("demobrowser.CallTrace", {

  statics :
  {

    /**
     * This function will be called before each function call.
     *
     * @param fullname {String} Full name of the function including the class name.
     * @param fcn {Function} Function to time.
     * @param args {Arguments} The arguments passed to the wrapped function
     */
    callTraceEnter: function(fullName, fcn, type, args)
    {
      // time stamp
      // code from qx.log.appender.Abstract
      var time = new String(new Date().getTime() - qx.core.Bootstrap.LOADSTART);
      while (time.length < 6) {
        time = "0" + time;
      }
      console.log(time+" "+fullName+'(%o)', args);
    }

  },


  defer : function(statics)
  {
    qx.core.Aspect.addAdvice("before", "*", "demobrowser\.(?!(DemoBrowser\.(init|get|set)|Application))", statics.callTraceEnter);
    //qx.core.Aspect.addAdvice("before", "*", "(?!qx.event.*)", statics.callTraceEnter);

  }

});
