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
 * This is a date picker widget used to combine an input element with a calendar widget
 * to select a date. The calendar itself is opened as popup to save visual space.
 *
 * <h2>Markup</h2>
 * Each Date Picker widget is connected to an existing input element.
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
 *       <td><code>qx-datepicker</code></td>
 *       <td>Input element</td>
 *       <td>Identifies the date picker widget</td>
 *     </tr>
 *     <tr>
 *       <td><code>qx-datepicker-icon</code></td>
 *       <td>Icon element</td>
 *       <td>Identifies the (if configured) image element to open the date picker</td>
 *     </tr>
 *   </tbody>
 * </table>
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
     *
     * *readonly*
     *
     * Boolean value to control if the connected input element is read-only.
     *
     * Default value:
     * <pre>true</pre>
     *
     * *icon*
     *
     * Path to an icon which will be placed next to the input element as additional opener. If configured
     * a necessary <code>img</code> element is created and equipped with the <code>qx-datepicker-icon</code>
     * CSS class to style it.
     *
     * Default value:
     * <pre>null</pre>
     *
     * *mode*
     *
     * Which control should trigger showing the date picker.
     * Possible values are <code>input</code>, <code>icon</code>, <code>both</code>.
     *
     * Default value:
     * <pre>input</pre>
     */
    _config : {
      format : function(date) {
        return date.toLocaleDateString();
      },

      readonly : true,

      icon : null,

      mode : 'input'
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
      var datepicker = new qx.ui.website.DatePicker(this);
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
        calendarCollection = calendarCollection.concat(qxWeb('div#' + datepicker.getProperty('calendarId')));
      });

      return calendarCollection;
    },

    // overridden
    /**
     * Initializes the date picker widget
     *
     * @param date {Date} A JavaScript Date object to set the current date
     * @return {Boolean} <code>true</code> if the widget has been initialized
     */
    init : function(date) {
      if (!this.base(arguments)) {
        return false;
      }

      this._forEachElementWrapped(function(datepicker) {

        var uniqueId = Math.round(Math.random() * 10000);
        datepicker.setProperty('uniqueId', uniqueId);

        this.__setReadOnly(datepicker);
        this.__setIcon(datepicker);
        this.__addInputListener(datepicker);

        var calendarId = 'datepicker-calendar-' + uniqueId;
        var calendar = qxWeb.create('<div id="' + calendarId + '"></div>').calendar();
        calendar.on('tap', this._onCalendarTap);
        calendar.appendTo(document.body).hide();

        // create the connection between the date picker and the corresponding calendar widget
        datepicker.setProperty('calendarId', calendarId);

        // grab tap events at the body element to be able to hide the calender popup
        // if the user taps outside
        var bodyElement = qxWeb.getDocument(datepicker).body;
        qxWeb(bodyElement).on('tap', datepicker._onBodyTap, datepicker);

        // react on date selection
        calendar.on('changeValue', datepicker._calendarChangeValue, datepicker);

        if (date !== undefined) {
          calendar.setValue(date);
        }
      });

      return true;
    },

    // overridden
    render : function() {
      this.getCalendar().render();

      this._forEachElementWrapped(function(datepicker) {
        this.__setReadOnly(datepicker);
        this.__setIcon(datepicker);
        this.__addInputListener(datepicker);
      });

      this.setEnabled(this.getEnabled());

      return this;
    },

    /**
     * Listener which handles clicks/taps on the associated input element and
     * opens / hides the calendar.
     *
     * @param e {Event} tap event
     */
    _onTap : function(e) {
      if (!this.getEnabled()) {
        return;
      }

      var calendar = qxWeb('div#' + this.getProperty('calendarId'));

      if (calendar.getStyle("display") == "none") {
        this.getCalendar().show().placeTo(this, 'bottom-left');
      } else {
        this.getCalendar().hide();
      }
    },

    /**
     * Stop tap events from reaching the body so the calendar won't close
     * @param e {Event} Tap event
     */
    _onCalendarTap : function(e) {
      e.stopPropagation();
    },

    /**
     * Listener to the body element to be able to hide the calendar if the user clicks
     * or taps outside the calendar.
     *
     * @param e {Event} tap event
     */
    _onBodyTap : function(e) {

      var target = qxWeb(e.getTarget());

      // fast check for tap on the connected input field
      if (this.length > 0 && target.length > 0 &&
          this[0] == target[0]) {
        return;
      }

      // fast check for tap on the configured icon
      if (this.getConfig('icon') !== null) {
        var icon = qxWeb('#' + this.getProperty('iconId'));
        if (icon.length > 0 && target.length > 0 &&
            icon[0] == target[0]) {
          return;
        }
      }

      // otherwise check if the target is a child of the (rendered) calendar
      if (this.getCalendar().isRendered()) {
        var tappedCol = qxWeb(e.getTarget());

        if (tappedCol.isChildOf(this.getCalendar()) === false) {
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
    },


    /**
     * Helper method to set the readonly status on the input element
     *
     * @param collection {qxWeb} collection to work on
     */
    __setReadOnly : function(collection) {
      if (collection.getConfig('readonly')) {
        collection.setAttribute('readonly', 'readonly');
      } else {
        collection.removeAttribute('readonly');
      }
    },

    /**
     * Helper method to add / remove an icon next to the input element
     *
     * @param collection {qxWeb} collection to work on
     */
    __setIcon : function(collection) {
      var icon;

      if (collection.getConfig('icon') === null) {
        icon = collection.getNext('img#' + collection.getProperty('iconId'));
        if (icon.length === 1) {
          icon.off('tap', this._onTap, collection);
          icon.remove();
        }
      } else {
        var iconId = 'datepicker-icon-' + collection.getProperty('uniqueId');

        // check if there is already an icon
        if (collection.getProperty('iconId') === undefined) {
          collection.setProperty('iconId', iconId);

          icon = qxWeb.create('<img>');

          icon.setAttributes({
            id: iconId,
            src: collection.getConfig('icon')
          });

          icon.addClass(this.getCssPrefix() + '-icon');

          var openingMode = collection.getConfig('mode');
          if (openingMode === 'icon' || openingMode === 'both') {
            icon.on('tap', this._onTap, collection);
          }

          icon.insertAfter(collection);
        }
      }
    },

    /**
     * Helper method to add a listener to the connected input element
     * if the configured mode is set.
     *
     * @param collection {qxWeb} collection to work on
     */
    __addInputListener : function(collection) {
      if (collection.getConfig('mode') === 'icon') {
        collection.$offFirstCollection('tap', collection._onTap);
      } else {
        collection.$onFirstCollection('tap', collection._onTap);
      }
    },

    // overridden
    dispose : function() {
      this._forEachElementWrapped(function(datepicker) {
        datepicker.removeAttribute('readonly');
        datepicker.getNext('img#' + datepicker.getProperty('iconId')).remove();

        datepicker.$offFirstCollection('tap', datepicker._onTap);

        var bodyElement = qxWeb.getDocument(datepicker).body;
        qxWeb(bodyElement).off('tap', datepicker._onBodyTap, datepicker);

        datepicker.getCalendar().off('changeValue', this._calendarChangeValue, datepicker)
        .off('tap', this._onCalendarTap);

        var calendar = qxWeb('div#' + datepicker.getProperty('calendarId'));
        calendar.remove();
        calendar.dispose();
      });

      return this.base(arguments);
    }
  },

  defer : function(statics) {
    qxWeb.$attach({datepicker : statics.datepicker});
  }
});
