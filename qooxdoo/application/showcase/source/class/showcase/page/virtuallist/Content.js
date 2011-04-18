/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
/* ************************************************************************


************************************************************************ */
qx.Class.define("showcase.page.virtuallist.Content",
{
  extend : showcase.AbstractContent,

  construct : function(page)
  {
    this.base(arguments, page);

    this.setView(this._createView());
  },


  members :
  {
    _createView : function()
    {
      return new qx.ui.basic.Label("hello");
    }
  }
});