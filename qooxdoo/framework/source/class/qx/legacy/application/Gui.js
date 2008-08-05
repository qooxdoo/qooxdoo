/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#require(qx.core.Init)

************************************************************************ */

qx.Class.define("qx.legacy.application.Gui",
{
  extend : qx.core.Object,
  implement : [qx.application.IApplication],
  include : [qx.legacy.application.MGuiCompat],



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface method
    main : function()
    {
      this.compat();
    },


    // interface method
    finalize : function()
    {
      // empty
    },


    // interface method
    terminate : function()
    {
      // empty
    }
  }
});
