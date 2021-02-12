/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2021 The authors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (info@bibliograph.org, @cboulanger)

************************************************************************ */

const process = require("process");
const path = require("upath");
const semver = require("semver");
const fs = qx.tool.utils.Promisify.fs;

/**
 * Migration class for updating from v6 to v7
 */
qx.Class.define("qx.tool.migration.M7_0_0", {
  extend: qx.core.Object,
  implement: qx.tool.migration.IMigration,
  members: {
    /**
     * @inheritDoc
     * @see {qx.tool.migration.IMigration#migrate()}
     */
    async migrate(options={}) {
      let {announceOnly} = options;

      // TODO
    }
  }
});

