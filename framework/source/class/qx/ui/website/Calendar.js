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
 *       <td><code>qx-calendar-container</code></td>
 *       <td>Container element (<code>table</code>)</td>
 *       <td>Identifies the table container of the Calendar widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-prev</code></td>
 *       <td><code>button</code></td>
 *       <td>Identifies and styles the "previous month" button</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-prev-container</code></td>
 *       <td>Container element (<code>td</code>)</td>
 *       <td>Identifies and styles the "previous month" container</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-next</code></td>
 *       <td><code>button</code></td>
 *       <td>Identifies and styles the "next month" button</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-next-container</code></td>
 *       <td>Container element (<code>td</code>)</td>
 *       <td>Identifies and styles the "next month" container</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-othermonth</code></td>
 *       <td>Day cell (<code>td</code>)</td>
 *       <td>Identifies and styles calendar cells for days from the previous or following month</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-dayname</code></td>
 *       <td>Day name (<code>td</code>)</td>
 *       <td>Identifies and styles the day name cell</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-day</code></td>
 *       <td>Day (<code>button</code>)</td>
 *       <td>Identifies and styles the day buttons</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-weekday</code></td>
 *       <td>Day cell (<code>td</code>)</td>
 *       <td>Identifies and styles the weekday cells</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-calendar-weekend</code></td>
 *       <td>Day cell (<code>td</code>)</td>
 *       <td>Identifies and styles the weekend cells</td>
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
     * *controls*
     *
     * Template for the controls. This should be a <code>tr</code> tag containing
     * the first row of the calendar.
     *
     * Default value:
     * <pre><tr>
     *  <td colspan='1' class='{{cssPrefix}}-prev-container'><button class='{{cssPrefix}}-prev' title='Previous Month'>&lt;</button></td>
     *  <td colspan='5'>{{month}} {{year}}</td>
     *  <td colspan='1' class='{{cssPrefix}}-next-container'><button class='{{cssPrefix}}-next' title='Next Month'>&gt;</button></td>
     * </tr></pre>
     *
     *
     * *dayRow*
     *
     * Template for the row of each day. This should be a tr tag containing the day names.
     *
     * Default value:
     * <pre><tr>
     *  {{#row}}<td class='{{cssPrefix}}-dayname'>{{.}}</td>{{/row}}
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
     * <pre><table class='{{cssPrefix}}-container'><thead>{{{thead}}}</thead><tbody>{{{tbody}}}</tbody></table></pre>
     */
    _templates : {
      controls : "<tr>" +
                   "<td colspan='1' class='{{cssPrefix}}-prev-container'><button class='{{cssPrefix}}-prev' {{prevDisabled}} title='Previous Month'>&lt;</button></td>" +
                   "<td colspan='5' class='{{cssPrefix}}-month'>{{month}} {{year}}</td>" +
                   "<td colspan='1' class='{{cssPrefix}}-next-container'><button class='{{cssPrefix}}-next' {{nextDisabled}} title='Next Month'>&gt;</button></td>" +
                 "</tr>",
      dayRow : "<tr>" +
                 "{{#row}}<td class='{{cssPrefix}}-dayname'>{{.}}</td>{{/row}}" +
               "</tr>",
      row : "<tr>" +
              "{{#row}}<td class='{{cssClass}}'><button class='{{cssPrefix}}-day' {{disabled}} value='{{date}}'>{{day}}</button></td>{{/row}}" +
            "</tr>",
      table : "<table class='{{cssPrefix}}-container'><thead>{{{thead}}}</thead><tbody>{{{tbody}}}</tbody></table>"
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
     *
     * *minDate*
     *
     * Earliest user-selectable date (<code>Date</code> object). Default: <code>null</code> (no restriction).
     *
     * *maxDate*
     *
     * Latest user-selectable date (<code>Date</code> object). Default: <code>null</code> (no restriction).
     *
     * *selectableWeekDays*
     *
     * Array of user-selectable week days (Sunday is 0). Default: <code>[0, 1, 2, 3, 4, 5, 6]</code> (no restrictions).
     *
     * *selectionMode*
     *
     * The Selection mode the calendar will use. Possible values are 'single' and 'range' . Default: <code>single</code>
     */
    _config : {
      monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      dayNames : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      minDate : null,
      maxDate : null,
      selectableWeekDays : [0, 1, 2, 3, 4, 5, 6],
      selectionMode : "single"
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

      var today = new Date();
      this._normalizeDate(today);
      this._forEachElementWrapped(function(calendar) {
        calendar.showValue(today);
      });

      return true;
    },


    // overridden
    render : function() {
      var minDate = this.getConfig("minDate");
      if (minDate) {
        this._normalizeDate(minDate);
      }
      var maxDate = this.getConfig("maxDate");
      if (maxDate) {
        this._normalizeDate(maxDate);
      }
      this.showValue(this.getProperty("shownValue"));
      this.setEnabled(this.getEnabled());
      return this;
    },

    // overridden
    setEnabled: function (value) {
      var minDate = this.getConfig("minDate");
      var maxDate = this.getConfig("maxDate");
      var currentDate = null;

      this.base(arguments, value);

      if (value && (minDate || maxDate)) {
        this.find("button.qx-calendar-day").map(function (button) {
          currentDate = new Date(button.getAttribute("value"));
          button = qxWeb(button);

          // Disables a day when the current date is smaller than minDate
          if (minDate && currentDate < minDate) {
            button.setAttribute("disabled", true);
          }
          // Disables a day when it current date is greater than maxDate
          if (maxDate && currentDate > maxDate) {
            button.setAttribute("disabled", true);
          }
        });
      }

      return this;
    },


    /**
     * Sets the given date as the current value displays it
     *
     * @param value {Date|Array} Date or array of dates to be displayed.
     * @return {qx.ui.website.Calendar} The collection for chaining.
     */
    setValue : function(value) {

      var minDate = this.getConfig("minDate");
      var maxDate = this.getConfig("maxDate");

      if (this.getConfig("selectionMode") == "single") {

        this._normalizeDate(value);

        if (this.getConfig("selectableWeekDays").indexOf(value.getDay()) == -1) {
          throw new Error("The given date's week day is not selectable.");
        }

        if (minDate) {
          this._normalizeDate(minDate);
          if (value < minDate) {
            throw new Error("Given date " + value.toDateString() + " is earlier than configured minDate " + minDate.toDateString());
          }
        }

        if (maxDate) {
          this._normalizeDate(maxDate);
          if (value > maxDate) {
            throw new Error("Given date " + value.toDateString() + " is later than configured maxDate " + maxDate.toDateString());
          }
        }
      }else if (this.getConfig("selectionMode") == "range") {

        if (!this.getProperty("__range")) {
          this.setProperty("__range", value.map(function(val){ return val.toDateString(); }))
        }
        if (value.length == 2) {
          value.sort(function(a, b) {
            return a - b;
          });
          value = this._generateRange(value);
        } else {
          this._normalizeDate(value[0]);
        }

      }

      this.setProperty("value", value);
      this.showValue(value);
      if((this.getConfig("selectionMode") == "single") || ((this.getConfig("selectionMode") == "range") && (value.length >= 1))){
        this.emit("changeValue", value);
      }

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
      return value ? (qx.Bootstrap.isArray(value) ? value : new Date(value)) : null;
    },


    /**
     * Displays the given date
     *
     * @param value {Date} Date to display.
     * @return {qx.ui.website.Calendar} The collection for chaining.
     */
    showValue : function(value) {

      // If value is an array, show the last selected date
      value = qx.Bootstrap.isArray(value) ? value[value.length -1] : value;

      this.setProperty("shownValue", value);
      var cssPrefix = this.getCssPrefix();

      this._forEachElementWrapped(function(item) {
        if (item.getAttribute("tabindex") < 0) {
          item.setAttribute("tabindex", 0);
        }
        item.find("." + cssPrefix + "-prev").$offFirstCollection("tap", this._prevMonth, item);
        item.find("." + cssPrefix + "-next").$offFirstCollection("tap", this._nextMonth, item);
        item.find("." + cssPrefix + "-day").$offFirstCollection("tap", this._selectDay, item);
        item.$offFirstCollection("focus", this._onFocus, item, true)
        .$offFirstCollection("blur", this._onBlur, item, true);
      }, this);

      this.setHtml(this._getTable(value));

      this._forEachElementWrapped(function(item) {
        item.find("." + cssPrefix + "-prev").$onFirstCollection("tap", this._prevMonth, item);
        item.find("." + cssPrefix + "-next").$onFirstCollection("tap", this._nextMonth, item);
        item.find("td").not(".qx-calendar-invalid")
          .find("." + cssPrefix + "-day").$onFirstCollection("tap", this._selectDay, item);
        item.$onFirstCollection("focus", this._onFocus, item, true)
        .$onFirstCollection("blur", this._onBlur, item, true);
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
     * @param e {Event} The tap event.
     */
    _selectDay : function(e) {

      var day = qxWeb(e.getTarget());
      var newStr = day.getAttribute("value");
      var newValue = new Date(newStr);

      if (this.getConfig("selectionMode") == "range") {

        if (!this.getProperty("__range")) {
          this.setProperty("__range", []);
        }

        var range = this.getProperty("__range").slice(0);
        if (range.length == 2) {
          range = [];
        }
        range.push(newStr);

        this.setProperty("__range", range);
        range = range.map(function(item){
          return new Date(item);
        });

        this.setValue(range);
        newStr = range;

      }else{
        this.setValue(newValue);
        newStr = [newStr];
      }

      newStr.forEach(function(str){
        this.find("." + this.getCssPrefix() + "-day[value='" + str + "']").focus();
      }.bind(this));

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
        tbody: this._getWeekRows(date),
        cssPrefix: this.getCssPrefix()
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

      var prevDisabled = "";
      var minDate = this.getConfig("minDate");
      if (minDate) {
        this._normalizeDate(minDate);
        if (date.getMonth() <= minDate.getMonth()) {
          prevDisabled = "disabled";
        }
      }

      var nextDisabled = "";
      var maxDate = this.getConfig("maxDate");
      if (maxDate) {
        this._normalizeDate(maxDate);
        if (date.getMonth() >= maxDate.getMonth()) {
          nextDisabled = "disabled";
        }
      }

      return {
        month: this.getConfig("monthNames")[date.getMonth()],
        year: date.getFullYear(),
        cssPrefix : this.getCssPrefix(),
        prevDisabled : prevDisabled,
        nextDisabled : nextDisabled
      };
    },


    /**
     * Returns the week day names to be displayed in the calendar.
     *
     * @return {String[]} Array of day names.
     */
    _getDayRowData : function() {
      return {
        row: this.getConfig("dayNames"),
        cssPrefix: this.getCssPrefix()
      };
    },


    /**
     * Returns the table rows displaying the days of the month.
     *
     * @param date {Date} The date to be displayed.
     * @return {String} The table rows as an HTML string.
     */
    _getWeekRows : function(date) {

      date = qx.Bootstrap.isArray(date) ? date[date.length -1] : date;

      var weeks = [];
      var value = null, valueString = null;
      var today = new Date();
      var helpDate = this._getHelpDate(date);
      var cssPrefix = this.getCssPrefix();

      var minDate = this.getConfig("minDate");
      if (minDate) {
        this._normalizeDate(minDate);
      }

      var maxDate = this.getConfig("maxDate");
      if (maxDate) {
        this._normalizeDate(maxDate);
      }

      if (qx.Bootstrap.isArray(this.getProperty("value"))) {
        valueString = this.getProperty("value").map(function(currentDate){ return currentDate.toDateString(); });
      }

      for (var week=0; week<6; week++) {

        var data = {row: []};

        for (var i=0; i<7; i++) {
          var cssClasses = helpDate.getMonth() !== date.getMonth() ? cssPrefix + "-othermonth" : "";
          if((this.getConfig("selectionMode") == "range")  && qx.Bootstrap.isArray(this.getProperty("value"))){
            if(valueString.indexOf(helpDate.toDateString()) != -1){
              cssClasses += " "+cssPrefix + "-selected";
            }
          }else{
            var range = this.getProperty("__range");
            if (this.getProperty("value")) {
              value = this.getConfig("selectionMode") == "range" ? new Date(range[range.length - 1]) : this.getProperty("value");
              cssClasses += helpDate.toDateString() === value.toDateString() ? " " + cssPrefix + "-selected" : "";
            }
          }

          cssClasses += today.toDateString() === helpDate.toDateString() ? " " + cssPrefix + "-today" : "";

          var disabled = this.getEnabled() ? "" : "disabled";
          if ((minDate && helpDate < minDate) || (maxDate && helpDate > maxDate) ||
            this.getConfig("selectableWeekDays").indexOf(helpDate.getDay()) == -1) {
            disabled = "disabled";
          }

          cssClasses += (helpDate.getDay() === 0 || helpDate.getDay() === 6) ? " " + cssPrefix + "-weekend" : " " + cssPrefix + "-weekday";

          data.row.push({
            day: helpDate.getDate(),
            date: helpDate.toDateString(),
            cssPrefix: cssPrefix,
            cssClass: cssClasses,
            disabled: disabled
          });
          helpDate.setDate(helpDate.getDate() + 1);
        }

        weeks.push(qxWeb.template.render(this.getTemplate("row"), data));
      }

      return weeks.join("");
    },


    /**
     * Returns a date instance for the first visible day to be displayed
     *
     * @param date {Date} Current date
     * @return {Date} Helper date
     */
    _getHelpDate : function(date) {
      var startOfWeek = 1; //TODO: config option
      var helpDate = new Date(date.getFullYear(), date.getMonth(), 1);

      var firstDayOfWeek = helpDate.getDay();

      helpDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
      var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
      helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);

      return helpDate;
    },


    /**
     * Sets the hours, minutes and seconds of a date object to 0
     * to facilitate date comparisons.
     *
     * @param date {Date} Date to normalize
     */
    _normalizeDate : function(date) {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
    },


    /**
     * Attaches the keydown listener.
     *
     * @param e {Event} focus event
     */
    _onFocus : function(e) {
      this.$onFirstCollection("keydown", this._onKeyDown, this);
    },


    /**
     * Removes the keydown listener if the focus moves outside of the calendar.
     *
     * @param e {Event} blur event
     */
    _onBlur : function(e) {
      if (this.contains(e.getRelatedTarget()).length === 0) {
        this.$offFirstCollection("keydown", this._onKeyDown, this);
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

    /**
    * Generates a date list depending on the given range
    *
    * @param range {Array} Array containing the start and end values on the range
    * @return {Array} Array with all the date objects contained in the given range
    */
    _generateRange : function(range) {

      var list = [], current = range[0];

      var minDate = this.getConfig("minDate") ? this.getConfig("minDate") : new Date(range[0].toDateString());
      var maxDate = this.getConfig("maxDate") ? this.getConfig("maxDate") : new Date(range[1].toDateString());

      this._normalizeDate(minDate);
      this._normalizeDate(maxDate);

      while(current <= range[1]){
        this._normalizeDate(current)
        list.push(new Date(current.toDateString()));
        current.setDate(current.getDate() + 1);
      }

      // Removing non selectable days
      list = list.filter(function(date){
        return this.getConfig("selectableWeekDays").indexOf(date.getDay()) != -1;
      }, this);

      if(list.length == 0){
        throw new Error("Given date range is not valid. Please verify the 'selectableWeekDays' config");
      }

      // Removing days out of defined min/max range
      list = list.filter(function(date){
       return (date >= minDate) && (date <= maxDate);
      }, this);

      if(list.length == 0){
        throw new Error("Given date range is not valid. Please verify the 'minDate' and 'maxDate' configs");
      }

      return list;
    },


    dispose : function() {
      var cssPrefix = this.getCssPrefix();
      this._forEachElementWrapped(function(item) {
        item.find("." + cssPrefix + "-prev").$offFirstCollection("tap", this._prevMonth, item);
        item.find("." + cssPrefix + "-next").$offFirstCollection("tap", this._nextMonth, item);
        item.find("." + cssPrefix + "-day").$offFirstCollection("tap", this._selectDay, item);
        item.$offFirstCollection("focus", this._onFocus, item, true)
        .$offFirstCollection("blur", this._onBlur, item, true)
        .$offFirstCollection("keydown", this._onKeyDown, item);
      }, this);

      this.setHtml("");

      return this.base(arguments);
    }

  },


  defer : function(statics) {
    qxWeb.$attach({calendar : statics.calendar});
  }
});
