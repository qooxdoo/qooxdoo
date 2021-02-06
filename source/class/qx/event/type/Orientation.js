/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

   ======================================================================

   This class contains code based on the following work:

   * Unify Project

     Homepage:
       http://unify-project.org

     Copyright:
       2009-2010 Deutsche Telekom AG, Germany, http://telekom.com

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */


/**
 * Orientation event object.
 */
qx.Class.define("qx.event.type.Orientation",
{
    extend : qx.event.type.Event,


    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    members :
    {
    __orientation : null,
    __mode : null,


    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param orientation {String} One of <code>0</code>, <code>90</code> or <code>-90</code>
     * @param mode {String} <code>landscape</code> or <code>portrait</code>
     * @return {qx.event.type.Orientation} The initialized event instance
     */
    init : function(orientation, mode)
    {
      this.base(arguments, false, false);

      this.__orientation = orientation;
      this.__mode = mode;

      return this;
    },


    /**
     * Get a copy of this object
     *
     * @param embryo {qx.event.type.Orientation?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the data is <code>null</code>,
     *     a new pooled instance is created.
     *
     * @return {qx.event.type.Orientation} a copy of this object
     */
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone.__orientation = this.__orientation;
      clone.__mode = this.__mode;

      return clone;
    },


    /**
     * Returns the current orientation of the viewport in degree.
     *
     * All possible values and their meaning:
     *
     * * <code>0</code>: "Portrait"
     * * <code>-90</code>: "Landscape (right, screen turned clockwise)"
     * * <code>90</code>: "Landscape (left, screen turned counterclockwise)"
     * * <code>180</code>: "Portrait (upside-down portrait)"
     *
     * @return {Integer} The current orientation in degree
     */
    getOrientation: function() {
      return this.__orientation;
    },


    /**
     * Whether the viewport orientation is currently in landscape mode.
     *
     * @return {Boolean} <code>true</code> when the viewport orientation
     *     is currently in landscape mode.
     */
    isLandscape : function() {
      return this.__mode == "landscape";
    },


    /**
     * Whether the viewport orientation is currently in portrait mode.
     *
     * @return {Boolean} <code>true</code> when the viewport orientation
     *     is currently in portrait mode.
     */
    isPortrait : function()
    {
      return this.__mode == "portrait";
    }
  }
});