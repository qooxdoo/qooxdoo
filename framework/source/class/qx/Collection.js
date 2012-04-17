/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This is the basic collection which does not contain any functionality. It is
 * basically an array which gets enhanced by the different modules you can load.
 * Take a look at the {@link qx.module} namespace to see the API you can use on
 * the Collection.
 */
qx.Bootstrap.define("qx.Collection", {
  extend : qx.type.BaseArray,
  members : {}
});