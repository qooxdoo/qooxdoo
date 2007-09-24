qx./* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.core.Label",
{
  extend : qx.ui2.core.Widget,

  construct : function()
  {
    this.base(arguments);

  },

  properties :
  {
    content :
    {
      check : "String",
      apply : "_applyContent"
    }
  },

  members :
  {
    /**
     * Create the widget's outer HTML element.
     *
     * @return {qx.html.Element} The outer HTML element
     */
    _createContentElement : function()
    {
      var el = new qx.html.Label;

      this._outerElement.add(el);

      return el;
    },

    _applyContent : function(value, old) {
      this._contentElement.setContent(value);
    }
  },

  destruct : function()
  {


  }
});
