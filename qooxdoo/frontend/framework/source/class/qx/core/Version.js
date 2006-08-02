/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.core.Version",
{
  major : 0,
  minor : 6,
  revision : 0,
  state : "beta1",

	svn: parseInt("$Rev: 100 $".match(/[0-9]+/)[0]),

	toString: function()
	{
		with(qx.core.Version) {
			return major + "." + minor + "." + revision + (state == "" ? "" : "-" + state) + " (" + svn + ")";
		}
	}
});
