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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * Framework version number information
 *
 * TODO:
 * <ul>
 *   <li>Resemble naming of http://en.wikipedia.org/wiki/Software_version</li>
 *   <li>Compare/unify with qx.util.Version</li>
 *   <li>The following class variables are not yet included in the api viewer:
 *     <ul>
 *       <li>major</li>
  *      <li>minor</li>
  *      <li>revision (rename to: maintenance)</li>
  *      <li>state</li>
  *      <li>svn (rename to: revision)</li>
  *    </ul>
  *  </li>
  * </ul>
 */
qx.Class.define("qx.core.Version",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Major version number */
    major : 0,

    /** Minor version number */
    minor : 0,

    /** Maintenance number */
    revision : 0,

    /** Revision state */
    state : "",

    /** Subversion revision number */
    svn : 0,

    /** Subversion folder e.g. trunk, release_0_6_3, ... */
    folder : "",


    /**
     * returns the qooxdoo version string
     *
     * @type static
     * @return {String} qooxdoo version string
     */
    toString : function() {
      return this.major + "." + this.minor + (this.revision == 0 ? "" : "." + this.revision) + (this.state == "" ? "" : "-" + this.state) + (this.svn == 0 ? "" : " (r" + this.svn + ")") + (this.folder == "" ? "" : " [" + this.folder + "]");
    },


    /**
     * Initialize class members
     *
     * @type static
     * @return {void}
     */
    __init : function()
    {
      var vSplit = qx.core.Setting.get("qx.version").split(" ");
      var vVersion = vSplit.shift();
      var vInfos = vSplit.join(" ");

      if (/([0-9]+)\.([0-9]+)(\.([0-9]))?(-([a-z0-9]+))?/.test(vVersion))
      {
        this.major = (RegExp.$1 != "" ? parseInt(RegExp.$1) : 0);
        this.minor = (RegExp.$2 != "" ? parseInt(RegExp.$2) : 0);
        this.revision = (RegExp.$4 != "" ? parseInt(RegExp.$4) : 0);
        this.state = typeof RegExp.$6 == "string" ? RegExp.$6 : "";
      }

      if (/(\(r([0-9]+)\))?(\s\[([a-zA-Z0-9_-]+)\])?/.test(vInfos))
      {
        this.svn = (RegExp.$2 != "" ? parseInt(RegExp.$2) : 0);
        this.folder = typeof RegExp.$4 == "string" ? RegExp.$4 : "";
      }
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.version" : "0.0"
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
