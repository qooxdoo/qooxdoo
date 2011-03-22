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
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.embed.Html",
{
  extend : qx.ui.mobile.core.Widget,


  construct : function(html)
  {
    this.base(arguments);
    if (html) {
      this.setHtml(html);
    }
  },


  properties :
  {
    html :
    {
      check : "String",
      init : "",
      apply : "_applyHtml"
    }
  },


  members :
  {
    _applyHtml : function(value, old)
    {
      this.getContentElement().innerHTML = value;
      this._domUpdated();
    }
  }
});
