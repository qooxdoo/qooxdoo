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

************************************************************************ */

/* ************************************************************************

#embed(qx.widgettheme/datechooser/*)

************************************************************************ */

/**
 * Shows a calendar and allows choosing a date.
 *
 * @appearance datechooser-toolbar-button {qx.ui.toolbar.Button}
 * @appearance datechooser-monthyear {qx.ui.basic.Label}
 * @appearance datechooser-weekday {qx.ui.basic.Label}
 * @appearance datechooser-datepane {qx.ui.layout.GridLayout}
 * @appearance datechooser-weekday {qx.ui.basic.Label}
 *
 * @appearance datechooser-week {qx.ui.layout.GridLayout}
 * @state header {datechooser-week}
 *
 * @appearance datechooser-day {qx.ui.basic.Label}
 * @state weekend {datechooser-day}
 * @state otherMonth {datechooser-day}
 * @state today {datechooser-day}
 * @state selected {datechooser-day}
 */
qx.Class.define("qx.ui.component.DateChooser",
{
  extend : qx.ui.layout.BoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param date {Date ? null} The initial date to show. If <code>null</code>
   *        the current day (today) is shown.
   */
  construct : function(date)
  {
    this.base(arguments);

    this.setOrientation("vertical");

    // Create the navigation bar
    var navBar = new qx.ui.layout.BoxLayout;

    navBar.set(
    {
      height  : "auto",
      spacing : 1
    });

    var lastYearBt = new qx.ui.toolbar.Button(null, "widget/datechooser/lastYear.png");
    var lastMonthBt = new qx.ui.toolbar.Button(null, "widget/datechooser/lastMonth.png");
    var monthYearLabel = new qx.ui.basic.Label;
    var nextMonthBt = new qx.ui.toolbar.Button(null, "widget/datechooser/nextMonth.png");
    var nextYearBt = new qx.ui.toolbar.Button(null, "widget/datechooser/nextYear.png");

    lastYearBt.set(
    {
      show    : 'icon',
      toolTip : new qx.ui.popup.ToolTip(this.tr("Last year")),
      spacing : 0
    });

    lastMonthBt.set(
    {
      show    : 'icon',
      toolTip : new qx.ui.popup.ToolTip(this.tr("Last month"))
    });

    nextMonthBt.set(
    {
      show    : 'icon',
      toolTip : new qx.ui.popup.ToolTip(this.tr("Next month"))
    });

    nextYearBt.set(
    {
      show    : 'icon',
      toolTip : new qx.ui.popup.ToolTip(this.tr("Next year"))
    });

    lastYearBt.setAppearance("datechooser-toolbar-button");
    lastMonthBt.setAppearance("datechooser-toolbar-button");
    nextMonthBt.setAppearance("datechooser-toolbar-button");
    nextYearBt.setAppearance("datechooser-toolbar-button");

    lastYearBt.addEventListener("click", this._onNavButtonClicked, this);
    lastMonthBt.addEventListener("click", this._onNavButtonClicked, this);
    nextMonthBt.addEventListener("click", this._onNavButtonClicked, this);
    nextYearBt.addEventListener("click", this._onNavButtonClicked, this);

    this._lastYearBt = lastYearBt;
    this._lastMonthBt = lastMonthBt;
    this._nextMonthBt = nextMonthBt;
    this._nextYearBt = nextYearBt;

    monthYearLabel.setAppearance("datechooser-monthyear");
    monthYearLabel.set({ width : "1*" });

    navBar.add(lastYearBt, lastMonthBt, monthYearLabel, nextMonthBt, nextYearBt);
    this._monthYearLabel = monthYearLabel;
    navBar.setHtmlProperty("id", "navBar");

    // Create the date pane
    var datePane = new qx.ui.layout.GridLayout;
    datePane.setAppearance("datechooser-datepane");

    datePane.set(
    {
      width  : "100%",
      height : "auto"
    });

    datePane.setColumnCount(8);
    datePane.setRowCount(7);

    for (var i=0; i<datePane.getColumnCount(); i++) {
      datePane.setColumnWidth(i, 24);
    }

    for (var i=0; i<datePane.getRowCount(); i++) {
      datePane.setRowHeight(i, 18);
    }

    // Create the weekdays
    // Add an empty label as spacer for the week numbers
    var label = new qx.ui.basic.Label;
    label.setAppearance("datechooser-week");

    label.set(
    {
      width  : "100%",
      height : "100%"
    });

    label.addState("header");
    datePane.add(label, 0, 0);

    this._weekdayLabelArr = [];

    for (var i=0; i<7; i++)
    {
      var label = new qx.ui.embed.TextEmbed;
      label.setAppearance("datechooser-weekday");
      label.setSelectable(false);
      label.setCursor("default");

      label.set(
      {
        width  : "100%",
        height : "100%"
      });

      datePane.add(label, i + 1, 0);
      this._weekdayLabelArr.push(label);
    }

    // Add the days
    this._dayLabelArr = [];
    this._weekLabelArr = [];

    for (var y=0; y<6; y++)
    {
      // Add the week label
      var label = new qx.ui.embed.TextEmbed;
      label.setAppearance("datechooser-week");
      label.setSelectable(false);
      label.setCursor("default");

      label.set(
      {
        width  : "100%",
        height : "100%"
      });

      datePane.add(label, 0, y + 1);
      this._weekLabelArr.push(label);

      // Add the day labels
      for (var x=0; x<7; x++)
      {
        var label = new qx.ui.embed.TextEmbed;
        label.setAppearance("datechooser-day");
        label.setSelectable(false);
        label.setCursor("default");

        label.set(
        {
          width  : "100%",
          height : "100%"
        });

        label.addEventListener("mousedown", this._onDayClicked, this);
        label.addEventListener("dblclick", this._onDayDblClicked, this);
        datePane.add(label, x + 1, y + 1);
        this._dayLabelArr.push(label);
      }
    }

    // Make focusable
    this.setTabIndex(1);
    this.addEventListener("keypress", this._onkeypress);

    // Show the right date
    var shownDate = (date != null) ? date : new Date();
    this.showMonth(shownDate.getMonth(), shownDate.getFullYear());

    // listen for locale changes
    qx.locale.Manager.getInstance().addEventListener("changeLocale", this._updateDatePane, this);

    // Add the main widgets
    this.add(navBar);
    this.add(datePane);

    // Initialize dimensions
    this.initWidth();
    this.initHeight();
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** Fired when a date was selected. The event holds the new selected date in its data property.*/
    "select"     : "qx.event.type.DataEvent"
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {string} The format for the date year
     * label at the top center.
     */
    MONTH_YEAR_FORMAT : qx.locale.Date.getDateTimeFormat("yyyyMMMM", "MMMM yyyy")
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
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

    /** {Date} The currently selected date. */
    date :
    {
      check : "Date",
      init : null,
      nullable : true,
      apply : "_applyDate",
      event : "changeDate",
      transform : "_checkDate"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property checker
    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {var} TODOC
     */
    _checkDate : function(value)
    {
      // Use a clone of the date internally since date instances may be changed
      return (value == null) ? null : new Date(value.getTime());
    },

    // property modifier
    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyDate : function(value, old)
    {
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
          var dayLabel = this._dayLabelArr[i];

          if (dayLabel.hasState("otherMonth"))
          {
            if (dayLabel.hasState("selected")) {
              dayLabel.removeState("selected");
            }
          }
          else
          {
            var day = parseInt(dayLabel.getText());

            if (day == newDay) {
              dayLabel.addState("selected");
            } else if (dayLabel.hasState("selected")) {
              dayLabel.removeState("selected");
            }
          }
        }
      }
    },


    /**
     * Event handler. Called when a navigation button has been clicked.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onNavButtonClicked : function(evt)
    {
      var year = this.getShownYear();
      var month = this.getShownMonth();

      switch(evt.getCurrentTarget())
      {
        case this._lastYearBt:
          year--;
          break;

        case this._lastMonthBt:
          month--;

          if (month < 0)
          {
            month = 11;
            year--;
          }

          break;

        case this._nextMonthBt:
          month++;

          if (month >= 12)
          {
            month = 0;
            year++;
          }

          break;

        case this._nextYearBt:
          year++;
          break;
      }

      this.showMonth(month, year);
    },


    /**
     * Event handler. Called when a day has been clicked.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onDayClicked : function(evt)
    {
      var time = evt.getCurrentTarget().dateTime;
      this.setDate(new Date(time));
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onDayDblClicked : function() {
      this.createDispatchDataEvent("select", this.getDate());
    },


    /**
     * Event handler. Called when a key was pressed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {boolean | void} TODOC
     */
    _onkeypress : function(evt)
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
              this.createDispatchDataEvent("select", this.getDate());
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
          if (dayIncrement != null) date.setDate(date.getDate() + dayIncrement);
          if (monthIncrement != null) date.setMonth(date.getMonth() + monthIncrement);
          if (yearIncrement != null) date.setFullYear(date.getFullYear() + yearIncrement);
        }

        this.setDate(date);
      }
    },

    // ***** Methods *****
    /**
     * Shows a certain month.
     *
     * @type member
     * @param month {Integer ? null} the month to show (0 = january). If not set the month
     *      will remain the same.
     * @param year {Integer ? null} the year to show. If not set the year will remain the
     *      same.
     * @return {void}
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
     * Updates the date pane.
     *
     * @type member
     * @return {void}
     */
    _updateDatePane : function()
    {
      var DateChooser = qx.ui.component.DateChooser;

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

      this._monthYearLabel.setText((new qx.util.format.DateFormat(DateChooser.MONTH_YEAR_FORMAT)).format(helpDate));

      // Show the day names
      var firstDayOfWeek = helpDate.getDay();
      var firstSundayInMonth = (1 + 7 - firstDayOfWeek) % 7;
      var weekDayFormat = new qx.util.format.DateFormat("EE");

      for (var i=0; i<7; i++)
      {
        var day = (i + startOfWeek) % 7;

        var dayLabel = this._weekdayLabelArr[i];

        helpDate.setDate(firstSundayInMonth + day);
        dayLabel.setText(weekDayFormat.format(helpDate));

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
        this._weekLabelArr[week].setText(weekFormat.format(helpDate));

        for (var i=0; i<7; i++)
        {
          var dayLabel = this._dayLabelArr[week * 7 + i];

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

          dayLabel.setText("" + dayOfMonth);
          dayLabel.dateTime = helpDate.getTime();

          // Go to the next day
          helpDate.setDate(helpDate.getDate() + 1);
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    qx.locale.Manager.getInstance().removeEventListener("changeLocale", this._updateDatePane, this);

    this._disposeObjects("_lastYearBt", "_lastMonthBt", "_nextMonthBt", "_nextYearBt", "_monthYearLabel");

    this._disposeObjectDeep("_weekdayLabelArr", 1);
    this._disposeObjectDeep("_dayLabelArr", 1);
    this._disposeObjectDeep("_weekLabelArr", 1);
  }
});
