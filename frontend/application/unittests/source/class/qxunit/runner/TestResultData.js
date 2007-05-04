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
    },

    exception :
    {
      nullable : true
    }

  },

  members :
  {
    getStackTrace : function()
    {

      var ex = this.getException();
      if (!ex) {
        return "";
      }
      if (ex.stack) {
        this.debug(ex.stack);
        return this._beautyStackTrace(ex.stack);
      } else {
        return "";
      }
    },


    _beautyStackTrace : function(stack)
    {
      // e.g. "()@http://localhost:8080/webcomponent-test-SNAPSHOT/webcomponent/js/com/ptvag/webcomponent/common/log/Logger:253"
      var lineRe = /@(.+):(\d+)$/gm;
      var hit;
      var out = "";
      var scriptDir = "/source/class/";

      while ((hit = lineRe.exec(stack)) != null)
      {
        var url = hit[1];
        var jsPos = url.indexOf(scriptDir);
        var className = (jsPos == -1) ? url : url.substring(jsPos + scriptDir.length).replace(/\//g, ".").replace(/\.js$/, "");

        var lineNumber = hit[2];
        out += className + ":" + lineNumber + "<br>";
      }

      return out;
    }

  }

});