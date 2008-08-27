/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * A *date chooser* is a small calendar including a navigation bar to switch the shown
 * month. It includes a column for the calendar week and shows one month. Selecting
 * a date is as easy as clicking on it.
 *
 * To be conform with all form widgets, the {@link qx.ui.form.IFormElement} interface
 * is implemented.
 *
 * The following example creates and adds a date chooser to the root element.
 * A listener alerts the user if a new date is selected.
 *
 * <pre>
 * var chooser = new qx.ui.control.DateChooser();
 * this.getRoot().add(chooser, { left : 20, top: 20});
 *
 * chooser.addListener("changeValue", function(e) {
 *   alert(e.getData());
 * });
 * </pre>
 *
 * Additionally to a selection event a execute event is available which is
 * fired by doubleclick or taping the space / enter key. With this event you
 * can for example save the selection and close the date chooser.
 */
qx.Class.define("qx.ui.control.DateChooser",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MExecutable,
  implement : qx.ui.form.IFormElement,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param date {Date ? null} The initial date to show. If <code>null</code>
   * the current day (today) is shown.
   */
  construct : function(date)
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.VBox();
    this._setLayout(layout);

    // create the child controls
    this._createChildControl("navigation-bar");
    this._createChildControl("date-pane");

    // Support for key events
    this.addListener("keypress", this._onKeyPress);

    // Show the right date
    var shownDate = (date != null) ? date : new Date();
    this.showMonth(shownDate.getMonth(), shownDate.getFullYear());

    // listen for locale changes
    if (qx.core.Variant.isSet("qx.dynamicLocaleSwitch", "on")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._updateDatePane, this);
    }

    // register mouse up and down handler
    this.addListener("mousedown", this._onMouseUpDown, this);
    this.addListener("mouseup", this._onMouseUpDown, this);
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {string} The format for the date year label at the top center.
     */
    MONTH_YEAR_FORMAT : qx.locale.Date.getDateTimeFormat("yyyyMMMM", "MMMM yyyy")
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the value was modified */
    changeValue : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init   : "datechooser"
    },

    // overrridden
    width :
    {
      refine : true,
      init : 200
    },

    // overridden
    height :
    {
      refine : true,
      init : 150
    },

    /** The currently shown month. 0 = january, 1 = february, and so on. */
    shownMonth :
    {
      check : "Integer",
      init : null,
      nullable : true,
      event : "changeShownMonth"
    },

    /** The currently shown year. */
    shownYear :
    {
      check : "Integer",
      init : null,
      nullable : true,
      event : "changeShownYear"
    },

    /** The currently selected date. */
    date :
    {
      check : "Date",
      init : null,
      nullable : true,
      apply : "_applyDate",
      event : "changeDate"
    },

    /** The name of the widget. Mainly used for serialization proposes. */
    name :
    {
      check : "String",
      nullable : true,
      event : "changeName"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __weekdayLabelArr : null,
    __dayLabelArr : null,
    __weekLabelArr : null,




    /*
    ---------------------------------------------------------------------------
      FORM API IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the element's string value. The String should by excepted by the
     * JavaScript Date-Object.
     *
     * @param value {String} The new date value as a JavaScript confrom date string.
     * @return {String} the value
     */
    setValue : function(value)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assertType(value, "string");
      }

      this.setDate(new Date(value));
      return value;
    },


    /**
     * The element's user set value (date) as a String.
     *
     * @return {String} The current set date.
     */
    getValue : function() {
      return this.getDate().toString();
    },




    /*
    ---------------------------------------------------------------------------
      WIDGET INTERNALS
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        // NAVIGATION BAR STUFF
        case "navigation-bar":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox());

          // Add the navigation bar elements
          control.add(this._getChildControl("last-year-button"));
          control.add(this._getChildControl("last-month-button"));
          control.add(this._getChildControl("month-year-label"), {flex: 1});
          control.add(this._getChildControl("next-month-button"));
          control.add(this._getChildControl("next-year-button"));

          this._add(control);
          break;

        case "last-year-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Last year"));
          break;

        case "last-year-button":
          control = new qx.ui.form.Button();
          control.addState("lastYear");
          control.setFocusable(false);
          control.setToolTip(this._getChildControl("last-year-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "last-month-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Last month"));
          break;

        case "last-month-button":
          control = new qx.ui.toolbar.Button();
          control.addState("lastMonth");
          control.setFocusable(false);
          control.setToolTip(this._getChildControl("last-month-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "next-month-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Next month"));
          break;

        case "next-month-button":
          control = new qx.ui.toolbar.Button();
          control.addState("nextMonth");
          control.setFocusable(false);
          control.setToolTip(this._getChildControl("next-month-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "next-year-button-tooltip":
          control = new qx.ui.tooltip.ToolTip(this.tr("Next year"));
          break;

        case "next-year-button":
          control = new qx.ui.toolbar.Button();
          control.addState("nextYear");
          control.setFocusable(false);
          control.setToolTip(this._getChildControl("next-year-button-tooltip"));
          control.addListener("click", this._onNavButtonClicked, this);
          break;

        case "month-year-label":
          control = new qx.ui.basic.Label();
          control.setAllowGrowX(true);
          control.setAnonymous(true);
          break;


        // DATE PANE STUFF
        case "date-pane":
          var controlLayout = new qx.ui.layout.Grid()
          control = new qx.ui.container.Composite(controlLayout);

          for (var i = 0; i < 8; i++) {
            // controlLayout.setColumnWidth(i, 24);
            controlLayout.setColumnFlex(i, 1);
          }

          for (var i = 0; i < 7; i++) {
            controlLayout.setRowFlex(i, 1);
            // controlLayout.setRowHeight(i, 18);
          }

          // Create the weekdays
          // Add an empty label as spacer for the week numbers
          var label = new qx.ui.basic.Label();
          label.setAllowGrowX(true);
          label.setAppearance("datechooser-week");
          label.setAnonymous(true);
          label.addState("header");
          control.add(label, {column: 0, row: 0});

          this.__weekdayLabelArr = [];

          for (var i=0; i<7; i++)
          {
            var label = new qx.ui.basic.Label();
            label.setAllowGrowX(true);
            label.setAllowGrowY(true);
            label.setAppearance("datechooser-weekday");
            label.setSelectable(false);
            label.setAnonymous(true);
            label.setCursor("default");

            control.add(label, {column: i + 1, row: 0});
            this.__weekdayLabelArr.push(label);
          }

          // Add the days
          this.__dayLabelArr = [];
          this.__weekLabelArr = [];

          for (var y = 0; y < 6; y++)
          {
            // Add the week label
            var label = new qx.ui.basic.Label();
            label.setAllowGrowX(true);
            label.setAllowGrowY(true);
            label.setAppearance("datechooser-week");
            label.setAnonymous(true);
            label.setCursor("default");

            control.add(label, {column: 0, row: y + 1});
            this.__weekLabelArr.push(label);

            // Add the day labels
            for (var x = 0; x < 7; x++)
            {
              var label = new qx.ui.basic.Label();
              label.setAllowGrowX(true);
              label.setAllowGrowY(true);
              label.setAppearance("datechooser-day");
              label.setCursor("default");

              label.addListener("mousedown", this._onDayClicked, this);
              label.addListener("dblclick", this._onDayDblClicked, this);
              control.add(label, {column:x + 1, row:y + 1});
              this.__dayLabelArr.push(label);
            }
          }

          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },


    // apply methods
    _applyDate : function(value, old)
    {
      // fire the changeValue event
      this.fireDataEvent("changeValue", value == null ? "" : value.toString());

      if ((value != null) && (this.getShownMonth() != value.getMonth() || this.getShownYear() != value.getFullYear()))
      {
        // The new date is in another month -> Show that month
        this.showMonth(value.getMonth(), value.getFullYear());
      }
      else
      {
        // The new date is in the current month -> Just change the states
        var newDay = (value == null) ? -1 : value.getDate();

        for (var i=0; i<6*7; i++)
        {
          var dayLabel = this.__dayLabelArr[i];

          if (dayLabel.hasState("otherMonth"))
          {
            if (dayLabel.hasState("selected")) {
              dayLabel.removeState("selected");
            }
          }
          else
          {
            var day = parseInt(dayLabel.getContent());

            if (day == newDay) {
              dayLabel.addState("selected");
            } else if (dayLabel.hasState("selected")) {
              dayLabel.removeState("selected");
            }
          }
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Hendler which stops the propagation of the click event if
     * the Navigation bar or kalender headers will be clicked.
     *
     * @param e {qx.event.type.Mouse} The mouse up / down event
     */
    _onMouseUpDown : function(e) {
      var target = e.getTarget();

      if (target == this._getChildControl("navigation-bar") ||
          target == this._getChildControl("date-pane")) {
        e.stopPropagation();
        return;
      }
    },


    /**
     * Event handler. Called when a navigation button has been clicked.
     *
     * @param evt {qx.event.type.Data} The data event.
     */
    _onNavButtonClicked : function(evt)
    {
      var year = this.getShownYear();
      var month = this.getShownMonth();

      switch(evt.getCurrentTarget())
      {
        case this._getChildControl("last-year-button"):
          year--;
          break;

        case this._getChildControl("last-month-button"):
          month--;

          if (month < 0)
          {
            month = 11;
            year--;
          }

          break;

        case this._getChildControl("next-month-button"):
          month++;

          if (month >= 12)
          {
            month = 0;
            year++;
          }

          break;

        case this._getChildControl("next-year-button"):
          year++;
          break;
      }

      this.showMonth(month, year);
    },


    /**
     * Event handler. Called when a day has been clicked.
     *
     * @param evt {qx.event.type.Data} The event.
     */
    _onDayClicked : function(evt)
    {
      var time = evt.getCurrentTarget().dateTime;
      this.setDate(new Date(time));
    },


    /**
     * Event handler. Called when a day has been double-clicked.
     */
    _onDayDblClicked : function() {
      this.execute();
    },


    /**
     * Event handler. Called when a key was pressed.
     *
     * @param evt {qx.event.type.Data} The event.
     */
    _onKeyPress : function(evt)
    {
      var dayIncrement = null;
      var monthIncrement = null;
      var yearIncrement = null;

      if (evt.getModifiers() == 0)
      {
        switch(evt.getKeyIdentifier())
        {
          case "Left":
            dayIncrement = -1;
            break;

          case "Right":
            dayIncrement = 1;
            break;

          case "Up":
            dayIncrement = -7;
            break;

          case "Down":
            dayIncrement = 7;
            break;

          case "PageUp":
            monthIncrement = -1;
            break;

          case "PageDown":
            monthIncrement = 1;
            break;

          case "Escape":
            if (this.getDate() != null)
            {
              this.setDate(null);
              return true;
            }

            break;

          case "Enter":
          case "Space":
            if (this.getDate() != null) {
              this.execute();
            }

            return;
        }
      }
      else if (evt.isShiftPressed())
      {
        switch(evt.getKeyIdentifier())
        {
          case "PageUp":
            yearIncrement = -1;
            break;

          case "PageDown":
            yearIncrement = 1;
            break;
        }
      }

      if (dayIncrement != null || monthIncrement != null || yearIncrement != null)
      {
        var date = this.getDate();

        if (date != null) {
          date = new Date(date.getTime()); // TODO: Do cloning in getter
        }

        if (date == null) {
          date = new Date();
        }
        else
        {
          if (dayIncrement != null){date.setDate(date.getDate() + dayIncrement);}
          if (monthIncrement != null){date.setMonth(date.getMonth() + monthIncrement);}
          if (yearIncrement != null){date.setFullYear(date.getFullYear() + yearIncrement);}
        }

        this.setDate(date);
      }
    },


    /**
     * Shows a certain month.
     *
     * @param month {Integer ? null} the month to show (0 = january). If not set
     *      the month will remain the same.
     * @param year {Integer ? null} the year to show. If not set the year will
     *      remain the same.
     */
    showMonth : function(month, year)
    {
      if ((month != null && month != this.getShownMonth()) || (year != null && year != this.getShownYear()))
      {
        if (month != null) {
          this.setShownMonth(month);
        }

        if (year != null) {
          this.setShownYear(year);
        }

        this._updateDatePane();
      }
    },


    /**
     * Event handler. Used to handle the key events.
     *
     * @param e {qx.event.type.Data} The event.
     */
    handleKeyPress : function(e) {
      this._onKeyPress(e);
    },


    /**
     * Updates the date pane.
     */
    _updateDatePane : function()
    {
      var DateChooser = qx.ui.control.DateChooser;

      var today = new Date();
      var todayYear = today.getFullYear();
      var todayMonth = today.getMonth();
      var todayDayOfMonth = today.getDate();

      var selDate = this.getDate();
      var selYear = (selDate == null) ? -1 : selDate.getFullYear();
      var selMonth = (selDate == null) ? -1 : selDate.getMonth();
      var selDayOfMonth = (selDate == null) ? -1 : selDate.getDate();

      var shownMonth = this.getShownMonth();
      var shownYear = this.getShownYear();

      var startOfWeek = qx.locale.Date.getWeekStart();

      // Create a help date that points to the first of the current month
      var helpDate = new Date(this.getShownYear(), this.getShownMonth(), 1);

      var monthYearFormat = new qx.util.format.DateFormat(DateChooser.MONTH_YEAR_FORMAT);
      this._getChildControl("month-year-label").setContent(monthYearFormat.format(helpDate));

      // Show the day names
      var firstDayOfWeek = helpDate.getDay();
      var firstSundayInMonth = (1 + 7 - firstDayOfWeek) % 7;
      var weekDayFormat = new qx.util.format.DateFormat("EE");

      for (var i=0; i<7; i++)
      {
        var day = (i + startOfWeek) % 7;

        var dayLabel = this.__weekdayLabelArr[i];

        helpDate.setDate(firstSundayInMonth + day);
        dayLabel.setContent(weekDayFormat.format(helpDate));

        if (qx.locale.Date.isWeekend(day)) {
          dayLabel.addState("weekend");
        } else {
          dayLabel.removeState("weekend");
        }
      }

      // Show the days
      helpDate = new Date(shownYear, shownMonth, 1);
      var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
      helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);

      var weekFormat = new qx.util.format.DateFormat("ww");

      for (var week=0; week<6; week++)
      {
        this.__weekLabelArr[week].setContent(weekFormat.format(helpDate));

        for (var i=0; i<7; i++)
        {
          var dayLabel = this.__dayLabelArr[week * 7 + i];

          var year = helpDate.getFullYear();
          var month = helpDate.getMonth();
          var dayOfMonth = helpDate.getDate();

          var isSelectedDate = (selYear == year && selMonth == month && selDayOfMonth == dayOfMonth);

          if (isSelectedDate) {
            dayLabel.addState("selected");
          } else {
            dayLabel.removeState("selected");
          }

          if (month != shownMonth) {
            dayLabel.addState("otherMonth");
          } else {
            dayLabel.removeState("otherMonth");
          }

          var isToday = (year == todayYear && month == todayMonth && dayOfMonth == todayDayOfMonth);

          if (isToday) {
            dayLabel.addState("today");
          } else {
            dayLabel.removeState("today");
          }

          dayLabel.setContent("" + dayOfMonth);
          dayLabel.dateTime = helpDate.getTime();

          // Go to the next day
          helpDate.setDate(helpDate.getDate() + 1);
        }
      }

      monthYearFormat.dispose();
      weekDayFormat.dispose();
      weekFormat.dispose();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (qx.core.Variant.isSet("qx.dynamicLocaleSwitch", "on")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._updateDatePane, this);
    }

    this._disposeArray("__weekdayLabelArr", 1);
    this._disposeArray("__dayLabelArr", 1);
    this._disposeArray("__weekLabelArr", 1);
  }
});
