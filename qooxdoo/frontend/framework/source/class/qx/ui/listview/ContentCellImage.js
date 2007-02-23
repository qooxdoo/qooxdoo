/* ************************************************************************

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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_listview)
#embed(qx.static/image/blank.gif)

************************************************************************ */

qx.Clazz.define("qx.ui.listview.ContentCellImage",
{
  extend : qx.ui.basic.Image,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vSource, vWidth, vHeight) {
    qx.ui.basic.Image.call(this, vSource, vWidth, vHeight);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : { empty : { source : "static/image/blank.gif" } },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "list-view-content-cell-image"
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
     * @type member
     * @param vSource {var} TODOC
     * @return {var} TODOC
     */
    setSource : function(vSource)
    {
      if (this._initialLayoutDone) {
        return this._updateContent(qx.manager.object.AliasManager.getInstance().resolvePath(vSource == "" ? "static/image/blank.gif" : vSource));
      } else {
        return qx.ui.basic.Image.prototype.setSource.call(this, vSource);
      }
    },

    // Omit dimension setup in list-view
    _postApplyDimensions : qx.lang.Function.returnTrue
  }
});
