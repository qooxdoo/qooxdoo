/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

/**
 * @module resource
 *
 * @desc
 * Collects resource/asset paths, which includes globbing:
 *
 * <ul>
 *   <li>images (e.g. png, jpg, gif ...)</li>
 *   <li>text (e.g. js, css, html, xml, txt, php, json, mxml, meta ...)</li>
 *   <li>fonts (e.g. woff, tff, eot ...)</li>
 *   <li>binary data (e.g. swf ...)</li>
 *   <li>audio (mp3, wav, ogg ...)</li>
 *   <li>video (m4v, ogv, webm ...)</li>
 * </ul>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------


// native
var fs = require('fs');
var path = require('path');

// third party
var imgsize = require('image-size');
var glob = require('glob');
var shell = require('shelljs');

// qx
var q = require('qooxdoo');

// local (modules may be injected by test env)
var qxResource = (qxResource || {
  Image: require('./qxResource/Image'),
  Resource: require('./qxResource/Resource')
});

//------------------------------------------------------------------------------
// Privates
//------------------------------------------------------------------------------

/**
 * Finds resource meta files.
 *
 * @param {Object} root - file path
 * @returns {string[]} - globbed meta file entries
 */
function findResourceMetaFiles(root) {
  return glob.sync('**/*.meta', {cwd: root});
}

/**
 * Combines the content of all provided meta files.
 *
 * @param {string[]} metaFilePaths
 * @param {string} basePath
 * @returns {Object}
 */
function processMetaFiles(metaFilePaths, basePath) {
  var combinedMap = {};

  metaFilePaths.forEach(function(metaPath) {
    var curAbsPath = path.join(basePath, metaPath);
    var content = fs.readFileSync(curAbsPath, {encoding: 'utf8'});
    var json = JSON.parse(content);
    q.Bootstrap.objectMergeWith(combinedMap, json);
  });

  return combinedMap;
}

/**
 * Throws an error if a namespace has no corresponding base path.
 *
 * @param {string[]} namespaces
 * @param {Object} resBasePathMap - base paths by namespace
 */
function basePathForNsExistsOrError(namespaces, resBasePathMap) {
  for (var i = 0; i < namespaces.length; i++) {
    var ns = namespaces[i];
    if (!(ns in resBasePathMap)) {
      throw new Error('ENOENT - Namespace unknown: ' + ns);
    }
  }
}

/**
 * Returns namespace from class name by checking against
 * all namespaces (longest match wins).
 *
 * <ul>
 *  <li>'qx.Foo.Bar'   => 'qx'      / allNa: ['qx', ...]</li>
 *  <li>'qx.Foo.Bar'   => 'qx.Foo'  / allNa: ['qx', 'qx.Foo', ...]</li>
 *  <li>'qxc.ui.Pane'  => 'qxc.ui'  / allNa: ['qxc.ui.logpane', ...]</li>
 * </ul>
 *
 * <p>
 * TODO: Copy from pkg <code>qx-dependency</code> => <code>dependency/lib/util.js</code>.
 *       Maybe extract in own package <code>qx-classid</code>.
 * </p>
 *
 * @param {string} className
 * @param {string[]} allNamespaces
 * @returns {string} namespace
 */
function namespaceFrom(className, allNamespaces) {
  var exceptions = ['qxWeb', 'q'];
  if (exceptions.indexOf(className) !== -1) {
    return 'qx';
  }

  allNamespaces.sort(function(a, b){
    // asc -> a - b
    // desc -> b - a
    return b.length - a.length;
  });

  var i = 0;
  var l = allNamespaces.length;
  var curNs = '';
  for (; i<l; i++) {
    curNs = allNamespaces[i];
    if (className.indexOf(curNs) !== -1) {
      return curNs;
    }
  }

  return false;
}

/**
 * Flattens assetPaths (originally by class ids) by their namespaces.
 *
 * @param {Object} assetPaths
 * @param {string[]} namespaces
 * @returns {Object} assetNsPaths
 */
function flattenAssetPathsByNamespace(assetPaths, namespaces) {
  var assetNsPaths = {};
  var posFirstDot = 0;
  var className = '';
  var ns = '';

  var uniqueValues = function(value, index, self) {
    return self.indexOf(value) === index;
  };

  for (className in assetPaths) {
    ns = namespaceFrom(className, namespaces);
    if (!(ns in assetNsPaths)) {
      assetNsPaths[ns] = [];
    }

    assetNsPaths[ns] = assetNsPaths[ns].concat(assetPaths[className]);
    assetNsPaths[ns] = assetNsPaths[ns].filter(uniqueValues);
  }

  return assetNsPaths;
}

/**
 * Globs and sanitizes asset paths.
 *
 * @param {Object} assetNsPaths
 * @param {Object} resBasePathMap - base paths by namespace
 * @returns {Object} assetNsPaths
 */
function globAndSanitizePaths(assetNsPaths, resBasePathMap) {
  var toBeGlobbed = [];
  var ns = '';
  var assetNsBasesPaths = {};

  var nonDir = function(item) {
    return (item.slice(-1) !== '/');
  };

  var nonMetaFiles = function(item) {
    return (item.indexOf('.meta') === -1);
  };

  var globifyProperly = function(expr) {
    return (expr.slice(-1) === '*') ? expr.replace('*', '**/*') : expr;
  };

  var isEmpty = function(obj) {
    return (Object.keys(obj).length === 0);
  };

  var collectMatchingBases = function(resBasePathMap, resPath) {
    var resWithBases = {};
    var absResPath = '';
    var ns = '';

    for (ns in resBasePathMap) {
      absResPath = path.join(resBasePathMap[ns], resPath);
      if (fs.existsSync(absResPath)) {
        resWithBases[ns] = resPath;
      }
    }
    return resWithBases;
  };

  var createEmptyBasePathProperties = function(assetNsPaths) {
    var assetNsBasesPaths = {};
    var ns1 = '';
    var ns2 = '';

    for (ns1 in assetNsPaths) {
      assetNsBasesPaths[ns1] = {};
      for (ns2 in assetNsPaths) {
        assetNsBasesPaths[ns1][ns2] = [];
      }
    }

    return assetNsBasesPaths;
  };

  var addResWithBases = function(assetNsBasesPaths, resWithBase) {
    var base = '';

    for (base in resWithBase) {
      assetNsBasesPaths[base].push(resWithBase[base]);
    }

    return assetNsBasesPaths;
  };

  assetNsBasesPaths = createEmptyBasePathProperties(assetNsPaths);

  for (ns in assetNsPaths) {
    if (!toBeGlobbed[ns]) {
      toBeGlobbed[ns] = [];
    }

    var i = 0;
    var l = assetNsPaths[ns].length;
    var resPath = '';
    var resWithBases = {};
    for (; i<l; i++) {
      resPath = assetNsPaths[ns][i];
      resWithBases = collectMatchingBases(resBasePathMap, resPath);

      if (!isEmpty(resWithBases)) {
        assetNsBasesPaths[ns] = addResWithBases(assetNsBasesPaths[ns], resWithBases);
      }

      if (resPath.indexOf('*') !== -1) {
        toBeGlobbed[ns].push(resPath);
      }
    }

    i = 0;
    l = toBeGlobbed[ns].length;
    var globbedPaths = [];
    var globRes = '';
    var namespace = '';
    for (; i<l; i++) {
      globRes = globifyProperly(toBeGlobbed[ns][i]);
      // try every namespace base path
      // because e.g. 'myapp' may also use imgs from 'qx'
      // TODO: the manual states that order is important
      // (for shadowing resources) - this isn't regarded yet!
      // See: desktop/ui_resources.html
      // maybe introduce '_order' property within resBasePathMap
      for (namespace in resBasePathMap) {
        globbedPaths = glob.sync(globRes, {cwd: resBasePathMap[namespace], mark: true});
        if (globbedPaths.length > 0) {
          // works in combination with {mark: true} from glob options
          globbedPaths = globbedPaths.filter(nonDir);
          globbedPaths = globbedPaths.filter(nonMetaFiles);
          assetNsBasesPaths[ns][namespace] = assetNsBasesPaths[ns][namespace].concat(globbedPaths);
        }
      }
    }
  }

  // assetNsBasesPaths = filterUnwantedFiles(assetNsBasesPaths);
  return assetNsBasesPaths;
}

/**
 * Creates and populates resource objects.
 *
 * @param {string} kind - currently only 'image' gets a special treatment
 * @param {string[]} resPaths
 * @param {string} ns
 * @param {string} basePath
 * @returns {Array.<qxResource.Image|qxResource.Resource>}
 */
function createResources(kind, resPaths, ns, basePath) {
  var resources = [];
  var l = resPaths.length;
  var i = 0;

  switch(kind) {
    case 'image':
      for (; i<l; i++) {
        var img = new qxResource.Image(resPaths[i], ns);
        img.collectInfoAndPopulate(basePath);
        resources.push(img);
      }
      break;

    default:
      for (; i<l; i++) {
        var res = new qxResource.Resource(resPaths[i], ns);
        resources.push(res);
      }
  }

  return resources;
}

/**
 * Combines all resource info maps to one object.
 *
 * @param {Array.<qxResource.Image|qxResource.Resource>} resources
 * @returns {Object}
 */
function createResourceInfoMaps(resources) {
  var resInfo = {};

  resources.forEach(function(res){
    q.Bootstrap.objectMergeWith(resInfo, res.stringify());
  });

  return resInfo;
}

/**
 * Checks all resources whether they are part of a metra entry and
 * if so, collects their resource info map.
 *
 * @param {Object} assetNsPaths
 * @param {Object} resBasePathMap - base paths by namespace
 * @returns {Object} usedMetaEntries
 */
function collectUsedMetaEntries(assetNsPaths, resBasePathMap) {
  var usedMetaEntries = {};
  var ns1 = '';
  var ns2 = '';

  for (ns1 in assetNsPaths) {
    for (ns2 in assetNsPaths[ns1]) {
      var l = assetNsPaths[ns1][ns2].length;
      var i = 0;
      var imgPath = '';
      var metaPaths = findResourceMetaFiles(resBasePathMap[ns2]);
      var metaEntries = processMetaFiles(metaPaths, resBasePathMap[ns2]);

      for (; i<l; i++) {
        imgPath = assetNsPaths[ns1][ns2][i];
        if (metaEntries[imgPath]) {
          usedMetaEntries[imgPath] = metaEntries[imgPath];
          // insert namespace
          usedMetaEntries[imgPath].splice(3, 0, ns2);
          // remove original entry
          assetNsPaths[ns1][ns2].splice(i, 1);
        }
      }
    }
  }

  return usedMetaEntries;
}

/**
 * Expands asset macros within asset paths.
 *
 * @param {Object} assetNsPaths
 * @param {Object} macroToExpansionMap - string replacement map (<code>s/{key}/{value}/</code>)
 * @returns {Object} assetNsPaths
 */
function expandAssetMacros(assetNsPaths, macroToExpansionMap) {
  var macro = '';
  var ns = '';
  var curAsset = '';
  var replacement = '';
  var i = 0;
  var l = 0;

  for (ns in assetNsPaths) {
    for (macro in macroToExpansionMap) {
      l = assetNsPaths[ns].length;
      for (i=0; i<l; i++) {
        curAsset = assetNsPaths[ns][i];
        if (curAsset.indexOf(macro) !== -1) {
          replacement = curAsset.replace(macro, macroToExpansionMap[macro]);
          assetNsPaths[ns].splice(i, 1, replacement);
        }
      }
    }
  }

  return assetNsPaths;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = {
  /**
   * Flattens (by namespace), expands (macros) and globs (resource paths) assets.
   *
   * @param {Object} assets
   * @param {Object} resBasePathMap - base paths by namespace
   * @param {Object} macroToExpansionMap - string replacement map (s/{key}/{value}/)
   */
  flattenExpandAndGlobAssets: function(assets, resBasePathMap, macroToExpansionMap) {
    var assetNsPaths = {};
    var assetNsBasesPaths = {};
    var namespaces = Object.keys(resBasePathMap);

    // Note: not possible anymore when qx packages are introduced
    // cause classes and resources then belong together
    assetNsPaths = flattenAssetPathsByNamespace(assets, namespaces);

    basePathForNsExistsOrError(namespaces, resBasePathMap);

    assetNsPaths = expandAssetMacros(assetNsPaths, macroToExpansionMap);

    // console.log(assetNsPaths);
    assetNsBasesPaths = globAndSanitizePaths(assetNsPaths, resBasePathMap);
    // console.log(JSON.stringify(assetNsBasesPaths, null, 2));

    return assetNsBasesPaths;
  },

  /**
   * Collects resources as one big resource struct/info map.
   *
   * @param {Object} assetNsPaths
   * @param {Object} resBasePathMap - base paths by namespace
   * @param {Object} [options]
   * @param {Object} [options.metaFiles=false] - whether to include meta entries
   * @param {Object} - resource struct/map (i.e. JSON compatible) object
   */
  collectResources: function(assetNsBasesPaths, resBasePathMap, options) {
    var opts = {};
    var imgs = [];
    var images = [];
    var res = [];
    var resources = [];
    var usedMetaEntries = {};
    var resStruct = {};
    var imgsStruct = {};
    var ns1 = '';
    var ns2 = '';

    if (!options) {
      options = {};
    }

    // merge options and default values
    opts = {
      metaFiles: options.metaFiles === true ? true : false,
    };

    var isImg = function(path) {
      return /(png|gif|jpe?g)$/.test(path);
    };

    var isNotImg = function(path) {
      return !isImg(path);
    };

    if (opts.metaFiles) {
      usedMetaEntries = collectUsedMetaEntries(assetNsBasesPaths, resBasePathMap);
    }

    for (ns1 in assetNsBasesPaths) {
      for (ns2 in assetNsBasesPaths[ns1]) {
        imgs = assetNsBasesPaths[ns1][ns2].filter(isImg);
        images = images.concat(createResources('image', imgs, ns2, resBasePathMap[ns2]));

        res = assetNsBasesPaths[ns1][ns2].filter(isNotImg);
        resources = resources.concat(createResources('resource', res, ns2));
      }
    }

    // create json structs
    resStruct = createResourceInfoMaps(resources);
    imgsStruct = createResourceInfoMaps(images);
    q.Bootstrap.objectMergeWith(resStruct, imgsStruct);
    if (opts.metaFiles) {
      q.Bootstrap.objectMergeWith(resStruct, usedMetaEntries);
    }

    return resStruct;
  },

  /**
   * Copies resources given in assetNsPaths from matching resBasePathMap
   * to the resDirName.
   *
   * @param {String} resDirName - root dir for all resources
   * @param {Object} assetNsPaths
   * @param {Object} resBasePathMap - base paths by namespace
   */
  copyResources: function(resDirName, resBasePathMap, assetNsPaths) {
    if (!fs.existsSync(resDirName)) {
      shell.mkdir("-p", resDirName);
    }

    var ns = "";
    var resNs = "";
    var resSourcePath = "";
    var resTargetPath = "";
    var resTargetPathDirName = "";

    var copyResource = function(resPath) {
      resSourcePath = path.join(resBasePathMap[resNs], resPath);
      resTargetPath = path.join(resDirName, resPath);
      resTargetPathDirName = path.dirname(resTargetPath);
      if (!fs.existsSync(resTargetPathDirName)) {
        shell.mkdir("-p", resTargetPathDirName);
      }
      shell.cp("-f", resSourcePath, resTargetPath);
    };

    for (ns in assetNsPaths) {
      for (resNs in assetNsPaths[ns]) {
        assetNsPaths[ns][resNs].forEach(copyResource);
      }
    }
  }
};
