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

#module(ui_popup)

************************************************************************ */

qx.Clazz.define("qx.ui.popup.PopupAtom",
{
  extend : qx.ui.popup.Popup,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vIcon)
  {
    qx.ui.popup.Popup.call(this);

    this._atom = new qx.ui.basic.Atom(vLabel, vIcon);
    this._atom.setParent(this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _isFocusRoot : false,


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getAtom : function() {
      return this._atom;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (this._atom)
      {
        this._atom.dispose();
        this._atom = null;
      }

      return qx.ui.popup.Popup.prototype.dispose.call(this);
    }
  }
});
