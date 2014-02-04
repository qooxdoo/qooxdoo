/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * This is a date picker widget used to combine an input element with a calendar widget
 * to select a date. The calendar itself is opened as popup to save visual space.
 *
 * @require(qx.module.Template)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.DatePicker", {
  extend : qx.ui.website.Widget,

  statics : {
    /**
     * *format*
     *
     * Function which is provided with a JavaScript Date object instance. You can provide
     * an own format function to manipulate the value which is set to the associated input element.
     *
     * Default value:
     * <pre>function(date) {
        return date.toLocaleDateString();
      }</pre>
     */
    _config : {
      format : function(date) {
        return date.toLocaleDateString();
      }
    },

    /**
     * Factory method which converts the current collection into a collection of
     * Date Picker widgets. Therefore, an initialization process needs to be done which
     * can be configured with some parameter.
     *
     * @param date {Date?null} The initial Date of the calendar.
     * @return {qx.ui.website.DatePicker} A new date picker collection.
     * @attach {qxWeb}
     */
    datepicker : function(date) {
      var datepicker =  new qx.ui.website.DatePicker(this);
      datepicker.init(date);

      return datepicker;
    }
  },

  construct : function(selector, context) {
    this.base(arguments, selector, context);
  },

  members : {

    /**
     * Get the associated calendar widget
     * @return {qx.ui.website.Calendar} calendar widget instance
     */
    getCalendar : function() {
      var calendarCollection = qxWeb();
      this._forEachElementWrapped(function(datepicker) {
        calendarCollection = calendarCollection.concat(qxWeb('div#datepicker-' + datepicker.getData('qx-calendar-id')));
      });

      return calendarCollection;
    },

    // overridden
    init : function(date) {
      if (!this.base(arguments)) {
        return false;
      }

      // all connected input elements can be set to 'readonly'
      this.setAttribute('readonly', 'readonly');

      this._forEachElementWrapped(function(datepicker) {
        var uniqueId = Math.round(Math.random() * 10000);
        var calendar = qxWeb.create('<div id="datepicker-' + uniqueId + '"></div>').calendar();
        calendar.appendTo(document.body).hide();

        // create the connection between the date picker and the corresponding calendar widget
        datepicker.setData('qx-calendar-id', uniqueId);

        // click listener to open / hide calendar
        datepicker.on('click', datepicker._onClick);

        var bodyElement = qxWeb.getDocument(datepicker).body;
        qxWeb(bodyElement).on('click', datepicker._onBodyClick, datepicker, true);

        // react on date selection
        calendar.on('changeValue', this._calendarChangeValue, datepicker);

        if (date !== undefined) {
          calendar.setValue(date);
        }
      });

      return true;
    },

    // overridden
    render : function() {
      this.getCalendar().render();
      return this;
    },

    /**
     * Listener which handles clicks on the associated input element and
     * opens / hides the calendar.
     *
     * @param e {Event} Native click event
     */
    _onClick : function(e) {
      var calendar = qxWeb('div#datepicker-' + this.getData('qx-calendar-id'));
      calendar.isRendered() ? this.getCalendar().hide() :
                              this.getCalendar().show().placeTo(this, 'bottom-left');

      e.stopPropagation();
    },

    /**
     * Listener to the body element to be able to hide the calendar if the user clicks
     * outside the calendar.
     *
     * @param e {Event} native click event
     */
    _onBodyClick : function(e) {
      // only check for this if the calendar is actually open
      if (this.getCalendar().isRendered()) {
        var clickedCol = qxWeb(e.getTarget());

        if (clickedCol.isChildOf(this.getCalendar()) === false) {
          this.getCalendar().hide();
        }
      }
    },

    /**
     * Listens to value selection of the calendar, Whenever the user selected a day
     * we write it back to the input element and hide the calendar.
     *
     * The format of the date can be controlled with the 'format' config function
     *
     * @param e {Event} selected date value
     */
    _calendarChangeValue : function(e) {
      var formattedValue = this.getConfig('format').call(this, e);
      this.setValue(formattedValue);
      this.getCalendar().hide();
    }
  },

  defer : function(statics) {
    qxWeb.$attach({datepicker : statics.datepicker});
  }
});