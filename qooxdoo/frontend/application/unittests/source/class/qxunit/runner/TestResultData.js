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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************
************************************************************************ */

/**
 * Data class which hold all data of a test run.
 */
qx.Class.define("qxunit.runner.TestResultData",
{
  extend : qx.core.Target,

  construct : function(testName)
  {
    this.base(arguments);
    this.setName(testName);
  },

  properties :
  {
    name :
    {
      check : "String"
    },

    state :
    {
      check : ["start", "error", "failure", "success"],
      init : "start",
      event : "changeState"
    },

    message :
    {
      check : "String",
      init : ""
    }

  }

});