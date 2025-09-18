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

/**
 * Helper methods for HTTP
 */
qx.Class.define("qx.tool.utils.Http", {
  extend: qx.core.Object,

  statics: {
    async getJson(url) {
      let http = url.match(/^https/) ? require("https") : require("http");
      return await new Promise((resolve, reject) => {
        http.get(
          url,
          {
            headers: {
              "User-Agent": "Qooxdoo Compiler"
            }
          },

          res => {
            let error;
            const { statusCode } = res;
            const contentType = res.headers["content-type"];

            if (statusCode !== 200) {
              error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
            } else if (!contentType.match(/application\/json/)) {
              error = new Error(
                `Invalid content-type, received ${contentType}`
              );
            }

            if (error) {
              res.resume();
              reject(error);
              return;
            }

            let strJson = "";
            res.on("data", chunk => (strJson += chunk));
            res.on("end", () => {
              try {
                let data = JSON.parse(strJson);
                resolve(data);
              } catch (ex) {
                reject(ex);
              }
            });
          }
        );
      });
    },

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

      await qx.tool.utils.Http.downloadToFile(
        url,
        tmpFilename,
        contentTypeRegEx
      );
    },

    /**
     * Downloads a URL into a file
     *
     * @param {String} url URL to download
     * @param {String} filename where to download to
     * @param {RegEx?} contentTypeRegEx optional regex for the content type
     */
    async downloadToFile(url, filename, contentTypeRegEx) {
      let http = url.match(/^https/) ? require("https") : require("http");
      await new Promise((resolve, reject) => {
        http.get(
          url,
          {
            headers: {
              "User-Agent": "Qooxdoo Compiler"
            }
          },

          async res => {
            let error;
            const { statusCode } = res;
            const contentType = res.headers["content-type"];

            if (statusCode == 301 || statusCode == 302) {
              res.resume();
              try {
                let result = await qx.tool.utils.Http.downloadToFile(
                  res.headers.location,
                  filename,
                  contentTypeRegEx
                );

                resolve(result);
              } catch (ex) {
                reject(ex);
              }
              return;
            } else if (statusCode !== 200) {
              error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
            } else if (
              contentTypeRegEx &&
              !contentTypeRegEx.test(contentType)
            ) {
              error = new Error(
                `Invalid content-type, received ${contentType}`
              );
            }

            if (error) {
              res.resume();
              reject(error);
              return;
            }

            let outFile = fs.createWriteStream(filename);
            outFile.on("close", () => resolve(filename));
            res.on("data", chunk => outFile.write(chunk));
            res.on("end", () => outFile.end());
          }
        );
      });
    }
  }
});
