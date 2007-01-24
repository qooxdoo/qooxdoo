/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * qooxdoo version number information
 */
qx.OO.defineClass("qx.core.Version",
{
  /**
   * qooxdoo major version number
   */
  major : 0,

  /**
   * qooxdoo minor version number
   */
  minor : 0,

  /**
   * qooxdoo revision number
   */
  revision : 0,

  /**
   * qooxdoo revision state
   */
  state : "",

  /**
   * qooxdoo subversion revision number
   */
  svn : 0,

  /**
   * returns the qooxdoo version string
   *
   * @return {String} qooxdoo version string
   */
  toString: function()
  {
    with(qx.core.Version) {
      return major + "." + minor + (revision==0 ? "" : "." + revision) + (state == "" ? "" : "-" + state) + (svn==0 ? "" : " (r" + svn + ")");
    }
  },

  init : function()
  {
    var vReg = /([0-9]+)\.([0-9]+)(\.([0-9]))?(-([a-z]+))?(\s\(r([0-9]+)\))?/;
    var vClass = qx.core.Version;

    if (vReg.test(qx.VERSION))
    {
      vClass.major = RegExp.$1 != "" ? parseInt(RegExp.$1) : 0;
      vClass.minor = RegExp.$2 != "" ? parseInt(RegExp.$2) : 0;
      vClass.revision = RegExp.$4 != "" ? parseInt(RegExp.$4) : 0;
      vClass.state = RegExp.$6;
      vClass.svn = RegExp.$8 != "" ? parseInt(RegExp.$8) : 0;
    }
  }
});

qx.core.Version.init();
