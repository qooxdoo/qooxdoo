const yauzlPromise = require("yauzl-promise");
const { pipeline } = require("stream/promises");
const fs = require("fs");
const path = require("path");

qx.Class.define("qx.tool.utils.Zip", {
  extend: qx.core.Object,

  statics: {
    /**
     * Unzips a .zip file into a directory.
     *
     * If `filenameFn` is provided then it is used to get the filename to output to; if it returns null, then
     * the file will be skipped.  `targetDircetory` will be ignored if `filenameFn` is provided.
     *
     * @param {String} filename name of the .zip file
     * @param {String?} targetDirectory the directory to unzip into, created if it does not exist
     * @param {Function?} filenameFn used to get the filename to output to
     */
    async unzip(filename, targetDirectory, filenameFn) {
      let zip = await yauzlPromise.open(filename);
      try {
        for await (const entry of zip) {
          if (!entry.filename.endsWith("/")) {
            let filename = null;
            if (filenameFn) {
              filename = filenameFn(entry.filename);
              if (!filename) {
                continue;
              }
            } else {
              filename = path.join(targetDirectory, entry.filename);
            }

            let dirname = path.dirname(filename);
            await fs.promises.mkdir(dirname, { recursive: true });
            let writeStream = fs.createWriteStream(filename);
            let readStream = await entry.openReadStream();
            await pipeline(readStream, writeStream);
          }
        }
      } finally {
        await zip.close();
      }
    }
  }
});
