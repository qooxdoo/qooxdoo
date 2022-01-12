/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.util.DateMock", {
  extend: qx.core.Object,

  construct(dateMap) {
    super();
    this.__date = dateMap;
  },

  members: {
    getFullYear() {
      return this.__date.fullYear;
    },

    getMonth() {
      return this.__date.month;
    },

    getDate() {
      return this.__date.date;
    },

    getDay() {
      return this.__date.day;
    },

    getHours() {
      return this.__date.hours;
    },

    getSeconds() {
      return this.__date.seconds;
    },

    getMinutes() {
      return this.__date.minutes;
    },

    getMilliseconds() {
      return this.__date.milliseconds;
    },

    getTimezoneOffset() {
      return this.__date.timezoneOffset;
    },

    getTime() {
      return this.__date.time;
    }
  }
});
