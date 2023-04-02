/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023 Zenesis Limited https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (@johnspackman)

************************************************************************ */

const process = require("process");
const path = require("upath");
const semver = require("semver");
const fs = qx.tool.utils.Promisify.fs;

/**
 * Migration class for updating to v7.5.6
 */
qx.Class.define("qx.tool.migration.M7_5_6", {
  extend: qx.tool.migration.BaseMigration,
  members: {
    async migrateManifest() {
      let dryRun = this.getRunner().getDryRun();
      let verbose = this.getRunner().getVerbose();
      // Update all Manifests
      let updateManifest = false;
      for (const manifestModel of await qx.tool.config.Utils.getManifestModels()) {
        manifestModel.set({ warnOnly: true });
        await manifestModel.load();
        let data = manifestModel.getData();

        if (
          data.provides?.webfonts !== undefined &&
          data.provides?.fonts === undefined
        ) {
          if (dryRun) {
            this.markAsPending(
              "provides.webfonts will be replaced with provides.fonts"
            );
          } else {
            this.markAsApplied();
            let fontsData = {};
            data.provides.webfonts.forEach(data => {
              let fontData = (fontsData[data.name] = {});
              ["defaultSize", "comparisonString"].forEach(name => {
                let value = data[name];
                if (value !== undefined) {
                  fontData[name] = value;
                }
              });
              if (data.resources !== undefined) {
                fontData.sources = data.resources;
              }
            });
            data.provides.fonts = fontsData;
            delete data.provides.webfonts;
          }
        }

        // save Manifest file
        if (!dryRun) {
          await manifestModel.save();
        }
      }
    }
  }
});
