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

/**
 * Extracts CLDR data tailored for loader usage.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------


// native
var fs = require("fs");
var path = require("path");

// third party
var imgsize = require('image-size');
var glob = require('glob');

// qx
var q = require('qooxdoo');

var qxResources = {};
qxResources.Image = require('./qxResources/Image');

//------------------------------------------------------------------------------
// Privates
//------------------------------------------------------------------------------

function basePathForNsExistsOrError(namespaces, resBasePathMap) {
  for (var i = 0; i < namespaces.length; i++) {
    var ns = namespaces[i];
    if (!(ns in resBasePathMap)) {
      throw new Error("ENOENT - Namespace unknown: " + ns);
    }
  }
}

function flattenAssetPathsByNamespace(assetPaths) {
  var assetNsPaths = {};
  var namespace = "";
  var posFirstDot = 0;

  for (var className in assetPaths) {
    posFirstDot = className.indexOf(".");
    ns = className.substr(0, posFirstDot);
    if (!(ns in assetNsPaths)) {
      assetNsPaths[ns] = [];
    }

    assetNsPaths[ns] = assetNsPaths[ns].concat(assetPaths[className]);
  }
  return assetNsPaths;
}

function globAndSanitizePaths(assetNsPaths, resBasePathMap) {
  var toBeGlobbed = [];
  var toBeRemoved = [];
  var absImgPath = "";

  for (var ns in assetNsPaths) {
    if (!toBeRemoved[ns]) {
      toBeRemoved[ns] = [];
    }

    if (!toBeGlobbed[ns]) {
      toBeGlobbed[ns] = [];
    }

    var i = 0;
    var l = assetNsPaths[ns].length;
    var imgPath = "";
    for (; i<l; i++) {
      imgPath = assetNsPaths[ns][i];
      if (imgPath.indexOf("*") !== -1) {
      }
      absImgPath = path.join(resBasePathMap[ns], imgPath);

      if (!fs.existsSync(absImgPath)) {
        // catches also "*"
        toBeRemoved[ns].push(imgPath);
      }

      if (imgPath.indexOf("*") !== -1) {
        toBeGlobbed[ns].push(imgPath);
      }
    }

    i = 0;
    l = toBeGlobbed[ns].length;
    var globbedPaths = [];
    var globImg = "";
    for (; i<l; i++) {
      globImg = toBeGlobbed[ns][i];
      globbedPaths = globbedPaths.concat(glob.sync(globImg, {cwd: resBasePathMap[ns]}));
    }

    i = 0;
    l = toBeRemoved[ns].length;
    var rmImg = "";
    var rmIdx = 0;
    for (; i<l; i++) {
      rmImg = toBeRemoved[ns][i];
      rmIdx = assetNsPaths[ns].indexOf(rmImg);
      assetNsPaths[ns].splice(rmIdx, 1);
    }

    // append globbedPaths late to not interfere entry removal
    assetNsPaths[ns] = assetNsPaths[ns].concat(globbedPaths);
  }

  return assetNsPaths;
}

function createImages(imgPaths, ns, basePath) {
  var images = [];
  var l = imgPaths.length;
  var i = 0;

  for (; i<l; i++) {
    img = new qxResources.Image(imgPaths[i], ns);
    img.collectInfoAndPopulate(basePath);
    images.push(img);
  }

  return images;
}

function createImageInfoMaps(images) {
  var imgsInfo = {};

  images.forEach(function(img){
    imgsInfo = q.Bootstrap.objectMergeWith(imgsInfo, img.stringify());
  });

  return imgsInfo;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function collectImageInfoMaps(assets, resBasePathMap) {
  var namespaces = [];
  var ns = "";
  var images = [];

  assetNsPaths = flattenAssetPathsByNamespace(assets);
  // console.log(assetNsPaths);

  namespaces = Object.keys(assetNsPaths);
  basePathForNsExistsOrError(namespaces, resBasePathMap);

  assetNsPaths = globAndSanitizePaths(assetNsPaths, resBasePathMap);
  // console.log(assetNsPaths);

  images = [];
  for (ns in assetNsPaths) {
    images = images.concat(createImages(assetNsPaths[ns], ns, resBasePathMap[ns]));
  }
  imgsInfo = createImageInfoMaps(images);

  return imgsInfo;
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {
  collectImageInfoMaps : collectImageInfoMaps
};
