/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This is a calendar widget used to select a date. It contain a set of
 * buttons to switch to the next or previous month as well as a button for
 * each day in the month.
 *
 * <h2>CSS Classes</h2>
 * <table>
 *   <thead>
 *     <tr>
 *       <td>Class Name</td>
 *       <td>Applied to</td>
 *       <td>Description</td>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td><code>qx-calendar</code></td>
 *       <td>Container element</td>
 *       <td>Identifies the Calendar widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-prev</code></td>
 *       <td><code>button</code></td>
 *       <td>Identifies and styles the "previous month" button</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-next</code></td>
 *       <td><code>button</code></td>
 *       <td>Identifies and styles the "next month" button</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-othermonth</code></td>
 *       <td>Day cell (<code>td</code>)</td>
 *       <td>Identifies and styles calendar cells for days from the previous or following month</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-day</code></td>
 *       <td>Day (<code>button</code>)</td>
 *       <td>Identifies and styles the day buttons</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-selected</code></td>
 *       <td>Day cell (<code>td</code>)</td>
 *       <td>Identifies and styles the cell containing the selected day's button</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * <h2 class="widget-markup">Generated DOM Structure</h2>
 *
 * @require(qx.module.Template)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Calendar", {
  extend : qx.ui.website.Widget,

  statics : {
    /**
     * *control*
     *
     * Template for the controls. This should be a <code>tr</code> tag containing
     * the first row of the calendar.
     *
     * Default value:
     * <pre><tr>
     *  <td colspan='1'><button class='{{cssPrefix}}-prev' title='Previous Month'>&lt;</button></td>
     *  <td colspan='5'>{{month}} {{year}}</td>
     *  <td colspan='1'><button class='{{cssPrefix}}-next' title='Next Month'>&gt;</button></td>
     * </tr></pre>
     *
     *
     * *dayRow*
     *
     * Template for the row of each day. This should be a tr tag containing the day names.
     *
     * Default value:
     * <pre><tr>
     *  {{#row}}<td>{{.}}</td>{{/row}}
     * </tr></pre>
     *
     *
     * *row*
     *
     * Template for the row of days. This should be a <code>tr</code> tag containing
     * a <code>button</code> for each day.
     *
     * Default value:
     * <pre><tr>
     *   {{#row}}<td class='{{cssClass}}'>
     *     <button class='{{cssPrefix}}-day' value='{{date}}'>{{day}}</button>
     *   </td>{{/row}}
     * </tr></pre>
     *
     *
     * *table*
     *
     * Wrapper template for all other templates. This should be a table.
     *
     * Default value:
     * <pre><table><thead>{{{thead}}}</thead><tbody>{{{tbody}}}</tbody></table></pre>
     */
    _templates : {
      controls : "<tr>" +
                   "<td colspan='1'><button class='{{cssPrefix}}-prev' title='Previous Month'>&lt;</button></td>" +
                   "<td colspan='5'>{{month}} {{year}}</td>" +
                   "<td colspan='1'><button class='{{cssPrefix}}-next' title='Next Month'>&gt;</button></td>" +
                 "</tr>",
      dayRow : "<tr>" +
                 "{{#row}}<td>{{.}}</td>{{/row}}" +
               "</tr>",
      row : "<tr>" +
              "{{#row}}<td class='{{cssClass}}'><button class='{{cssPrefix}}-day' value='{{date}}'>{{day}}</button></td>{{/row}}" +
            "</tr>",
      table : "<table><thead>{{{thead}}}</thead><tbody>{{{tbody}}}</tbody></table>"
    },


    /**
     * *monthNames*
     *
     * Array of strings containing the names of the month.
     *
     * Default value:
     * <pre>["January", "February", "March", "April", "May", "June",
     *  "July", "August", "September", "October", "November", "December"]</pre>
     *
     *
     * *dayNames*
     *
     * Array of strings containing the day names.
     *
     * Default values:
     * <pre>["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]</pre>
     */
    _config : {
      monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayNames : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },


    /**
     * Factory method which converts the current collection into a collection of
     * Calendar widgets. Therefore, an initialization process needs to be done which
     * can be configured with some parameter.
     *
     * @param date {Date?null} The initial Date of the calendar.
     * @return {qx.ui.website.Calendar} A new calendar collection.
     * @attach {qxWeb}
     */
    calendar : function(date) {
      var calendar =  new qx.ui.website.Calendar(this);
      calendar.init();

      if (date !== undefined) {
        calendar.setValue(date);
      }

      return calendar;
    }
  },


  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },


  events : {
    /** Fired at each value change */
    "changeValue" : "Date"
  },


  members : {

    // overridden
    init : function() {
      if (!this.base(arguments)) {
        return false;
      }

      this._forEachElementWrapped(function(calendar) {
        calendar.showValue(new Date());
      });

      return true;
    },


    // overridden
    render : function() {
      this.showValue(this.getProperty("shownValue"));
      return this;
    },


    /**
     * Sets the given date as the current value displays it
     *
     * @param value {Date} Date to display.
     * @return {qx.ui.website.Calendar} The collection for chaining.
     */
    setValue : function(value) {
      this.setProperty("value", value);
      this.showValue(value);
      this.emit("changeValue", value);
      return this;
    },


    /**
     * Returns the currently selected date of the first
     * calendar widget in the collection.
     *
     * @return {qx.ui.website.Calendar} The collection for chaining.
     */
    getValue : function() {
      var value = this.getProperty("value");
      return value ? new Date(value) : null;
    },


    /**
     * Displays the given date
     *
     * @param value {Date} Date to display.
     * @return {qx.ui.website.Calendar} The collection for chaining.
     */
    showValue : function(value) {
      this.setProperty("shownValue", value);
      var cssPrefix = this.getCssPrefix();

      this._forEachElementWrapped(function(item) {
        if (item.getAttribute("tabindex") < 0) {
          item.setAttribute("tabindex", 0);
        }
        item.find("." + cssPrefix + "-prev").offWidget("click", this._prevMonth, item);
        item.find("." + cssPrefix + "-next").offWidget("click", this._nextMonth, item);
        item.find("." + cssPrefix + "-day").offWidget("click", this._selectDay, item);
        item.offWidget("focus", this._onFocus, item, true)
        .offWidget("blur", this._onBlur, item, true);
      }, this);

      this.setHtml(this._getTable(value));

      this._forEachElementWrapped(function(item) {
        item.find("." + cssPrefix + "-prev").onWidget("click", this._prevMonth, item);
        item.find("." + cssPrefix + "-next").onWidget("click", this._nextMonth, item);
        item.find("." + cssPrefix + "-day").onWidget("click", this._selectDay, item);
        item.onWidget("focus", this._onFocus, item, true)
        .onWidget("blur", this._onBlur, item, true);
      }, this);

      return this;
    },


    /**
     * Displays the previous month
     */
    _prevMonth : function() {
      var shownValue = this.getProperty("shownValue");
      this.showValue(new Date(shownValue.getFullYear(), shownValue.getMonth() - 1));
    },


    /**
     * Displays the next month
     */
    _nextMonth : function() {
      var shownValue = this.getProperty("shownValue");
      this.showValue(new Date(shownValue.getFullYear(), shownValue.getMonth() + 1));
    },


    /**
     * Sets the current value to the day selected by the user
     * @param e {Event} The native click event.
     */
    _selectDay : function(e) {
      var day = qxWeb(e.getTarget());
      var newStr = day.getAttribute("value");
      var newValue = new Date(newStr);
      this.setValue(newValue);
      this.find("." + this.getCssPrefix() + "-day[value='" + newStr + "']").focus();
    },


    /**
     * Renders the calendar for the given date.
     *
     * @param date {Date} The date to render.
     * @return {String} The calendar HTML.
     */
    _getTable : function(date) {
      var controls = qxWeb.template.render(this.getTemplate("controls"), this._getControlsData(date));
      var dayRow = qxWeb.template.render(this.getTemplate("dayRow"), this._getDayRowData());

      var data = {
        thead: controls + dayRow,
        tbody: this._getWeekRows(date)
      };

      return qxWeb.template.render(this.getTemplate("table"), data);
    },


    /**
     * Returns the month and year to be displayed in the calendar controls.
     *
     * @param date {Date} The date to be displayed.
     * @return {Map} A map containing the month and year.
     */
    _getControlsData : function(date) {
      return {
        month: this.getConfig("monthNames")[date.getMonth()],
        year: date.getFullYear(),
        cssPrefix : this.getCssPrefix()
      };
    },


    /**
     * Returns the week day names to be displayed in the calendar.
     *
     * @return {String[]} Array of day names.
     */
    _getDayRowData : function() {
      return {
        row: this.getConfig("dayNames")
      };
    },


    /**
     * Returns the table rows displaying the days of the month.
     *
     * @param date {Date} The date to be displayed.
     * @return {String} The table rows as an HTML string.
     */
    _getWeekRows : function(date) {
      var weeks = [];
      var startOfWeek = 1;

      var cssPrefix = this.getCssPrefix();

      var helpDate = new Date(date.getFullYear(), date.getMonth(), 1);

      var firstDayOfWeek = helpDate.getDay();
      var today = new Date();

      helpDate = new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
      var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
      helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);

      var cssPrefix = this.getCssPrefix();
      for (var week=0; week<6; week++) {
        var data = {row: []};

        for (var i=0; i<7; i++) {
          var cssClasses = helpDate.getMonth() !== date.getMonth() ? cssPrefix + "-othermonth" : "";
          if (this.getProperty("value")) {
            cssClasses += helpDate.toDateString() === this.getProperty("value").toDateString() ? " " + cssPrefix + "-selected" : "";
          }
          cssClasses += today.toDateString() === helpDate.toDateString() ? " " + cssPrefix + "-today" : "";

          data.row.push({
            day: helpDate.getDate(),
            date: helpDate.toDateString(),
            cssPrefix: cssPrefix,
            cssClass: cssClasses
          });
          helpDate.setDate(helpDate.getDate() + 1);
        }

        weeks.push(qxWeb.template.render(this.getTemplate("row"), data));
      }

      return weeks.join("");
    },


    /**
     * Attaches the keydown listener.
     *
     * @param e {Event} focus event
     */
    _onFocus : function(e) {
      this.onWidget("keydown", this._onKeyDown, this);
    },


    /**
     * Removes the keydown listener if the focus moves outside of the calendar.
     *
     * @param e {Event} blur event
     */
    _onBlur : function(e) {
      if (this.contains(e.getRelatedTarget()).length === 0) {
        this.offWidget("keydown", this._onKeyDown, this);
      }
    },


    /**
     * Keyboard handling.
     *
     * @param e {Event} The keydown event.
     */
    _onKeyDown : function(e) {
      var cssPrefix = this.getCssPrefix();
      var target = qxWeb(e.getTarget());
      var key = e.getKeyIdentifier();
      var isDayButton = target.hasClass(cssPrefix + "-day");

      if (isDayButton) {
        if (key == "Space") {
          this._selectDay(e);
        }
        else if (key == "Right") {
          e.preventDefault();
          this._focusNextDay(target);
        }
        else if (key == "Left") {
          e.preventDefault();
          this._focusPrevDay(target);
        }
      } else {
        if (key == "Space") {
          if (target.hasClass(cssPrefix + "-prev")) {
            e.preventDefault();
            this._prevMonth();
            this.find("." + cssPrefix + "-prev").focus();
          } else if (target.hasClass(cssPrefix + "-next")) {
            e.preventDefault();
            this._nextMonth();
            this.find("." + cssPrefix + "-next").focus();
          }
        } else if (key == "Right") {
          e.preventDefault();
          this._nextMonth();
          this.find("." + cssPrefix + "-next").focus();
        } else if (key == "Left") {
          e.preventDefault();
          this._prevMonth();
          this.find("." + cssPrefix + "-prev").focus();
        }
      }

      e.stopPropagation();
    },


    /**
     * Focuses the day button following the given one.
     *
     * @param currentDay {qxWeb} The button for the current day.
     */
    _focusNextDay : function(currentDay) {
      var cssPrefix = this.getCssPrefix();
      var nextDayInWeek = currentDay.getParents().getNext();
      if (nextDayInWeek.length > 0) {
        nextDayInWeek.getChildren("." + cssPrefix + "-day").focus();
      } else {
        var nextWeekRow = currentDay.getParents().getParents().getNext();
        if (nextWeekRow.length > 0) {
          nextWeekRow.find("> td > ." + cssPrefix + "-day").getFirst().focus();
        } else {
          this._nextMonth();
          var oldDate = new Date(currentDay.getAttribute("value"));
          var newDate = new Date(oldDate.valueOf());
          newDate.setDate(oldDate.getDate() + 1);
          var buttonVal = newDate.toDateString();
          this.find("." + cssPrefix + "-day[value='" + buttonVal + "']").focus();
        }
      }
    },


    /**
     * Focuses the day button preceding the given one.
     *
     * @param currentDay {qxWeb} The button for the current day.
     */
    _focusPrevDay : function(currentDay) {
      var cssPrefix = this.getCssPrefix();
      var prevDayInWeek = currentDay.getParents().getPrev();
      if (prevDayInWeek.length > 0) {
        prevDayInWeek.getChildren("." + cssPrefix + "-day").focus();
      } else {
        var prevWeekRow = currentDay.getParents().getParents().getPrev();
        if (prevWeekRow.length > 0) {
          prevWeekRow.find("> td > ." + cssPrefix + "-day").getLast().focus();
        } else {
          this._prevMonth();
          var oldDate = new Date(currentDay.getAttribute("value"));
          var newDate = new Date(oldDate.valueOf());
          newDate.setDate(oldDate.getDate() - 1);
          var buttonVal = newDate.toDateString();
          this.find("." + cssPrefix + "-day[value='" + buttonVal + "']").focus();
        }
      }
    },


    dispose : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(item) {
        item.find("." + cssPrefix + "-prev").offWidget("click", this._prevMonth, item);
        item.find("." + cssPrefix + "-next").offWidget("click", this._nextMonth, item);
        item.find("." + cssPrefix + "-day").offWidget("click", this._selectDay, item);
        item.offWidget("focus", this._onFocus, item, true)
        .offWidget("blur", this._onBlur, item, true)
        .offWidget("keydown", this._onKeyDown, item);
      }, this);

      this.setHtml("");

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({calendar : statics.calendar});
  }
});
