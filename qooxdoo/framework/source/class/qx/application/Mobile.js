/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */
/* ************************************************************************

#asset(qx/mobile/js)
#asset(qx/mobile/css)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * For a mobile application. Supports the mobile widget set.
 *
 */
qx.Class.define("qx.application.Mobile",
{
  extend : qx.application.Native,
  include : qx.locale.MTranslation,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __root : null,


    // overridden
    main : function()
    {
      this.base(arguments);

      this.__root = this._createRoot();

      if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
        this.__root.setShowScrollbarY(false);
      }
    },


    /**
     * Returns the application's root widget.
     *
     * @return {qx.ui.mobile.core.Widget} The application's root widget.
     */
    getRoot : function() {
      return this.__root;
    },


    /**
     * Creates the application's root widget. Override this function to create
     * your own root widget.
     *
     * @return {qx.ui.mobile.core.Widget} The application's root widget.
     */
    _createRoot : function()
    {
      return new qx.ui.mobile.core.Root();
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__root = null;
  }
});
