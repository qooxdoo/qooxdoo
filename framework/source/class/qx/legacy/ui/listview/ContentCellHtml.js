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

/**
 * @appearance list-view-content-cell-html
 */
qx.Class.define("qx.legacy.ui.listview.ContentCellHtml",
{
  extend : qx.legacy.ui.embed.HtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vHtml)
  {
    this.base(arguments, vHtml);

    this.initSelectable();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : {
    empty : { html : "" }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    selectable :
    {
      refine : true,
      init : false
    },

    appearance :
    {
      refine : true,
      init : "list-view-content-cell-html"
    }
  }
});
