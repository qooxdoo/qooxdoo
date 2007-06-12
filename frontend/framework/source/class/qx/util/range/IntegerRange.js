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
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/**
 * Create a list of successive integers.
 *
 * WARNING: Experimental!
 *          Most likely to change in the future. May be pimped up by ideas
 *          from http://www.mochikit.com/doc/html/MochiKit/Iter.html#fn-range
 *          or consolidated with {@link qx.util.range.Range}
 *
 * The constructor can take a negative step width, or start greater than stop,
 * to create decreasing ranges.
 *
 *<pre class='javascript'>
 *  var r = new qx.util.range.IntegerRange(1,20);
 *  var i;
 *  while ((i = r.next())!=null) { alert(i) }; // yields 1,2,3,..,20
 *</pre>
 */
qx.Class.define("qx.util.range.IntegerRange",
{
  extend : qx.core.Object,

  /**
   * @param start {Integer ? 0}
   *   inclusive start of range; can be bigger than stop to create decreasing
   *   ranges
   * @param stop  {Integer} including end of range
   * @param step  {Integer ? 1}
   *   step width between data points; can be negative to create decreasing
   *   ranges
   */
  construct : function(start, stop ,step) // these parms are needed for documentation
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
          this.incr = -pstep;
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
