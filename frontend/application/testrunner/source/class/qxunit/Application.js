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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(core)

#resource(data:data)
#embed(qxunit.data/*)

************************************************************************ */

qx.Class.define("qxunit.Application", {
  extend : qx.application.Basic,

  construct : function()
  {
    // Define alias for custom resource path
    qx.manager.object.AliasManager.getInstance().add("qxunit", qx.core.Setting.get("qxunit.resourceUri"));
  },

  settings : {
    "qxunit.resourceUri" : "./resource"
  }
});
