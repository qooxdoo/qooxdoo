/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/**
 * Slightly extended form of a @{qx.ui.basic.Label}, to include a version/
 * revision string of qooxdoo.
 */
qx.Class.define("qxc.ui.versionlabel.VersionLabel",
{
  extend : qx.ui.basic.Label,

  construct : function(value, version)
  {
    if (value == undefined)
    {
      // if no parameter value given: use the environment variable
      value = qx.core.Environment.get("versionLabel.name");
    }

    if (version == undefined)
    {
      // if no parameter value given: use the environment variable
      version = qx.core.Environment.get("versionLabel.version");

      if (version == null)
      {
        // revision or version number as fallback
        version = qx.core.Environment.get("qx.revision");
        if (version == "") {
          version = qx.core.Environment.get("qx.version");
        }
      }
    }

    this.base(arguments, value + " " + version);
  },


  defer : function() {
    /**
     * The name of the version label which is shown in the upper right corner.
     * Defaults to 'qooxdoo'.
     */
    qx.core.Environment.add("versionLabel.name", "qooxdoo");

    /**
     * The version string of the version label which is shown in the upper right corner.
     * Defaults to 'null' to be able to fallback to 'qx.revision' or 'qx.version' easily.
     */
    qx.core.Environment.add("versionLabel.version", null);
  }
});