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
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("qx.test.dev.unit.Requirements", {

  extend : qx.dev.unit.TestCase,

  include : [qx.dev.unit.MRequirements],

  members :{

    hasFulfilledReq : function()
    {
      return true;
    },

    hasUnfulfilledReq : function()
    {
      return false;
    },

    testRequirementPass : function()
    {
      try {
        this.require(["fulfilledReq"]);
      }
      catch(ex) {
        this.fail("Check for fulfilled requirement failed!");
      }
    },

    testRequirementFail : function()
    {
      var self = this;
      this.assertException(function() {
        self.require(["fulfilledReq", "unfulfilledReq"]);
      }, qx.dev.unit.RequirementError);
    },

    testMissingCheck : function()
    {
      var self = this;
      this.assertException(function() {
        self.require(["monkeyCheese"]);
      }, Error, /Unable to verify requirement/);
    },

    testEnvironmentPass : function()
    {
      qx.core.Environment.add("qx.test.requirement.syncTrue", function() {
        return true;
      });

      try {
        this.require(["fulfilledReq", "qx.test.requirement.syncTrue"]);
      }
      catch(ex) {
        this.fail("Check for environment key failed!");
      }

      delete qx.core.Environment.getChecks()["qx.test.requirement.syncTrue"];
    },

    testEnvironmentFail : function()
    {
      qx.core.Environment.add("qx.test.requirement.syncFalse", function() {
        return false;
      });

      var self = this;
      this.assertException(function() {
        self.require(["fulfilledReq", "qx.test.requirement.syncFalse"]);
      }, qx.dev.unit.RequirementError);

      delete qx.core.Environment.getChecks()["qx.test.requirement.syncFalse"];
    },

    testEnvironmentAsync : function()
    {
      qx.core.Environment.getAsyncChecks()["qx.test.requirement.async"] = function() {
        return false;
      };
      var self = this;
      this.assertException(function() {
        self.require(["qx.test.requirement.async"]);
      }, Error, /Asynchronous environment checks are not supported/);

      delete qx.core.Environment.getAsyncChecks()["qx.test.requirement.async"];
    }

    /* Disabled until we've come up with a solution for bug #5516
    testEnvironmentNonBoolean : function()
    {
      var self = this;
      this.assertException(function() {
        self.require(["browser.name"]);
      }, Error, /value is not boolean/);
    }
    */
  }
});