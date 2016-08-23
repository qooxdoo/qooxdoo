/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Colin Snover (original Date.parse polyfill)

************************************************************************ */
/**
 * This class is responsible for the normalization of the native 'Date' object.
 * It checks if these methods are available and, if not, appends them to
 * ensure compatibility in all browsers.
 * For usage samples, check out the attached links.
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Date", {

  statics : {

    /**
     * Returns the time elapsed since January 1, 1970 in milliseconds.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.9.4.4">Annotated ES5 Spec</a>
     *
     * @return {Integer} Milliseconds since the Unix Epoch
     */
    now : function() {
      return +new Date();
    },

    /**
     * Parses a string representation of a date and return number of milliseconds since Epoch or NaN if string is unrecognised
     *
     * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse">MDN documentation</a>
     *
     * Derived from <https://github.com/csnover/js-iso8601>: ©2011 Colin Snover <http://zetafleet.com>, MIT license
     */
    parse : function(date) {
      // Match input against ISO8601 regular expression
      var captureGroups = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date);
      if(!captureGroups) {
        return Date.originalParse(date);
      }

      // Avoid invalid timestamps caused by undefined values being passed to Date.UTC
      [ 1, 4, 5, 6, 7, 10, 11 ].forEach(function(i) {
        captureGroups[i] = +captureGroups[i] || 0;
      });
      captureGroups[2] = (+captureGroups[2] || 1) - 1; // Allow undefined months
      captureGroups[3] = +captureGroups[3] || 1;// Allow undefined days

      // Handle timezone offsets
      var minutesOffset = 0;
      if(captureGroups[8] !== "Z" && captureGroups[9] !== undefined) {
        minutesOffset = captureGroups[10] * 60 + captureGroups[11];
        if(captureGroups[9] === "+") {
          minutesOffset = - minutesOffset;
        }
      }
      // Return the number of milliseconds since Epoch
      return Date.UTC(captureGroups[1], captureGroups[2], captureGroups[3], captureGroups[4], captureGroups[5] + minutesOffset, captureGroups[6], captureGroups[7]);
    }
  },

  defer : function(statics) {
    // Date.now
    if (!qx.core.Environment.get("ecmascript.date.now")) {
      Date.now = statics.now;
    }

    // Date.parse
    if (!qx.core.Environment.get("ecmascript.date.parse")) {
      Date.originalParse = Date.parse || function(date) { return NaN; };
      Date.parse = statics.parse; 
    }
  }
});
