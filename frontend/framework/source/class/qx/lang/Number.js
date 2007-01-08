/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Helper functions for Number objects
 */
qx.OO.defineClass("qx.lang.Number");

/**
 * Check whether the number is in a given range
 *
 * @param nr {Number}
 * @param vmin {int} lower bound of the range
 * @param vmax {int} upper bound of the range
 * @return {boolean} whether the number is >= vmin and <= vmax
 */
qx.lang.Number.isInRange = function(nr, vmin, vmax) {
  return nr >= vmin && nr <= vmax;
}

/**
 * Check whether the number is between a given range
 *
 * @param nr {Number}
 * @param vmin {int} lower bound of the range
 * @param vmax {int} upper bound of the range
 * @return {boolean} whether the number is > vmin and < vmax
 */
qx.lang.Number.isBetweenRange = function(nr, vmin, vmax) {
  return nr > vmin && nr < vmax;
}

/**
 * Limit the nuber to a given range
 *
 * * If the number is greater than the upper bound, the upper bound is returned
 * * If the number is smaller than the lower bound, the lower bound is returned
 * * If the number is in the range, the number is retuned
 *
 * @param nr {Number}
 * @param vmin {int} lower bound of the range
 * @param vmax {int} upper bound of the range
 * @return {int} the limited number
 */
qx.lang.Number.limit = function(nr, vmin, vmax)
{
  if (typeof vmax === "number" && nr > vmax)
  {
    return vmax;
  }
  else if (typeof vmin === "number" && nr < vmin)
  {
    return vmin;
  }
  else
  {
    return nr;
  }
}
