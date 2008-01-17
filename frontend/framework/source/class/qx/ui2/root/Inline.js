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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui2.root.Inline",
{
  extend : qx.ui2.core.Widget,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(el)
  {
    // Symbolic links
    this._elem = el;

    // Base call
    this.base(arguments);

    // Make relative
    el.style.position = "relative";

    this.scheduleLayoutUpdate();
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    // overridden
    _isRootWidget : true,

    // overridden
    isLayoutRoot : function() {
      return true;
    },

    // overridden
    _createContainerElement : function()
    {
      var root = new qx.html.Root(this._elem);
      delete this._elem;
      return root;
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_elem");
  }
});
