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

/**
 * For a mobile application. Supports the mobile widget set.
 *
 * @require(qx.core.Init)
 * @asset(qx/mobile/css)
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

    this._setViewport(qx.application.Mobile.VIEWPORT);
  },


  statics : 
  {
    /** Default viewport settings, used via {@link _setViewport} */
    VIEWPORT : {
      "width": "device-width",
      "initial-scale": "1.0",
      "user-scalable": "0",
      "minimum-scale": "1.0",
      "maximum-scale": "1.0"
    }
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
    },


    /**
     * Sets the viewport content of the application, based on 
     * {@link qx.application.Mobile.VIEWPORT}.
     * @param settings {Map} viewport settings map. 
     */
    _setViewport : function(settings) {
      var viewport = null;

      var metatags = document.getElementsByTagName('meta');
      for (var i = 0; i < metatags.length; i++) {
        var element = metatags[i];
        if (element.getAttribute('name') == 'viewport') {
          viewport = element;
          break;
        }
      }

      if (viewport == null) {
        return;
      }

      // Fix for rendering bug on HTC Android devices with a device pixel ratio 1.5
      if (qx.core.Environment.get("os.name") == "android" && qx.core.Environment.get("device.pixelRatio") == 1.5) {
        settings["user-scalable"] = "yes";
        settings["minimum-scale"] = parseFloat(settings["minimum-scale"] || settings["initial-scale"] || "1.0") + 0.01;
        settings["maximum-scale"] = parseFloat(settings["maximum-scale"] || settings["initial-scale"] || "1.0") + 0.01;
      }

      var arr = [];
      for (var key in settings) {
        arr.push(key + "=" + settings[key]);
      };

      viewport.content = arr.join(", ");
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
