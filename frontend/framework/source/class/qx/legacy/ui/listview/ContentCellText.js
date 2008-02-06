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
 * @appearance list-view-content-cell-text
 */
qx.Class.define("qx.ui.listview.ContentCellText",
{
  extend : qx.ui.embed.TextEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText)
  {
    this.base(arguments, vText);

    this.setStyleProperty("whiteSpace", "nowrap");
    this.setStyleProperty("textOverflow", "ellipsis");

    this.initSelectable();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : {
    empty : { text : "" }
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
      init : "list-view-content-cell-text"
    }
  }
});
