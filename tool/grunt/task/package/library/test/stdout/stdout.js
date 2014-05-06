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

var library = require('../../lib/library.js');
var testManifestPaths = [
  './test/data/myapp/Manifest.json',
  './test/data/framework/Manifest.json'
];

console.log(library.getPathsFromManifest(testManifestPaths));

console.log(library.getPathsFor('class', testManifestPaths, {withKeys: true}));
console.log(library.getPathsFor('resource', testManifestPaths, {withKeys: true}));
console.log(library.getPathsFor('translation', testManifestPaths, {withKeys: true}));

console.log(library.getPathsFor('class', testManifestPaths));
console.log(library.getPathsFor('resource', testManifestPaths));
console.log(library.getPathsFor('translation', testManifestPaths));
