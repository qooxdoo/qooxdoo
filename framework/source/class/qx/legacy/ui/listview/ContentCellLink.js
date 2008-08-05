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
 * @appearance list-view-content-cell-link
 */
qx.Class.define("qx.legacy.ui.listview.ContentCellLink",
{
  extend : qx.legacy.ui.embed.LinkEmbed,




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

  statics :
  {
    // selectable = false will break links in gecko based browsers
    selectable :
    {
      refine : true,
      init : true
    },

    empty :
    {
      html : "",
      uri  : "#"
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "list-view-content-cell-link"
    }
  }
});
