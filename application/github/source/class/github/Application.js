/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (trkoch)

************************************************************************ */

/**
 * A wrapper of the Github demo.
 *
 * The purpose of this wrapper is to provide a standalone version of the demo
 * that satisfies dependencies which cannot be met in the context of a demo browser
 * application. Specifically, this application relies on a .php index file and
 * therefore needs a runtime environment with PHP enabled.
 *
 * @lint ignoreUndefined(demobrowser)
 */
qx.Class.define("github.Application",
{
  extend : demobrowser.demo.data.Github,

  members :
  {
    main : function()
    {
      this.base(arguments);
    }
  }
});
