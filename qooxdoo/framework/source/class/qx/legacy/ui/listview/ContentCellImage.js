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

#asset(qx/static/blank.gif)

************************************************************************ */

/**
 * @appearance list-view-content-cell-image
 */
qx.Class.define("qx.legacy.ui.listview.ContentCellImage",
{
  extend : qx.legacy.ui.basic.Image,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vSource, vWidth, vHeight) {
    this.base(arguments, vSource, vWidth, vHeight);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : {
    empty : { source : "static/image/blank.gif" }
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
      init : "list-view-content-cell-image"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      CUSTOM SETTER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vSource {var} TODOC
     * @return {var} TODOC
     */
    setSource : function(vSource)
    {
      if (this._initialLayoutDone)
      {
        if (vSource == "") {
          return this._updateContent(qx.util.ResourceManager.toUri(qx.legacy.util.AliasManager.getInstance().resolve(vSource)));
        } else {
          return this._updateContent(qx.util.ResourceManager.toUri("qx/static/blank.gif"));
        }
      }
      else
      {
        return qx.legacy.ui.basic.Image.prototype.setSource.call(this, vSource);
      }
    },

    /**
     * Omit dimension setup in list-view
     *
     * @signature function()
     */
    _postApplyDimensions : qx.lang.Function.returnTrue
  }
});
