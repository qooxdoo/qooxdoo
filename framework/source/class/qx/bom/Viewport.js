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
     * Sebastian Fastner (fastner)
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

   * Yahoo! UI Library
       http://developer.yahoo.com/yui
       Version 2.2.0

     Copyright:
       (c) 2007, Yahoo! Inc.

     License:
       BSD: http://developer.yahoo.com/yui/license.txt

   ----------------------------------------------------------------------

     http://developer.yahoo.com/yui/license.html

     Copyright (c) 2009, Yahoo! Inc.
     All rights reserved.

     Redistribution and use of this software in source and binary forms,
     with or without modification, are permitted provided that the
     following conditions are met:

     * Redistributions of source code must retain the above copyright
       notice, this list of conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright
       notice, this list of conditions and the following disclaimer in
       the documentation and/or other materials provided with the
       distribution.
     * Neither the name of Yahoo! Inc. nor the names of its contributors
       may be used to endorse or promote products derived from this
       software without specific prior written permission of Yahoo! Inc.

     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
     FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
     COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
     HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
     STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
     ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
     OF THE POSSIBILITY OF SUCH DAMAGE.

************************************************************************ */

/**
 * Includes library functions to work with the client's viewport (window).
 */
qx.Class.define("qx.bom.Viewport",
{
  statics :
  {
    /**
     * Returns the current width of the viewport (excluding an eventually visible scrollbar).
     *
     * <code>clientWidth</code> is the inner width of an element in pixels. It includes padding
     * but not the vertical scrollbar (if present, if rendered), border or margin.
     *
     * The property <code>innerWidth</code> is not useable as defined by the standard as it includes the scrollbars
     * which is not the indented behavior of this method. We can decrement the size by the scrollbar
     * size but there are easier possibilities to work around this.
     *
     * Safari 2 and 3 beta (3.0.2) do not correctly implement <code>clientWidth</code> on documentElement/body,
     * but <code>innerWidth</code> works there. Interesting is that webkit do not correctly implement
     * <code>innerWidth</code>, too. It calculates the size excluding the scroll bars and this
     * differs from the behavior of all other browsers - but this is exactly what we want to have
     * in this case.
     *
     * Opera less then 9.50 only works well using <code>body.clientWidth</code>.
     *
     * Verified to correctly work with:
     *
     * * Mozilla Firefox 2.0.0.4
     * * Opera 9.2.1
     * * Safari 3.0 beta (3.0.2)
     * * Internet Explorer 7.0
     *
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The width of the viewable area of the page (excludes scrollbars).
     */
    getWidth : qx.core.Environment.select("engine.name",
    {
      "opera" : function(win) {
        if (parseFloat(qx.core.Environment.get("engine.version")) < 9.5) {
          return (win||window).document.body.clientWidth;
        }
        else
        {
          var doc = (win||window).document;
          return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientWidth : doc.body.clientWidth;
        }
      },

      "webkit" : function(win) {
        if (parseFloat(qx.core.Environment.get("engine.version")) < 523.15) { // Version < 3.0.4
          return (win||window).innerWidth;
        }
        else
        {
          var doc = (win||window).document;
          return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientWidth : doc.body.clientWidth;
        }
      },

      "default" : function(win)
      {
        var doc = (win||window).document;
        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientWidth : doc.body.clientWidth;
      }
    }),


    /**
     * Returns the current height of the viewport (excluding an eventually visible scrollbar).
     *
     * <code>clientHeight</code> is the inner height of an element in pixels. It includes padding
     * but not the vertical scrollbar (if present, if rendered), border or margin.
     *
     * The property <code>innerHeight</code> is not useable as defined by the standard as it includes the scrollbars
     * which is not the indented behavior of this method. We can decrement the size by the scrollbar
     * size but there are easier possibilities to work around this.
     *
     * Safari 2 and 3 beta (3.0.2) do not correctly implement <code>clientHeight</code> on documentElement/body,
     * but <code>innerHeight</code> works there. Interesting is that webkit do not correctly implement
     * <code>innerHeight</code>, too. It calculates the size excluding the scroll bars and this
     * differs from the behavior of all other browsers - but this is exactly what we want to have
     * in this case.
     *
     * Opera less then 9.50 only works well using <code>body.clientHeight</code>.
     *
     * Verified to correctly work with:
     *
     * * Mozilla Firefox 2.0.0.4
     * * Opera 9.2.1
     * * Safari 3.0 beta (3.0.2)
     * * Internet Explorer 7.0
     *
     * @signature function(win)
     * @param win {Window?window} The window to query
     * @return {Integer} The Height of the viewable area of the page (excludes scrollbars).
     */
    getHeight : qx.core.Environment.select("engine.name",
    {
      "opera" : function(win) {
        if (parseFloat(qx.core.Environment.get("engine.version")) < 9.5) {
          return (win||window).document.body.clientHeight;
        }
        else
        {
          var doc = (win||window).document;
          return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientHeight : doc.body.clientHeight;
        }
      },

      "webkit" : function(win) {
        if (parseFloat(qx.core.Environment.get("engine.version")) < 523.15) { // Version < 3.0.4
          return (win||window).innerHeight;
        }
        else {
          var doc = (win||window).document;
          return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientHeight : doc.body.clientHeight;
        }
      },

      "default" : function(win)
      {
        var doc = (win||window).document;
        return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientHeight : doc.body.clientHeight;
      }
    }),


    /**
     * Returns the scroll position of the viewport
     *
     * All clients except IE < 9 support the non-standard property <code>pageXOffset</code>.
     * As this is easier to evaluate we prefer this property over <code>scrollLeft</code>.
     * Since the window could differ from the one the application is running in, we can't
     * use a one-time environment check to decide which property to use.
     *
     * @param win {Window?window} The window to query
     * @return {Integer} Scroll position from left edge, always a positive integer
     */
    getScrollLeft : function(win)
    {
      var doc = (win||window).document;
      return (win||window).pageXOffset || doc.documentElement.scrollLeft ||
      doc.body.scrollLeft;
    },


    /**
     * Returns the scroll position of the viewport
     *
     * All clients except MSHTML support the non-standard property <code>pageYOffset</code>.
     * As this is easier to evaluate we prefer this property over <code>scrollTop</code>.
     * Since the window could differ from the one the application is running in, we can't
     * use a one-time environment check to decide which property to use.
     *
     * @param win {Window?window} The window to query
     * @return {Integer} Scroll position from top edge, always a positive integer
     */
    getScrollTop : function(win)
    {
      var doc = (win||window).document;
      return (win||window).pageYOffset || doc.documentElement.scrollTop ||
      doc.body.scrollTop;
    },


    /**
     * Returns an orientation normalizer value that should be added to device orientation
     * to normalize behaviour on different devices.
     *
     * @return {Map} Orientation normalizing value
     */
    __getOrientationNormalizer : function() {
      // Calculate own understanding of orientation (0 = portrait, 90 = landscape)
      var currentOrientation = this.getWidth() > this.getHeight() ? 90 : 0;
      var deviceOrientation  = window.orientation;
      if (deviceOrientation == null || Math.abs( deviceOrientation % 180 ) == currentOrientation) {
        // No device orientation available or device orientation equals own understanding of orientation
        return {
          "-270":  90,
          "-180": 180,
           "-90": -90,
             "0":   0,
            "90":  90,
           "180": 180,
           "270": -90
        };
      } else {
        // Device orientation is not equal to own understanding of orientation
        return {
          "-270": 180,
          "-180": -90,
           "-90":   0,
             "0":  90,
            "90": 180,
           "180": -90,
           "270":   0
        };
      }
    },


    // Cache orientation normalizer map on start
    __orientationNormalizer : null,


    /**
     * Returns the current orientation of the viewport in degree.
     *
     * All possible values and their meaning:
     *
     * * <code>-90</code>: "Landscape"
     * * <code>0</code>: "Portrait"
     * * <code>90</code>: "Landscape"
     * * <code>180</code>: "Portrait"
     *
     * @param win {Window?window} The window to query
     * @return {Integer} The current orientation in degree
     */
    getOrientation : function(win)
    {
      // The orientation property of window does not have the same behaviour over all devices
      // iPad has 0degrees = Portrait, Playbook has 90degrees = Portrait, same for Android Honeycomb
      //
      // To fix this an orientationNormalizer map is calculated on application start
      //
      // The calculation of getWidth and getHeight returns wrong values if you are in an input field
      // on iPad and rotate your device!
      var orientation = (win||window).orientation;
      if (orientation == null) {
        // Calculate orientation from window width and window height
        orientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
      } else {
        // Normalize orientation value
        orientation = this.__orientationNormalizer[orientation];
      }
      return orientation;
    },


    /**
     * Whether the viewport orientation is currently in landscape mode.
     *
     * @param win {Window?window} The window to query
     * @return {Boolean} <code>true</code> when the viewport orientation
     *     is currently in landscape mode.
     */
    isLandscape : function(win) {
      return Math.abs(this.getOrientation(win)) == 90;
    },


    /**
     * Whether the viewport orientation is currently in portrait mode.
     *
     * @param win {Window?window} The window to query
     * @return {Boolean} <code>true</code> when the viewport orientation
     *     is currently in portrait mode.
     */
    isPortrait : function(win)
    {
      return Math.abs(this.getOrientation(win)) !== 90;
    }
  },


  defer : function(statics) {
    statics.__orientationNormalizer = statics.__getOrientationNormalizer();
  }
});
