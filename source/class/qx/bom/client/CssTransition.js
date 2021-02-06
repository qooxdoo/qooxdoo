/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * CSS Transition support checks.
 *
 * Spec: http://www.w3.org/TR/css3-transitions/
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.CssTransition",
{
  statics : {
    /**
     * Returns the (possibly vendor-prefixed) name of the CSS transition property
     * @return {String|null} transition property name or <code>null</code> if
     * not supported
     * @internal
     */
    getTransitionName : function()
    {
      return qx.bom.Style.getPropertyName("transition");
    },


    /**
     * Main check method which returns an object if CSS transitions are
     * supported. The object contains the following keys:
     * <ul>
     *  <li><code>name</code> The name of the CSS transition property</li>
     *  <li><code>end-event</code> The name of the end event</li>
     * </ul>
     *
     * @internal
     * @return {Object|null} The described object or <code>null</code> if
     * transitions are not supported.
     */
    getSupport : function() {
      var name = qx.bom.client.CssTransition.getTransitionName();
      if (!name) {
        return null;
      }

      var eventName = qx.bom.Event.getEventName(window, "transitionEnd");
      eventName = eventName == "transitionEnd" ? eventName.toLowerCase() : eventName;

      // Detecting the end event's name is not possible in some browsers,
      // so we deduce it from the property name instead.
      if (!eventName) {
        eventName = name + (name.indexOf("Trans") > 0 ? "E" : "e") + "nd";
      }

      return {
        name : name,
        "end-event" : eventName
      };
    }
  },


  defer : function(statics) {
    qx.core.Environment.add("css.transition", statics.getSupport);
  }
});
