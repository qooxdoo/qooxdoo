/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

qx.Class.define("qx.test.dev.unit.Requirements", {
  extend: qx.dev.unit.TestCase,

  include: [qx.dev.unit.MRequirements],

  members: {
    hasFulfilledReq() {
      return true;
    },

    hasUnfulfilledReq() {
      return false;
    },

    testRequirementPass() {
      try {
        this.require(["fulfilledReq"]);
      } catch (ex) {
        this.fail("Check for fulfilled requirement failed!");
      }
    },

    testRequirementFail() {
      var self = this;
      this.assertException(function () {
        self.require(["fulfilledReq", "unfulfilledReq"]);
      }, qx.dev.unit.RequirementError);
    },

    testMissingCheck() {
      var self = this;
      this.assertException(
        function () {
          self.require(["monkeyCheese"]);
        },
        Error,
        /Unable to verify requirement/
      );
    },

    testEnvironmentPass() {
      qx.core.Environment.add(
        "qx.test.dev.unit.Requirements.syncTrue",
        function () {
          return true;
        }
      );

      try {
        this.require([
          "fulfilledReq",
          "qx.test.dev.unit.Requirements.syncTrue"
        ]);
      } catch (ex) {
        this.fail("Check for environment key failed!");
      }

      delete qx.core.Environment.getChecks()[
        "qx.test.dev.unit.Requirements.syncTrue"
      ];
    },

    testEnvironmentFail() {
      qx.core.Environment.add(
        "qx.test.dev.unit.Requirements.syncFalse",
        function () {
          return false;
        }
      );

      var self = this;
      this.assertException(function () {
        self.require([
          "fulfilledReq",
          "qx.test.dev.unit.Requirements.syncFalse"
        ]);
      }, qx.dev.unit.RequirementError);

      delete qx.core.Environment.getChecks()[
        "qx.test.dev.unit.Requirements.syncFalse"
      ];
    },

    testEnvironmentAsync() {
      qx.core.Environment.getAsyncChecks()["qx.test.requirement.async"] =
        function () {
          return false;
        };
      var self = this;
      this.assertException(
        function () {
          self.require(["qx.test.requirement.async"]);
        },
        Error,
        /Asynchronous environment checks are not supported/
      );

      delete qx.core.Environment.getAsyncChecks()["qx.test.requirement.async"];
    }
  }
});
