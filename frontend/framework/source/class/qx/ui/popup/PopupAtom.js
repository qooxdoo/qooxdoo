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

qx.Class.define("qx.ui.popup.PopupAtom",
{
  extend : qx.ui.popup.Popup,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vLabel, vIcon)
  {
    this.base(arguments);

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
     * Accessor method to get the atom sub widget
     *
     * @type member
     * @return {qx.ui.basic.Atom} atom sub widget
     */
    getAtom : function() {
      return this._atom;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_atom");
  }
});
