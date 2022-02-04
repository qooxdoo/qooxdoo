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
  extend: qx.tool.migration.BaseMigration,
  members: {
    async migrateManifest() {
      let dryRun = this.getRunner().getDryRun();
      let verbose = this.getRunner().getVerbose();
      // Update all Manifests
      let updateManifest = false;
      for (const manifestModel of await qx.tool.config.Utils.getManifestModels()) {
        await manifestModel
          .set({
            warnOnly: true
          })
          .load();
        if (manifestModel.keyExists("requires.@qooxdoo/compiler")) {
          if (dryRun) {
            this.markAsPending(
              "@qooxdoo/compiler dependency will be removed from Manifest."
            );
          } else {
            manifestModel.unset("requires.@qooxdoo/compiler");
            this.markAsApplied();
            await manifestModel.save();
          }
        }
        // update schema
        await this.updateSchemaUnlessDryRun(
          manifestModel,
          "https://qooxdoo.org/schema/Manifest-2-0-0.json"
        );

        // update qooxdoo version
        await this.updateQxDependencyUnlessDryRun(manifestModel);

        // save Manifest file
        if (!dryRun) {
          manifestModel.setValidate(false); // shouldn't be necessary
          await manifestModel.save();
        }
      }
    }
  }
});
