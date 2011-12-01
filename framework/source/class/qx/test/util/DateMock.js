/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.util.DateMock",
{
  extend : qx.core.Object,

  construct : function(dateMap)
  {
    this.base(arguments);
    this.__date = dateMap;
  },

  members :
  {
    getFullYear : function() {
      return this.__date.fullYear;
    },

    getMonth : function() {
      return this.__date.month;
    },

    getDate : function() {
      return this.__date.date;
    },

    getDay : function() {
      return this.__date.day;
    },

    getHours : function() {
      return this.__date.hours;
    },

    getSeconds : function() {
      return this.__date.seconds;
    },

    getMinutes : function() {
      return this.__date.minutes;
    },

    getMilliseconds : function() {
      return this.__date.milliseconds;
    },

    getTimezoneOffset : function() {
      return this.__date.timezoneOffset;
    },

    getTime : function(){
      return this.__date.time;
    }
  }
});