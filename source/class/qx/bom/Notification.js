/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   Authors:
     * Cajus Pollmeier (cajus)

************************************************************************ */

/**
 * This class offers a constant API over the Notification Spec:
 * http://www.w3.org/TR/notifications/
 *
 * It forwards all the browsers support if supported.
 *
 * *Example*
 *
 * <pre class="javascript">
 * var notifications = qx.bom.Notification.getInstance();
 *
 * var button = new qx.ui.form.Button("Notify me!");
 * button.addListener("execute", function() {
 *   notifications.show("Information", "Hey there!", "icon/64/status/dialog-information.png", 5000);
 * });
 *
 * // Enable button if supported
 * button.setEnabled(qx.core.Environment.get("html.notification"));
 *
 * </pre>
 *
 * **Note**
 *
 * A notification can only be sent if the user allows these notifications to
 * be shown. <code>qx.bom.Notification</code> automatically tries to
 * trigger a browser dialog which asks the user for permission.
 *
 * But there is a restriction: the dialog will only show up if it is triggered
 * by code that is running inside a request handler for an interactive browser
 * event like a mouse click or a keyboard interaction.
 *
 * For real life applications this means that you may add a <code>request()</code>
 * call i.e. to your applications login button to let the browser ask for
 * permission initially. After that happened and the user decided to
 * accept these notifications, they can be sent any time without the
 * need to be inside of event handlers.
 *
 * @ignore(Notification.requestPermission,Notification,Notification.permission)
 */
qx.Class.define("qx.bom.Notification", {

  extend: qx.core.Object,
  type: "singleton",

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : {

    /**
     * Whether the client supports the desktop notification API.
     *
     * @internal
     * @return {Boolean} <code>true</code> if notification API is supported
     */
    getNotification : function() {
      return window.Notification !== undefined;
    }

  },


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * This is a singleton. Use <code>getInstance()</code> to get an instance.
   */
  construct : function() {
    this.base(arguments);
     this.__notifications = {};
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {

    /**
     * Event fired when a notification with data <code>tag</code> appeared.
     */
    "appear" : "Data",

    /**
     * Event fired when a notification with data <code>tag</code> has been
     * clicked by the user.
     */
    "click" : "Data",

    /**
     * Event fired when a notification with data <code>tag</code> has been
     * closed. This may happen either interactively or due to a timeout
     * defined by the instance displaying the notification.
     */
    "close" : "Data"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __notifications : null,
    __lastId : 0,


    /**
     * Display a desktop notification using a _title_, _message_ and _icon_.
     *
     * @param title {String} The notification title
     * @param message {String} The message body
     * @param icon {String} Resource string or icon URL
     * @param expire {Number} Number of milliseconds after the message is
     *                     automatically destroyed. Leave empty for no
     *                     timeout. Note that some notification systems
     *                     tend to remove timeout-less messages after some
     *                     time.
     * @param tag {String} Multiple messages with the same tag replace each
     *                     other. Leave blank for automatic tag handling.
     * @return {String} Notification tag
     */
    show : function(title, message, icon, expire, tag) {
      if (qx.bom.Notification.getNotification()) {

        // Generate unique tag to be able to identify the
        // notification later on.
        if (tag !== undefined) {
          tag = "id" + (this.__lastId++);
        }

        // If we've the permission already, just send it
        if (Notification.permission == "granted") {
          this._show(tag, title, message, icon, expire);

        // We've not asked for permission yet. Lets do it.
        } else if (Notification.permission != "denied") {

          var that = this;
          Notification.requestPermission(function (permission) {
            if (Notification.permission === undefined) {
              Notification.permission = permission;
            }

            if (permission == "granted") {
              that._show(tag, title, message, icon, expire);
            }
          });
        }

      }

      return tag === undefined ? null : tag;
    },


    /**
     * Display a desktop notification using a _title_, _message_ and _icon_.
     *
     * @internal
     * @param tag {String} Notification tag
     * @param title {String} The notification title
     * @param message {String} The message body
     * @param icon {String} Resource string or icon URL
     * @param expire {Unsigned} Number of milliseconds after the message is
     *                     automatically destroyed. Leave empty for no
     *                     timeout. Note that some notification systems
     *                     tend to remove timeout-less messages after some
     *                     time.
     */
    _show : function(tag, title, message, icon, expire) {
      var lang = qx.locale.Manager.getInstance().getLocale().replace(/_.*$/, "");

      // Resolve icon path if needed and possible
      if (icon) {
        var rm = qx.util.ResourceManager.getInstance();
        var source = qx.util.AliasManager.getInstance().resolve(icon);
        if (rm.has(source)) {
          icon = rm.toUri(source);
        }

        // old versions of firefox did not display the notification if
        // an icon was specified, so we disable the icon for firefox
        // < version 46
        if (qx.core.Environment.get("engine.name") == "gecko" &&
            qx.core.Environment.get("browser.version") < 46) {
          icon = undefined;
        }
      }

      var notification = new Notification(title, {
        body: message,
        tag: tag,
        icon: icon,
        lang: lang
      });
      var that = this;
      notification.onshow = function() {
        that.__notifications[tag] = notification;
        that.fireDataEvent("appear", tag);
      };
      notification.onclose = function() {
        that.fireDataEvent("close", tag);
        if (that.__notifications[tag]) {
          that.__notifications[tag] = null;
          delete that.__notifications[tag];
        }
      };
      notification.onclick = function() {
        that.fireDataEvent("click", tag);
        if (that.__notifications[tag]) {
          that.__notifications[tag] = null;
          delete that.__notifications[tag];
        }
      };
      notification.onerror = function() {
        that.fireDataEvent("error", tag);
        if (that.__notifications[tag]) {
          that.__notifications[tag] = null;
          delete that.__notifications[tag];
        }
      };

      // Install expire timer if exists
      if (expire) {
        qx.event.Timer.once(function() {
          notification.close();
        }, this, expire);
      }
    },


    /**
     * Actively close an active notification.
     *
     * @param tag {String} Notification tag
     */
    close : function(tag) {
      if (this.__notifications[tag]) {
        this.__notifications[tag].close();
      }
    },


    /**
     * Tell the browser to request permission to display notifications.
     *
     * **Note:**
     *
     * This needs to be called from within an interactive event handler.
     */
    request : function() {
      if (qx.bom.Notification.getNotification()) {
        Notification.requestPermission(function (permission) {
          if (Notification.permission === undefined) {
            Notification.permission = permission;
          }
        });
      }
    },


    /**
     * Check if we've the permission to send notifications.
     *
     * @return {String} Returns either "default", "denied" or "granted". "default"
     *                  indicates that we need to call <code>request()</code>  before
     *                  a notification can be sent.
     */
    getPermission : function() {
       return qx.bom.Notification.getNotification() ? Notification.permission : "denied";
    }

  },


  defer : function (statics) {
    qx.core.Environment.add("html.notification", statics.getNotification);
  }
});
