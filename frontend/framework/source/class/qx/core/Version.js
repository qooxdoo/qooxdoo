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

#module(core)

************************************************************************ */

qx.OO.defineClass("qx.core.Version",
{
  major : 0,
  minor : 6,
  revision : 0,
  state : "",

  svn : Number("$Rev$".match(/[0-9]+/)[0]),

	toString: function()
	{
		with(qx.core.Version) {
			return major + "." + minor + (revision==0 ? "" : "." + revision) + (state == "" ? "" : "-" + state) + " (" + svn + ")";
		}
	}
});
