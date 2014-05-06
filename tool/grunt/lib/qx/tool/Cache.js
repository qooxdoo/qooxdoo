/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

// native
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

// third party
var shell = require('shelljs');

// qx
var q = require('qooxdoo');

/**
 * Handles file-caching on disc.
 * Writes everything under the given basepath.
 * CacheIds should use separators (i.e. '-') for proper cache filenames.
 *
 * TODO:
 *    * Look at zlib (which adds asynchronicity :/)
 *    * Look at bson (for fewer filesize and better performance)
 *    * Use lockfile npm package (for file locking)
 *
 * @see tool/pylib/generator/runtime/Cache.py
 */
q.Class.define("qx.tool.Cache",
{
  extend: qx.core.Object,

  /**
   * @param basePath {String} Basepath for all caching dirs/files.
   */
  construct: function(basePath)
  {
    this.base(arguments);
    this.__path = basePath;
    this.__checkfilePath = path.join(basePath, qx.tool.Cache.CHECKFILE);

    this.__createCacheDir(basePath, this.__checkfilePath);
  },

  statics:
  {
    /**
     * Set this to an unique value (e.g. commit hash prefix)
     * when existing caches need clearing.
     */
    CACHE_REVISION: 0x23017fb,

    /**
     * Holds cache revision.
     */
    CHECKFILE: ".cache_check_file",

    /**
     * Additional memory cache for faster lookups and retrievals.
     *
     * {key: {'content':content, 'time': new Date()}}
     */
    MEMCACHE: {},
  },

  members:
  {

    __path: null,
    __checkfilePath: null,

    /**
     * Builds digest from cacheId (prefix-abc => prefix-a5e5260b8...).
     *
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     * @param separator {String} Separator - cacheId should have at least one (e.g. '-').
     * @return {String} Digest from cacheId.
     */
    __buildDigest: function(cacheId, separator) {
      var splittedId = cacheId.split(separator);

      if (splittedId.length === 1) {
        return cacheId;
      }

      var shasum = crypto.createHash('sha1');
      var baseId = splittedId.shift();
      var digestId = shasum.update(splittedId.join(separator)).digest("hex");

      return baseId + separator + digestId;
    },

    /**
     * Builds absolute file path based on cacheId.
     *
     * @param basePath {String} Basepath for all caching dirs/files.
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     */
    __buildAbsFilePath: function(basePath, cacheId) {
      return path.join(basePath, this.__buildDigest(cacheId, '-'));
    },

    /**
     * Adds content under cacheId to memory based cached.
     *
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     * @param content {String} Data to cache (e.g. JSON).
     */
    __addToMemCache: function(cacheId, content) {
      var tmstmp = new Date().getTime();
      qx.tool.Cache.MEMCACHE[cacheId] = {
        'content': content,
        'time': tmstmp
      };
    },

    /**
     * Gets content by cacheId from memory based cached.
     *
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     */
    __getFromMemCache: function(cacheId) {
      return qx.tool.Cache.MEMCACHE[cacheId];
    },

    /**
     * Has memory based cache content under cacheId?
     *
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     * @return {Boolean} Whether cacheId is in cache.
     */
    __isInMemCache: function(cacheId) {
      return !!qx.tool.Cache.MEMCACHE[cacheId];
    },

    /**
     * Create cache dir (if not yet created) and update checkfile.
     *
     * @param path {String} Basepath for all caching dirs/files.
     * @param checkfilePath {String} Path to checkfile.
     */
    __createCacheDir: function(path, checkfilePath) {
      if (!fs.existsSync(path)) {
        shell.mkdir('-p', path);
        this.__updateCheckfile(checkfilePath, qx.tool.Cache.CACHE_REVISION);
      }

      if (!fs.statSync(path).isDirectory()) {
        throw new Error("The cache path is not a directory: " + path);
      }
    },

    /**
     * Update checkfile with given data (e.g. CACHE_REVISION)
     *
     * @param checkfilePath {String} Path to checkfile.
     * @param data {String} Data to write.
     */
    __updateCheckfile: function(checkfilePath, data) {
      try {
        fs.writeFileSync(checkfilePath, data);
      } catch (e) {
        throw Error("Cannot write cache check file " + checkfilePath);
      }
    },

    /**
     * Get basepath for all caching dirs/files.
     *
     * @return {String} path
     */
    getPath: function() {
        return this.__path;
    },

    /**
     *
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     * @return {Boolean} Whether cacheId is in cache.
     */
    has: function(cacheId) {
      return fs.existsSync(this.__buildAbsFilePath(this.__path, cacheId));
    },

    /**
     * Reads content retrieved by cacheId.
     *
     * TODO:
     *   * misses relevant parts from Cache.py
     *
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     * @param memory {Boolean?false} If the content should be cached in memory.
     * @param {String} content found by cacheId.
     * @return {String} content.
     */
    read: function(cacheId, memory) {
      memory = memory || false;
      var fileContent = null;

      if (this.__isInMemCache(cacheId)) {
        return this.__getFromMemCache(cacheId);
      }

      try {
        var hexedPath = this.__buildAbsFilePath(this.__path, cacheId);
        var buffer = fs.readFileSync(hexedPath);
        fileContent = buffer.toString();
      } catch(e) {
        throw new Error("Couldn't read cache object at " + hexedPath);
      }

      if (memory) {
        this.__addToMemCache(cacheId, fileContent);
      }

      return fileContent;
    },

    /**
     * Writes given content under cacheId.
     *
     * TODO:
     *   * misses relevant parts from Cache.py
     *
     * @param cacheId {String} CacheId (e.g. relative path to src class).
     * @param content {String} Content to write.
     * @param memory {Boolean?false} If the content should be cached in memory, too.
     */
    write: function(cacheId, content, memory) {
      memory = memory || true;

      var buffered = new Buffer(content);
      var hexedPath = this.__buildAbsFilePath(this.__path, cacheId);
      fs.writeFileSync(hexedPath, buffered);

      if (memory) {
        this.__addToMemCache(cacheId, content);
      }
    }
  }
});


// exports
module.exports = qx.tool.Cache;
