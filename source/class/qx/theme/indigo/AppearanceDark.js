/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Scott Knick (sknick)

************************************************************************* */

/* ************************************************************************


************************************************************************* */

/**
 * The Indigo qooxdoo dark appearance theme.
 *
 * @asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)
 * @asset(qx/icon/${qx.icontheme}/16/places/folder-open.png)
 * @asset(qx/icon/${qx.icontheme}/16/places/folder.png)
 * @asset(qx/icon/${qx.icontheme}/16/mimetypes/text-plain.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/view-refresh.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/window-close.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)
 */
qx.Theme.define("qx.theme.indigo.AppearanceDark", {
  extend: qx.theme.indigo.Appearance,

  appearances: {
    "progressbar": {
      style(states) {
        return {
          decorator: "progressbar",
          padding: 1,
          backgroundColor: "light-background",
          width: 200,
          height: 20
        };
      }
    },

    "tabview-page/button": {
      style(states) {
        var decorator;

        // default padding
        if (states.barTop || states.barBottom) {
          var padding = [8, 16, 8, 13];
        } else {
          var padding = [8, 4, 8, 4];
        }

        // decorator
        if (states.checked) {
          if (states.barTop) {
            decorator = "tabview-page-button-top";
          } else if (states.barBottom) {
            decorator = "tabview-page-button-bottom";
          } else if (states.barRight) {
            decorator = "tabview-page-button-right";
          } else if (states.barLeft) {
            decorator = "tabview-page-button-left";
          }
        } else {
          for (var i = 0; i < padding.length; i++) {
            padding[i] += 1;
          }
          // reduce the size by 1 because we have different decorator border width
          if (states.barTop) {
            padding[2] -= 1;
          } else if (states.barBottom) {
            padding[0] -= 1;
          } else if (states.barRight) {
            padding[3] -= 1;
          } else if (states.barLeft) {
            padding[1] -= 1;
          }
        }

        return {
          zIndex: states.checked ? 10 : 5,
          decorator: decorator,
          textColor: states.disabled
            ? "text-disabled"
            : states.checked
              ? "font"
              : "tabview-unselected",
          padding: padding,
          cursor: "pointer"
        };
      }
    },

    "textfield": {
      style(states) {
        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = undefined;
        }

        var decorator;
        var padding;
        if (states.disabled) {
          decorator = "inset";
          padding = [2, 3];
        } else if (states.invalid) {
          decorator = "border-invalid";
          padding = [1, 2];
        } else if (states.focused) {
          decorator = "focused-inset";
          padding = [1, 2];
        } else {
          padding = [2, 3];
          decorator = "inset";
        }

        return {
          decorator: decorator,
          padding: padding,
          textColor: textColor,
          backgroundColor: states.disabled ? "background-disabled" : "light-background"
        };
      }
    },

    "window/minimize-button": {
      alias: "button",

      style(states) {
        return {
          icon: qx.theme.indigo.ImageDark.URLS["window-minimize"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/restore-button": {
      alias: "button",

      style(states) {
        return {
          icon: qx.theme.indigo.ImageDark.URLS["window-restore"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/maximize-button": {
      alias: "button",

      style(states) {
        return {
          icon: qx.theme.indigo.ImageDark.URLS["window-maximize"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/close-button": {
      alias: "button",

      style(states) {
        return {
          marginLeft: 2,
          icon: qx.theme.indigo.ImageDark.URLS["window-close"],
          padding: [1, 2],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    }
  }
});
