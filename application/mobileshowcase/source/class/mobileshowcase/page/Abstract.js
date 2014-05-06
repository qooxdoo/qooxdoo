/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Abstract page for Mobile Showcase.
 */
qx.Class.define("mobileshowcase.page.Abstract",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function(wrapContentByGroup)
  {
    this.base(arguments, wrapContentByGroup);
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
     // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().back();
    }
  }
});
