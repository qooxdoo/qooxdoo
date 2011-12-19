/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
      
      // 'qooxdoo' as fallback
      if (value == undefined) {
        value = "qooxdoo";
      }
    }
    
    if (version == undefined)
    {
      // if no parameter value given: use the environment variable
      version = qx.core.Environment.get("versionLabel.version");
      
      if (version == undefined)
      {
        // revision or version number as fallback
        version = qx.core.Environment.get("qx.revision");
        if (version == "") {
          version = qx.core.Environment.get("qx.version");
        }
      }
    }

    this.base(arguments, value + " " + version);
  }
});
