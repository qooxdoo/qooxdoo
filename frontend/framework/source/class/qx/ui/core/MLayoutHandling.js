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

/**
 * This mixin exposes all methods to manage the layout manager of a widget.
 * It can only be included into instances of {@link Widget}.
 *
 * To optimize the method calls the including widget should call the method
 * {@link #remap} in its defer function. This will map the protected
 * methods to the public ones and save one method call for each function.
 */
qx.Mixin.define("qx.ui.core.MLayoutHandling",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    setLayout : function() {
      return this._setLayout(layout);
    },


    getLayout : function() {
      return this._getLayout();
    }
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Mapping of protected methods to public.
     * This omits an additional function call when using these methods. Call
     * this methods in the defer block of the including class.
     *
     * @param members {Map} The including classes members map
     */
    remap : function(members)
    {
      members.getLayout = members._getLayout;
      members.setLayout = members._setLayout;
    }
  }
});
