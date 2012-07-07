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

#asset(qx/mobile/css)
#require(qx.core.Init)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * For a mobile application. Supports the mobile widget set.
 *
 */
qx.Class.define("qx.application.Mobile",
{
  extend : qx.core.Object,
  implement : [qx.application.IApplication],
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


    // interface method
    main : function()
    {
      this.__root = this._createRootWidget();

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
    _createRootWidget : function()
    {
      return new qx.ui.mobile.core.Root();
    },


    // interface method
    finalize : function()
    {
      // empty
    },


    // interface method
    close : function()
    {
      // empty
    },


    // interface method
    terminate : function()
    {
      // empty
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
