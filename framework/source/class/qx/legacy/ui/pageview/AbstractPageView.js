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


************************************************************************ */

qx.Class.define("qx.legacy.ui.pageview.AbstractPageView",
{
  type : "abstract",
  extend : qx.legacy.ui.layout.BoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vBarClass, vPaneClass)
  {
    this.base(arguments);

    this._bar = new vBarClass;
    this._pane = new vPaneClass;

    this.add(this._bar, this._pane);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @return {AbstractPane} TODOC
     */
    getPane : function() {
      return this._pane;
    },


    /**
     * TODOC
     *
     * @return {AbstractBar} TODOC
     */
    getBar : function() {
      return this._bar;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_bar", "_pane");
  }
});
