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

#module(ui_listview)

************************************************************************ */

/**
 * @appearance list-view-content-cell-icon-html
 */
qx.Class.define("qx.ui.listview.ContentCellIconHtml",
{
  extend : qx.ui.embed.IconHtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vHtml, vIcon, vIconWidth, vIconHeight)
  {
    this.base(arguments, vHtml, vIcon, vIconWidth, vIconHeight);

    this.initSelectable();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    empty :
    {
      icon : "",
      html : ""
    }
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
      init : "list-view-content-cell-icon-html"
    }
  }
});
