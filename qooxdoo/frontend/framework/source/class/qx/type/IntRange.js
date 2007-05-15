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
 *<PRE>
 * NAME
 *  IntRange - create a list of successive integers (inspired by Matthias Miller
 *            http://www.outofhanwell.com/blog/index.php?title=javascript_range_function&more=1&c=1&tb=1&pb=1)
 *
 * SYNTAX
 *  var r = new qx.type.IntRange(1,20);
 *  var i;
 *  while ((i = r.next())!=null) { alert(i) }; // yields 1,2,3,..,20
 *
 *  The constructor can take a negative step width, or start > stop, to create
 *  decreasing ranges.For more information on the arguments, see the
 *  constructor.
 *</PRE>
 */
qx.Class.define("qx.type.IntRange",
{
  extend : qx.core.Object,

  /**
   * @param start {Integer ? 0}
   *   inclusive start of range; can be bigger than stop to create decreasing
   *   ranges (default: 0)
   * @param stop  {Integer}     inclusive end of range
   * @param step  {Integer ? 1}
   *   step width between data points; can be negative to create decreasing
   *   ranges (default: 1)
   */
  construct : function(start, stop ,step) // these parms are only for docu
  {
    this.base(arguments);

    if (!arguments.length) {
      return;
    }

    var pstart, pstop, pstep;

    // init iterator params
    if (arguments.length == 1) {
      pstart = 0;
      pstop  = arguments[0];
      pstep  = 1;
    } else {
      pstart = arguments[0];
      pstop  = arguments[1];
      pstep  = arguments[2] || 1;
    }

    // handle descending
    if (pstep < 0 || pstop < pstart) {
      if (pstop < pstart) {
        if (pstep < 0) {
          this.incr  = pstep;
        } else {
          this. incr = pstep * (-1);
        }
        this.start = pstart;
        this.stop  = pstop;
        this.asc   = false;
      } else { // pstart < pstop
        if (pstep < 0) {
          this.start = pstop;
          this.stop  = pstart;
          this.asc   = false;
        } else {
          this.start = pstart;
          this.stop  = pstop;
          this.asc   = true;
        }
        this.incr  = pstep;
      }
    } else { // ascending
      this.start = pstart;
      this.stop  = pstop;
      this.incr  = pstep;
      this.asc   = true;
    }

    this.curr  = this.start;

    return;
  },


  members : {

    /**
     * Return the next number in the range, or null.
     *
     * @type member
     * @return {Integer/Null}
     */
    next: function () {
      var curr = this.curr;
      if (curr != null) {
        if (this.asc) { //ascending
          if ((this.curr + this.incr) <= this.stop){
            this.curr += this.incr;
          } else {
            this.curr = null;
          }
        } else { //descending
          if ((this.curr + this.incr) >= this.stop){
            this.curr += this.incr;
          } else {
            this.curr = null;
          }
        }
      }
      return curr;
    } //next

  }
});

