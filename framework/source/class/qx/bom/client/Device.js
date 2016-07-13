/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The class is responsible for device detection. This is specially useful
 * if you are on a mobile device.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Device",
{
  statics :
  {
    /** Maps user agent names to device IDs */
    __ids : {
      "Windows Phone": "iemobile",
      "iPod" : "ipod",
      "iPad" : "ipad",
      "iPhone" : "iphone",
      "PSP" : "psp",
      "PLAYSTATION 3" : "ps3",
      "Nintendo Wii" : "wii",
      "Nintendo DS" : "ds",
      "XBOX" : "xbox",
      "Xbox" : "xbox"
    },


    /**
     * Returns the name of the current device if detectable. It falls back to
     * <code>pc</code> if the detection for other devices fails.
     *
     * @internal
     * @return {String} The string of the device found.
     */
    getName : function() {
      var str = [];
      for (var key in qx.bom.client.Device.__ids) {
        str.push(key);
      }
      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      var match = reg.exec(navigator.userAgent);

      if (match && match[1]) {
        return qx.bom.client.Device.__ids[match[1]];
      }

      return "pc";
    },


    /**
     * Determines on what type of device the application is running.
     * Valid values are: "mobile", "tablet" or "desktop".
     * @return {String} The device type name of determined device.
     */
    getType : function() {
      return qx.bom.client.Device.detectDeviceType(navigator.userAgent);
    },


    /**
     * Detects the device type, based on given userAgentString.
     *
     * @param userAgentString {String} userAgent parameter, needed for decision.
     * @return {String} The device type name of determined device: "mobile","desktop","tablet"
     */
    detectDeviceType : function(userAgentString) {
      if(qx.bom.client.Device.detectTabletDevice(userAgentString)){
        return "tablet";
      } else if (qx.bom.client.Device.detectMobileDevice(userAgentString)){
        return "mobile";
      }

      return "desktop";
    },


    /**
     * Detects if a device is a mobile phone. (Tablets excluded.)
     * @param userAgentString {String} userAgent parameter, needed for decision.
     * @return {Boolean} Flag which indicates whether it is a mobile device.
     */
    detectMobileDevice : function(userAgentString){
      return /android.+mobile|ip(hone|od)|bada\/|blackberry|BB10|maemo|opera m(ob|in)i|fennec|NetFront|phone|psp|symbian|IEMobile|windows (ce|phone)|xda/i.test(userAgentString);
    },


    /**
     * Detects if a device is a tablet device.
     * @param userAgentString {String} userAgent parameter, needed for decision.
     * @return {Boolean} Flag which indicates whether it is a tablet device.
     */
    detectTabletDevice : function(userAgentString){
      var isIE10Tablet = (/MSIE 10/i.test(userAgentString)) && (/ARM/i.test(userAgentString)) && !(/windows phone/i.test(userAgentString));
      var isCommonTablet = (!(/android.+mobile|Tablet PC/i.test(userAgentString)) && (/Android|ipad|tablet|playbook|silk|kindle|psp/i.test(userAgentString)));

      return  isIE10Tablet || isCommonTablet;
    },


    /**
     * Detects the device's pixel ratio. Returns 1 if detection is not possible.
     *
     * @return {Number} The device's pixel ratio
     */
    getDevicePixelRatio : function() {
      if (typeof window.devicePixelRatio !== "undefined") {
        return window.devicePixelRatio;
      }

      return 1;
    },


    /**
     * Detects if either touch events or pointer events are supported.
     * Additionally it checks if touch is enabled for pointer events.
     *
     * @return {Boolean} <code>true</code>, if the device supports touch
     */
    getTouch : function() {
      return (("ontouchstart" in window) ||
        window.navigator.maxTouchPoints > 0 ||
        window.navigator.msMaxTouchPoints > 0);
    }
  },


  defer : function(statics) {
      qx.core.Environment.add("device.name", statics.getName);
      qx.core.Environment.add("device.touch", statics.getTouch);
      qx.core.Environment.add("device.type", statics.getType);
      qx.core.Environment.add("device.pixelRatio", statics.getDevicePixelRatio);
  }
});
