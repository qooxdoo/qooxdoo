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

var Cache = require('../../lib/Cache.js');

var cache = new Cache(__dirname);
var aCacheId = cache.createCacheId('dep', {}, 'qx.foo.Bar', 'build');
cache.write(aCacheId, JSON.stringify({"entry": "this should be cached"}));

console.log(cache.getPath());
console.log(cache.has(aCacheId));
console.log(cache.read(aCacheId));
console.log(cache.stat(aCacheId));
