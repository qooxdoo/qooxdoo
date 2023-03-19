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

const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const http = require("http");

/**
 * Helper methods for HTTP
 */
qx.Class.define("qx.tool.utils.Http", {
  extend: qx.core.Object,

  statics: {
    /**
     * Downloads a URL into a temporary file
     *
     * @param {String} url URL to download
     * @param {RegEx?} contentTypeRegEx optional regex for the content type
     * @return {String} temporary filename
     */
    async downloadToTempfile(url, contentTypeRegEx) {
      let tmpFilename = await qx.tool.utils.Promisify.call(cb =>
        tmp.tmpName(cb)
      );

      await new Promise((resolve, reject) => {
        http.get(url, res => {
          let error;
          const { statusCode } = res;
          const contentType = res.headers["content-type"];

          if (statusCode !== 200) {
            error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
          } else if (contentTypeRegEx && !contentTypeRegEx.test(contentType)) {
            error = new Error(`Invalid content-type, received ${contentType}`);
          }

          if (error) {
            res.resume();
            reject(error);
            return;
          }

          let outFile = fs.createWriteStream(tmpFilename);
          outFile.on("close", () => resolve(tmpFilename));
          res.on("data", chunk => outFile.write(chunk));
          res.on("end", () => outFile.end());
        });
      });
    }
  }
});
