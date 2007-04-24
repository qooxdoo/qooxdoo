/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/**
 * NAME
 *  IntRange - create a list of successive integers (inspired by Matthias Miller
 *            http://www.outofhanwell.com/blog/index.php?title=javascript_range_function&more=1&c=1&tb=1&pb=1)
 *
 * SYNTAX
 *  var r = new qx.util.IntRange(1,20);
 *  for (var i in r.range) { alert(r.range[i]) }; // yields 1,2,3,..,20
 */
qx.Class.define("qx.util.IntRange",
{
  extend : qx.core.Object,

  /**
   * IntRange constructor
   * can take negative step width, or min > max, to create decreasing ranges.
   *
   * @type constructor
   * @param start {Integer} inclusive start of range [default: 0]
   * @param stop  {Integer} inclusive end of range
   * @param step  {Integer} step width between data points [default: 1]
   * @return {void} 
   */
  construct : function(/*[start,] stop [,step]*/)
  {
    this.base(arguments);

    if (!arguments.length) {
      return;
    }

    var range = [];
    var start, stop, step;
    var reverse;

    // init iterator params
    if (arguments.length == 1) {
      start = 0;
      stop  = arguments[0];
      step  = 1;
    } else {
      start = arguments[0];
      stop  = arguments[1];
      step  = arguments[2] || 1;
    }

    if (step < 0 || stop <= start) {
      step = Math.abs(step);
      if (stop <= start) {
        var t = stop;
        stop  = start;
        start = t;
      }
      reverse = true;
    }

    // construct range list
    for (var i=start; i<=stop; i+=step) {
      range.push(i);
    }
    if (reverse) {
      range.reverse();
    }

    if (range.length) {
      this.range = range;
    }

    return;
  },

  
  members : {
    range : [],

    foo   : function (bar) {}
  }
});

