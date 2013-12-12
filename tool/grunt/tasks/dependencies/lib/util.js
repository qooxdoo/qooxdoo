/* *****************************************************************************
 
   qooxdoo - the new era of web development
 
   http://qooxdoo.org
 
   Copyright:
     2006-2013 1&1 Internet AG, Germany, http://www.1und1.de
 
   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.
 
   Authors:
     * Thomas Herchenroeder (thron7)
 
***************************************************************************** */

var _ = require('underscore');

function pipeline(seed /*,funcs*/) {
  var funcs = _.toArray(arguments).slice(1);
  return _.reduce(funcs, function(accu,func){return func(accu)}, seed);
}

/**
 * have to swap the first two args to _.filter)
 */
function filter(iterator, list) {
  return _.filter(list, iterator);
}

module.exports = {
  pipeline: pipeline,
  filter: filter
};
