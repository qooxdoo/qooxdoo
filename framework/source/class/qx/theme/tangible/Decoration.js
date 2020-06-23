/* ************************************************************************

  Tangible Theme for Qooxdoo

  Copyright:
     2018 IT'IS Foundation
     2020 Tobi Oetiker

  License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

  Authors:
    * Tobias Oetiker (oetiker)

  Origin:
   This theme is based in large parts on the osparc.theme
************************************************************************ */
/**
 * The simple qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.tangible.Decoration",
  {
    aliases: {decoration: "qx/decoration/Simple"},

    decorations: {

      /*
        ---------------------------------------------------------------------------
          MATERIAL TEXT FIELD
        ---------------------------------------------------------------------------
        */
      "material-textfield": {
        style: {
          styleBottom: "solid",
          widthBottom: 1,
          colorBottom: "primary"
        }
      },
      "material-textfield-focused": {
        include: "material-textfield",
        style: {
          widthBottom: 2,
          colorBottom: "primary-focussed"
        }
      },
      "material-textfield-invalid": {
        include: "material-textfield",
        style: {
          widthBottom: 1,
          colorBottom: "error"
        }
      },
      "material-textfield-focused-invalid": {
        include: "material-textfield",
        style: {
          widthBottom: 2,
          colorBottom: "error-focussed"
        }
      },
      "material-textfield-disabled": {
        include: "material-textfield",
        style: {
          widthBottom: 1,
          colorBottom: "primary-disabled"
        }
      },

      "material-textfield-readonly": {style: {}},

      /*
        ---------------------------------------------------------------------------
          BUTTON
        ---------------------------------------------------------------------------
        */

      "material-button": {
        style: {
          radius: 2,
          backgroundColor: "primary",
          shadowHorizontalLength: 0,
          shadowVerticalLength: [3, 2, 1],
          shadowBlurRadius: [1, 2, 5],
          shadowSpreadRadius: [-2, 0, 0],
          shadowColor: [
            "rgba(0, 0, 0, 0.2)",
            "rgba(0, 0, 0, 0.14)",
            "rgba(0, 0, 0, 0.12)"
          ],
          transitionProperty: ["all"],
          transitionDuration: "0s"
        }
      },
      "material-button-hovered": {
        include: "material-button",
        style: {
          backgroundColor: "primary-hovered",
          shadowVerticalLength: [2, 4, 1],
          shadowBlurRadius: [4, 5, 10],
          shadowSpreadRadius: [-1, 0, 0],
          transitionDuration: "0.1s"
        }
      },
      "material-button-pressed": {
        include: "material-button",
        style: {
          backgroundColor: "primary-hovered",
          shadowVerticalLength: [5, 8, 3],
          shadowBlurRadius: [5, 10, 14],
          shadowSpreadRadius: [-3, 1, 2],
          transitionDuration: "0.1s"
        }
      },

      "material-button-disabled": {
        include: "material-button",
        style: {
          shadowVerticalLength: 0,
          shadowBlurRadius: 0,
          shadowSpreadRadius: 0,
          backgroundColor: "primary-disabled"
        }
      },

      "material-button-left": {
        include: "material-button",
        style: {radius: [2, 0, 0, 2]}
      },
      "material-button-right": {
        include: "material-button",
        style: {radius: [0, 2, 2, 0]}
      },
      "material-button-hovered-left": {
        include: "material-button-hovered",
        style: {radius: [2, 0, 0, 2]}
      },
      "material-button-focused-left": {
        include: "material-button-hovered",
        style: {radius: [2, 0, 0, 2]}
      },
      "material-button-hovered-right": {
        include: "material-button-hovered",
        style: {radius: [0, 2, 2, 0]}
      },
      "material-button-focused-right": {
        include: "material-button-hovered",
        style: {radius: [0, 2, 2, 0]}
      },
      "material-button-pressed-left": {
        include: "material-button-pressed",
        style: {radius: [2, 0, 0, 2]}
      },
      "material-button-pressed-right": {
        include: "material-button-pressed",
        style: {radius: [0, 2, 2, 0]}
      },
      "material-button-disabled-left": {
        include: "material-button-disabled",
        style: {radius: [2, 0, 0, 2]}
      },
      "material-button-disabled-right": {
        include: "material-button-disabled",
        style: {radius: [0, 2, 2, 0]}
      },

      "toggle-button": {
        include: "material-button"
      },
      "toggle-button-hovered": {
        include: "material-button-hovered"
      },
      "toggle-button-checked": {
        include: "toggle-button",
        style: {
          backgroundColor: "primary-selected"
        }
      },
      "toggle-button-checked-hovered": {
        include: "toggle-button-hovered",
        style: {
          backgroundColor: "primary-selected"
        }
      },
      "toggle-button-disabled": {
        include: "material-button-disabled"
      },
      "toggle-button-checked-disabled": {
        include: "toggle-button-checked",
        style: {
          backgroundColor: "primary-selected_disabled"
        }
      },
      /*
        ---------------------------------------------------------------------------
          CORE
        ---------------------------------------------------------------------------
        */
      "border-blue":
          {
            style:
              {
                width: 4,
                color: "surface"
              }
          },


      "main":
          {
            style:
              {
                width: 1,
                color: "text-hint-on-surface"
              }
          },
      "main-top":
          {
            include: "main",
            style:
              {width: [1, 0, 0, 0]}
          },
      "main-right":
          {
            include: "main",
            style:
              {width: [0, 1, 0, 0]}
          },
      // eslint-disable-next-line no-dupe-keys
      "main-bottom":
          {
            include: "main",
            style:
              {width: [0, 0, 1, 0]}
          },
      "main-left":
          {
            include: "main",
            style:
              {width: [0, 0, 0, 1]}
          },


      "popup":
          {
            style:
              {
                width: 1,
                color: "text-hint-on-surface",
                shadowLength: 2,
                shadowBlurRadius: 5,
                shadowColor: "shadow"
              }
          },


      "dragover":
          {style: {bottom: [2, "solid", "dark-blue"]}},



      /*
        ---------------------------------------------------------------------------
          BUTTON
        ---------------------------------------------------------------------------
        */




      "button-box":
          {
            style:
              {
                radius: 0,
                width: 0,
                color: "text-on-primary",
                backgroundColor: "primary"
              }
          },

      "button-box-pressed":
          {
            include: "button-box",

            style:
              {backgroundColor: "primary-focussed"}
          },

      "button-box-pressed-hovered":
          {
            include: "button-box",

            style:
              {backgroundColor: "primary-selected"}
          },

      "button-box-hovered":
          {
            include: "button-box",

            style:
              {backgroundColor: "button-hovered"}
          },


      /*
        ---------------------------------------------------------------------------
          BUTTON INVALID
        ---------------------------------------------------------------------------
        */
      "button-box-invalid":
          {
            include: "button-box",

            style:
              {color: "error"}
          },

      "button-box-pressed-invalid":
          {
            include: "button-box-pressed",

            style:
              {color: "error"}
          },

      "button-box-hovered-invalid": {include: "button-box-invalid"},

      "button-box-pressed-hovered-invalid": {include: "button-box-pressed-invalid"},


      /*
        ---------------------------------------------------------------------------
          BUTTON FOCUSED
        ---------------------------------------------------------------------------
        */
      "button-box-focused":
          {
            include: "button-box",

            style:
              {color: "surface"}
          },

      "button-box-pressed-focused":
          {
            include: "button-box-pressed",

            style:
              {color: "surface"}
          },

      "button-box-hovered-focused": {include: "button-box-focused"},

      "button-box-pressed-hovered-focused": {include: "button-box-pressed-focused"},


      /*
        ---------------------------------------------------------------------------
          BUTTON RIGHT
        ---------------------------------------------------------------------------
        */
      "button-box-right":
          {
            include: "button-box",

            style:
              {radius: [0, 1, 1, 0]}
          },

      "button-box-pressed-right":
          {
            include: "button-box-pressed",

            style:
              {radius: [0, 1, 1, 0]}
          },

      "button-box-pressed-hovered-right":
          {
            include: "button-box-pressed-hovered",

            style:
              {radius: [0, 1, 1, 0]}
          },

      "button-box-hovered-right":
          {
            include: "button-box-hovered",

            style:
              {radius: [0, 1, 1, 0]}
          },

      "button-box-focused-right":
          {
            include: "button-box-focused",

            style:
              {radius: [0, 1, 1, 0]}
          },

      "button-box-hovered-focused-right":
          {
            include: "button-box-hovered-focused",

            style:
              {radius: [0, 1, 1, 0]}
          },

      "button-box-pressed-focused-right":
          {
            include: "button-box-pressed-focused",

            style:
              {radius: [0, 1, 1, 0]}
          },

      "button-box-pressed-hovered-focused-right":
          {
            include: "button-box-pressed-hovered-focused",

            style:
              {radius: [0, 1, 1, 0]}
          },


      /*
        ---------------------------------------------------------------------------
          BUTTON BORDERLESS RIGHT
        ---------------------------------------------------------------------------

      "button-box-right-borderless":
          {
            include: "button-box",

            style:
              {
                radius: [0, 1, 1, 0],
                width: [1, 1, 1, 0]
              }
          },

      "button-box-pressed-right-borderless":
          {
            include: "button-box-pressed",

            style:
              {
                radius: [0, 1, 1, 0],
                width: [1, 1, 1, 0]
              }
          },

      "button-box-pressed-hovered-right-borderless":
          {
            include: "button-box-pressed-hovered",

            style:
              {
                radius: [0, 1, 1, 0],
                width: [1, 1, 1, 0]
              }
          },

      "button-box-hovered-right-borderless":
          {
            include: "button-box-hovered",

            style:
              {
                radius: [0, 1, 1, 0],
                width: [1, 1, 1, 0]
              }
          },
*/

      /*
        ---------------------------------------------------------------------------
          BUTTON TOP RIGHT
        ---------------------------------------------------------------------------
        */
      "button-box-top-right":
          {
            include: "button-box",

            style:
              {radius: [0, 1, 0, 0]}
          },

      "button-box-pressed-top-right":
          {
            include: "button-box-pressed",

            style:
              {radius: [0, 1, 0, 0]}
          },

      "button-box-pressed-hovered-top-right":
          {
            include: "button-box-pressed-hovered",

            style:
              {radius: [0, 1, 0, 0]}
          },

      "button-box-hovered-top-right":
          {
            include: "button-box-hovered",

            style:
              {radius: [0, 1, 0, 0]}
          },


      /*
        ---------------------------------------------------------------------------
          BUTTON BOTOM RIGHT
        ---------------------------------------------------------------------------
        */
      "button-box-bottom-right":
          {
            include: "button-box",

            style:
              {
                radius: [0, 0, 1, 0],
                width: [0, 1, 1, 0]
              }
          },

      "button-box-pressed-bottom-right":
          {
            include: "button-box-pressed",

            style:
              {
                radius: [0, 0, 1, 0],
                width: [0, 1, 1, 0]
              }
          },

      "button-box-pressed-hovered-bottom-right":
          {
            include: "button-box-pressed-hovered",

            style:
              {
                radius: [0, 0, 1, 0],
                width: [0, 1, 1, 0]
              }
          },

      "button-box-hovered-bottom-right":
          {
            include: "button-box-hovered",

            style:
              {
                radius: [0, 0, 1, 0],
                width: [0, 1, 1, 0]
              }
          },


      /*
        ---------------------------------------------------------------------------
          BUTTON BOTOM LEFT
        ---------------------------------------------------------------------------
        */
      "button-box-bottom-left":
          {
            include: "button-box",

            style:
              {
                radius: [0, 0, 0, 1],
                width: [0, 0, 1, 1]
              }
          },

      "button-box-pressed-bottom-left":
          {
            include: "button-box-pressed",

            style:
              {
                radius: [0, 0, 0, 1],
                width: [0, 0, 1, 1]
              }
          },

      "button-box-pressed-hovered-bottom-left":
          {
            include: "button-box-pressed-hovered",

            style:
              {
                radius: [0, 0, 0, 1],
                width: [0, 0, 1, 1]
              }
          },

      "button-box-hovered-bottom-left":
          {
            include: "button-box-hovered",

            style:
              {
                radius: [0, 0, 0, 1],
                width: [0, 0, 1, 1]
              }
          },


      /*
        ---------------------------------------------------------------------------
          BUTTON TOP LEFT
        ---------------------------------------------------------------------------
        */
      "button-box-top-left":
          {
            include: "button-box",

            style:
              {
                radius: [1, 0, 0, 0],
                width: [1, 0, 0, 1]
              }
          },

      "button-box-pressed-top-left":
          {
            include: "button-box-pressed",

            style:
              {
                radius: [1, 0, 0, 0],
                width: [1, 0, 0, 1]
              }
          },

      "button-box-pressed-hovered-top-left":
          {
            include: "button-box-pressed-hovered",

            style:
              {
                radius: [1, 0, 0, 0],
                width: [1, 0, 0, 1]
              }
          },

      "button-box-hovered-top-left":
          {
            include: "button-box-hovered",

            style:
              {
                radius: [1, 0, 0, 0],
                width: [1, 0, 0, 1]
              }
          },


      /*
        ---------------------------------------------------------------------------
          BUTTON MIDDLE
        ---------------------------------------------------------------------------
        */
      "button-box-middle":
          {
            include: "button-box",

            style:
              {
                radius: 0,
                width: [1, 0, 1, 1]
              }
          },

      "button-box-pressed-middle":
          {
            include: "button-box-pressed",

            style:
              {
                radius: 0,
                width: [1, 0, 1, 1]
              }
          },

      "button-box-pressed-hovered-middle":
          {
            include: "button-box-pressed-hovered",

            style:
              {
                radius: 0,
                width: [1, 0, 1, 1]
              }
          },

      "button-box-hovered-middle":
          {
            include: "button-box-hovered",

            style:
              {
                radius: 0,
                width: [1, 0, 1, 1]
              }
          },


      /*
        ---------------------------------------------------------------------------
          BUTTON LEFT
        ---------------------------------------------------------------------------
        */
      "button-box-left":
          {
            include: "button-box",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },

      "button-box-pressed-left":
          {
            include: "button-box-pressed",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },

      "button-box-pressed-hovered-left":
          {
            include: "button-box-pressed-hovered",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },

      "button-box-hovered-left":
          {
            include: "button-box-hovered",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },

      "button-box-focused-left":
          {
            include: "button-box-focused",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },

      "button-box-hovered-focused-left":
          {
            include: "button-box-hovered-focused",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },

      "button-box-pressed-hovered-focused-left":
          {
            include: "button-box-pressed-hovered-focused",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },

      "button-box-pressed-focused-left":
          {
            include: "button-box-pressed-focused",

            style:
              {
                radius: [1, 0, 0, 1],
                width: [1, 0, 1, 1]
              }
          },


      /*
        ---------------------------------------------------------------------------
          SEPARATOR
        ---------------------------------------------------------------------------
        */

      "separator-horizontal":
          {
            style:
              {
                widthLeft: 1,
                colorLeft: "text-hint-on-surface"
              }
          },

      "separator-vertical":
          {
            style:
              {
                widthTop: 1,
                colorTop: "text-hint-on-surface"
              }
          },


      /*
        ---------------------------------------------------------------------------
          SCROLL KNOB
        ---------------------------------------------------------------------------
        */
      "scroll-knob":
          {
            style:
              {
                radius: 4,
                width: 0,
                backgroundColor: "text-hint-on-surface"
              }
          },

      "scroll-knob-pressed":
          {
            include: "scroll-knob",

            style:
              {backgroundColor: "text-primary-on-surface"}
          },

      "scroll-knob-hovered":
          {include: "scroll-knob"},

      "scroll-knob-pressed-hovered":
          {include: "scroll-knob-pressed"},

      /*
        ---------------------------------------------------------------------------
          HOVER BUTTON
        ---------------------------------------------------------------------------
        */
      "button-hover":
          {
            style:
              {
                backgroundColor: "primary-hovered",
                radius: 1
              }
          },


      /*
        ---------------------------------------------------------------------------
          WINDOW
        ---------------------------------------------------------------------------
        */
      "window":
          {
            style:
              {
                width: 1,
                color: "text-hint-on-surface",
                shadowLength: 1,
                shadowBlurRadius: 3,
                shadowColor: "rgba(0,0,0,0.2)",
                backgroundColor: "surface"
              }
          },

      "window-active":
          {
            include: "window",

            style:
              {
                shadowLength: 2,
                shadowBlurRadius: 5
              }
          },


      "window-caption": {
        style:
            {
              width: [0, 0, 1, 0],
              color: "text-hint-on-surface"
            }
      },

      /*
        ---------------------------------------------------------------------------
          GROUP BOX
        ---------------------------------------------------------------------------
        */

      "box":
          {
            style:
              {
                width: 1,
                radius: 2,
                color: "text-hint-on-surface",
                backgroundColor: "surface"
              }
          },


      /*
        ---------------------------------------------------------------------------
          FRAME BOX
        ---------------------------------------------------------------------------
        */
      "border":
          {
            style:
              {
                width: 1,
                color: "text-hint-on-surface"
              }
          },
      "border-disabled":
          {
            style:
              {
                width: 1,
                color: "text-disabled-on-surface"
              }
          },

      "border-focused":
          {
            style:
              {
                width: 1,
                color: "primary"
              }
          },

      "border-invalid":
          {
            style:
              {
                width: 1,
                color: "error"
              }
          },


      /*
        ---------------------------------------------------------------------------
          LIST ITEM
        ---------------------------------------------------------------------------
        */

      "lead-item":
          {
            style:
              {
                width: 1,
                style: "dotted",
                color: "text-disabled-on-surface"
              }
          },




      /*
        ---------------------------------------------------------------------------
          TOOL TIP
        ---------------------------------------------------------------------------
        */

      "tooltip":
          {
            style:
              {
                width: 1,
                color: "text-on-secondary",
                shadowLength: 1,
                shadowBlurRadius: 2,
                shadowColor: "rgba(0,0,0,0.2)"
              }
          },


      "tooltip-error":
          {
            style: {
              radius: 5,
              backgroundColor: "error"
            }
          },




      /*
        ---------------------------------------------------------------------------
          TOOLBAR
        ---------------------------------------------------------------------------
        */

      "toolbar-separator":
          {
            style:
              {
                widthLeft: 1,
                colorLeft: "text-hint-on-surface"
              }
          },
      "toolbar-button": {
        include: "material-button",
        style: {
          shadowHorizontalLength: 0,
          shadowVerticalLength: 0,
          shadowBlurRadius: 0,
          shadowSpreadRadius: 0
        }
      },
      "toolbar-button-hovered": {include: "material-button-hovered"},

      "toolbar-button-left": {
        include: "material-button-left",
        style: {
          shadowHorizontalLength: 0,
          shadowVerticalLength: 0,
          shadowBlurRadius: 0,
          shadowSpreadRadius: 0
        }
      },
      "toolbar-button-hovered-left": {include: "material-button-hovered-left"},
      "toolbar-button-right": {
        include: "material-button-right",
        style: {
          shadowHorizontalLength: 0,
          shadowVerticalLength: 0,
          shadowBlurRadius: 0,
          shadowSpreadRadius: 0
        }
      },
      "toolbar-button-hovered-right": {include: "material-button-hovered-right"},

      /*
        ---------------------------------------------------------------------------
          MENU
        ---------------------------------------------------------------------------
        */
      "menu-separator":
          {
            style:
              {
                widthTop: 1,
                colorTop: "text-hint-on-surface"
              }
          },


      /*
        ---------------------------------------------------------------------------
          MENU BAR
        ---------------------------------------------------------------------------
        */
      "menubar-button-hovered":
          {
            style:
              {backgroundColor: "primary-hovered"}
          },


      "menubar-button-pressed":
          {
            include: "menubar-button-hovered",

            style:
              {backgroundColor: "primary-selected"}
          },


      /*
        ---------------------------------------------------------------------------
          DATE CHOOSER
        ---------------------------------------------------------------------------
        */

      "datechooser-date-pane":
          {
            style:
              {
                widthTop: 1,
                colorTop: "text-hint-on-surface",
                style: "solid"
              }
          },


      "datechooser-weekday":
          {
            style:
              {
                widthBottom: 1,
                colorBottom: "text-hint-on-surface",
                style: "solid"
              }
          },

      "datechooser-week":
          {
            style:
              {
                widthRight: 1,
                colorRight: "text-hint-on-surface",
                style: "solid"
              }
          },

      "datechooser-week-header":
          {
            style:
              {
                widthBottom: 1,
                colorBottom: "text-hint-on-surface",
                widthRight: 1,
                colorRight: "text-hint-on-surface",
                style: "solid"
              }
          },





      /*
        ---------------------------------------------------------------------------
          TAB VIEW
        ---------------------------------------------------------------------------
        */

      "tabview-page-button-top":
          {
            style:
              {
                width: [0, 0, 2, 0],
                backgroundColor: "surface",
                color: "primary"
              }
          },

      "tabview-page-button-bottom": {
        include: "tabview-page-button-top",

        style:
            {width: [2, 0, 0, 0]}
      },

      "tabview-page-button-left": {
        include: "tabview-page-button-top",

        style:
            {width: [0, 2, 0, 0]}
      },

      "tabview-page-button-right": {
        include: "tabview-page-button-top",

        style:
            {width: [0, 0, 0, 2]}
      },


      /*
        ---------------------------------------------------------------------------
          TABLE
        ---------------------------------------------------------------------------
        */

      "statusbar":
          {
            style:
              {
                widthTop: 1,
                colorTop: "text-hint-on-surface",
                styleTop: "solid"
              }
          },

      // attention hackerery in the qx.ui.table.pane.Scroller
      // decorator: "table-scroller-focus-indicator"
      // gets applied hardcoded! So do not try to change its
      // name here!
      "table-scroller-focus-indicator": {
        style: {
          width: 1,
          style: 'dotted',
          color: "text-hint-on-surface"
        }
      },

      "table-header":
          {
            include: "button-box",

            style:
              {
                radius: 0,
                color: "text-hint-on-surface",
                width: [0, 0, 2, 0]
              }
          },

      "table-header-column-button":
          {include: "table-header"},

      "table-header-cell":
          {
            style:
              {}
          },

      "table-header-cell-first":
          {include: "table-header-cell"},


      "progressive-table-header":
          {
            include: "button-box",

            style:
              {
                radius: 0,
                width: [1, 0, 1, 1]
              }
          },

      "progressive-table-header-cell":
          {
            style:
              {
                widthRight: 1,
                color: "text-hint-on-surface"
              }
          },


      /*
        ---------------------------------------------------------------------------
          PROGRESSBAR
        ---------------------------------------------------------------------------
        */

      "progressbar":
          {
            style:
              {
                width: 1,
                color: "text-hint-on-surface"
              }
          },



      /*
        ---------------------------------------------------------------------------
          RADIO BUTTON
        ---------------------------------------------------------------------------
        */
      "radiobutton":
       {
         style:
           {color: "text-primary-on-surface"}
       },
      /*
        ---------------------------------------------------------------------------
          CHECK BOX
        ---------------------------------------------------------------------------
        */

      "checkbox":
          {
            style:
              {color: "text-primary-on-surface"}
          }
    }
  });
