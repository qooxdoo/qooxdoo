/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Fabian Jakobs (fjakobs)
   * Alexander Steitz (aback)
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************


************************************************************************* */

/**
 * The modern appearance theme.
 *
 * @asset(qx/icon/${qx.icontheme}/16/places/folder-open.png)
 * @asset(qx/icon/${qx.icontheme}/16/places/folder.png)
 * @asset(qx/icon/${qx.icontheme}/16/mimetypes/office-document.png)

 * @asset(qx/icon/${qx.icontheme}/16/actions/window-close.png)

 * @asset(qx/icon/${qx.icontheme}/22/places/folder-open.png)
 * @asset(qx/icon/${qx.icontheme}/22/places/folder.png)
 * @asset(qx/icon/${qx.icontheme}/22/mimetypes/office-document.png)

 * @asset(qx/icon/${qx.icontheme}/32/places/folder-open.png)
 * @asset(qx/icon/${qx.icontheme}/32/places/folder.png)
 * @asset(qx/icon/${qx.icontheme}/32/mimetypes/office-document.png)

 * @asset(qx/icon/${qx.icontheme}/16/apps/office-calendar.png)
 * @asset(qx/icon/${qx.icontheme}/16/apps/utilities-color-chooser.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/view-refresh.png)

 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
 * @asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)

 * @asset(qx/decoration/Modern/cursors/*)
 *
 * @asset(qx/decoration/Modern/scrollbar/scrollbar-left.png)
 * @asset(qx/decoration/Modern/scrollbar/scrollbar-right.png)
 * @asset(qx/decoration/Modern/scrollbar/scrollbar-up.png)
 * @asset(qx/decoration/Modern/scrollbar/scrollbar-down.png)
 *
 * @asset(qx/decoration/Modern/toolbar/toolbar-handle-knob.gif)
 *
 * @asset(qx/decoration/Modern/tree/open-selected.png)
 * @asset(qx/decoration/Modern/tree/closed-selected.png)
 * @asset(qx/decoration/Modern/tree/open.png)
 * @asset(qx/decoration/Modern/tree/closed.png)
 *
 * @asset(qx/decoration/Modern/form/checked.png)
 * @asset(qx/decoration/Modern/form/undetermined.png)
 * @asset(qx/decoration/Modern/form/tooltip-error-arrow-right.png)
 * @asset(qx/decoration/Modern/form/tooltip-error-arrow.png)
 *
 * @asset(qx/decoration/Modern/window/minimize-active-hovered.png)
 * @asset(qx/decoration/Modern/window/minimize-active.png)
 * @asset(qx/decoration/Modern/window/minimize-inactive.png)
 * @asset(qx/decoration/Modern/window/restore-active-hovered.png)
 * @asset(qx/decoration/Modern/window/restore-active.png)
 * @asset(qx/decoration/Modern/window/restore-inactive.png)
 * @asset(qx/decoration/Modern/window/maximize-active-hovered.png)
 * @asset(qx/decoration/Modern/window/maximize-active.png)
 * @asset(qx/decoration/Modern/window/maximize-inactive.png)
 * @asset(qx/decoration/Modern/window/close-active-hovered.png)
 * @asset(qx/decoration/Modern/window/close-active.png)
 * @asset(qx/decoration/Modern/window/close-inactive.png)
 *
 * @asset(qx/decoration/Modern/splitpane/knob-horizontal.png)
 * @asset(qx/decoration/Modern/splitpane/knob-vertical.png)
 *
 * @asset(qx/decoration/Modern/arrows/down.png)
 * @asset(qx/decoration/Modern/arrows/up.png)
 * @asset(qx/decoration/Modern/arrows/right.png)
 * @asset(qx/decoration/Modern/arrows/left.png)
 * @asset(qx/decoration/Modern/arrows/rewind.png)
 * @asset(qx/decoration/Modern/arrows/forward.png)
 * @asset(qx/decoration/Modern/arrows/up-invert.png)
 * @asset(qx/decoration/Modern/arrows/down-invert.png)
 * @asset(qx/decoration/Modern/arrows/right-invert.png)
 * @asset(qx/decoration/Modern/arrows/up-small.png)
 * @asset(qx/decoration/Modern/arrows/down-small.png)
 *
 * @asset(qx/decoration/Modern/menu/checkbox-invert.gif)
 * @asset(qx/decoration/Modern/menu/checkbox.gif)
 * @asset(qx/decoration/Modern/menu/radiobutton-invert.gif)
 * @asset(qx/decoration/Modern/menu/radiobutton.gif)
 *
 * @asset(qx/decoration/Modern/table/select-column-order.png)
 * @asset(qx/decoration/Modern/table/ascending.png)
 * @asset(qx/decoration/Modern/table/descending.png)
 * @asset(qx/decoration/Modern/table/boolean-true.png)
 * @asset(qx/decoration/Modern/table/boolean-false.png)
 *
 * @asset(qx/static/blank.gif)
 * @asset(qx/static/blank.png)
 *
 * @asset(qx/decoration/Modern/colorselector/*)
 */
qx.Theme.define("qx.theme.modern.Appearance",
{
  appearances :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "widget" : {},

    "root" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background-application",
          textColor       : "text-label",
          font            : "default"
        };
      }
    },

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "move-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        };
      }
    },

    "resize-frame" : "move-frame",

    "dragdrop-cursor" :
    {
      style : function(states)
      {
        var icon = "nodrop";

        if (states.copy) {
          icon = "copy";
        } else if (states.move) {
          icon = "move";
        } else if (states.alias) {
          icon = "alias";
        }

        return {
          source : "decoration/cursors/" + icon + ".gif",
          position : "right-top",
          offset : [ 2, 16, 2, 6 ]
        };
      }
    },

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : 1
        };
      }
    },

    "atom" : {},
    "atom/label" : "label",
    "atom/icon" : "image",

    "popup" :
    {
      style : function(states)
      {
        return {
          decorator : "popup",
          backgroundColor : "background-light"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button-frame" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator, textColor;
        var padding = [3, 9]; // default padding

        if (states.checked && states.focused && !states.inner)
        {
          decorator = "button-checked-focused";
          textColor = undefined;
          padding = [1, 7];
        }
        else if (states.disabled)
        {
          decorator = "button-disabled";
          textColor = undefined;
        }
        else if (states.pressed)
        {
          decorator = "button-pressed";
          textColor = "text-hovered";
        }
        else if (states.checked)
        {
          decorator = "button-checked";
          textColor = undefined;
        }
        else if (states.hovered)
        {
          decorator = "button-hovered";
          textColor = "text-hovered";
        }
        else if (states.focused && !states.inner)
        {
          decorator = "button-focused";
          textColor = undefined;
          padding = [1, 7];
        }
        else
        {
          decorator = "button";
          textColor = undefined;
        }

        if (states.invalid && !states.disabled) {
          decorator += "-invalid";
        }

        return {
          decorator : decorator,
          textColor : textColor,
          padding : padding,
          margin : [1, 0]
        };
      }
    },

    "button-frame/image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.5 : 1
        };
      }
    },

    "button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          center : true
        };
      }
    },

    "hover-button" :
    {
      alias : "atom",
      include : "atom",

      style : function(states)
      {
        var decorator = states.hovered ? "selected" : undefined;
        return {
          decorator : decorator,
          textColor : states.hovered ? "text-selected" : undefined
        };
      }
    },

    "menubutton" : {
      include : "button",
      alias : "button",

      style : function(states) {
        return {
          icon : "decoration/arrows/down.png",
          iconPosition : "right"
        };
      }
    },

    "splitbutton" : {},
    "splitbutton/button" : "button",
    "splitbutton/arrow" :
    {
      alias : "button",
      include : "button",

      style : function(states, superStyles)
      {
        return {
          icon : "decoration/arrows/down.png",
          padding : [superStyles.padding[0], superStyles.padding[1] - 6],
          marginLeft : 1
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */

    "form-renderer-label" : {
      include : "label",
      style : function() {
        return {
          paddingTop: 4
        };
      }
    },

    "checkbox":
    {
      alias : "atom",

      style : function(states)
      {
        var icon;
        if (states.checked) {
          icon = "decoration/form/checked.png";
        } else if (states.undetermined) {
          icon = "decoration/form/undetermined.png";
        } else {
          icon = "qx/static/blank.gif";
        }

        return {
          icon: icon,
          minWidth : 14,
          gap: 8,
          paddingLeft: 2
        };
      }
    },

    "checkbox/icon" : {
      style : function(states)
      {
        var decorator;

        if (states.disabled) {
          decorator = "checkbox-disabled";
        } else if (states.focused) {
          decorator = "checkbox-focused";
        } else if (states.hovered) {
          decorator = "checkbox-hovered";
        } else {
          decorator = "checkbox";
        }

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        var padding = states.undetermined ? [3, 1] : 1;

        return {
          decorator : decorator,
          padding : padding,
          width: 10,
          height: 10
        };
      }
    },

    "radiobutton" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon: "qx/static/blank.png",
          gap : 8,
          paddingLeft: 2
        };
      }
    },

    "radiobutton/icon" : {
      style : function(states)
      {
        var decorator;

        if (states.disabled && !states.checked) {
          decorator = "radiobutton-disabled";
        } else if (states.checked && states.focused) {
          decorator = "radiobutton-checked-focused";
        } else if (states.checked && states.disabled) {
          decorator = "radiobutton-checked-disabled";
        } else if (states.checked && states.hovered) {
          decorator = "radiobutton-checked-hovered";
        } else if (states.checked) {
          decorator = "radiobutton-checked";
        } else if (states.focused) {
          decorator = "radiobutton-focused";
        } else if (states.hovered) {
          decorator = "radiobutton-hovered";
        } else {
          decorator = "radiobutton";
        }

        decorator += states.invalid && !states.disabled ? "-invalid" : "";

        return {
          decorator : decorator,
          width: 10,
          height: 10
        };
      }
    },

    "textfield" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = "text-input";
        }

        return {
          decorator : decorator,
          padding : [ 2, 4, 1 ],
          textColor : textColor
        };
      }
    },

    "textarea" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          padding   : 4
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        return {
          decorator : decorator
        };
      }
    },

    "spinner/textfield" :
    {
      style : function(states)
      {
        return {
          marginRight: 2,
          padding: [2, 4, 1],
          textColor: states.disabled ? "text-disabled" : "text-input"
        };
      }
    },

    "spinner/upbutton" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states, superStyles)
      {
        return {
          icon : "decoration/arrows/up-small.png",
          padding : [superStyles.padding[0] - 1, superStyles.padding[1] - 5],
          margin : 0
        };
      }
    },

    "spinner/downbutton" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states, superStyles)
      {
        return {
          icon : "decoration/arrows/down-small.png",
          padding : [superStyles.padding[0] - 1, superStyles.padding[1] - 5],
          margin : 0
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      DATEFIELD
    ---------------------------------------------------------------------------
    */

    "datefield" : "combobox",

    "datefield/button" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        return {
          icon : "icon/16/apps/office-calendar.png",
          padding : [0, 3],
          decorator : undefined
        };
      }
    },

    "datefield/textfield" : "combobox/textfield",

    "datefield/list" :
    {
      alias : "datechooser",
      include : "datechooser",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    "groupbox" :
    {
      style : function(states)
      {
        return {
          legendPosition : "top"
        };
      }
    },

    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          textColor : states.invalid ? "invalid" : "text-title",
          font      : "bold"
        };
      }
    },

    "groupbox/frame" :
    {
      style : function(states)
      {
        return {
          padding : 10,
          margin : 1,
          decorator : "group"
        };
      }
    },


    "check-groupbox" : "groupbox",

    "check-groupbox/legend" :
    {
      alias : "checkbox",
      include : "checkbox",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          textColor : states.invalid ? "invalid" : "text-title",
          font      : "bold"
        };
      }
    },

    "radio-groupbox" : "groupbox",

    "radio-groupbox/legend" :
    {
      alias : "radiobutton",
      include : "radiobutton",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          textColor : states.invalid ? "invalid" : "text-title",
          font      : "bold"
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      SCROLLAREA
    ---------------------------------------------------------------------------
    */

    "scrollarea" : "widget",

    "scrollarea/corner" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background-application"
        };
      }
    },

    "scrollarea/pane" : "widget",
    "scrollarea/scrollbar-x" : "scrollbar",
    "scrollarea/scrollbar-y" : "scrollbar",






    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */

    "scrollbar" :
    {
      style : function(states)
      {
        if (states["native"]) {
          return {};
        }

        return {
          width     : states.horizontal ? undefined : 16,
          height    : states.horizontal ? 16 : undefined,
          decorator : (states.horizontal ? "scrollbar-horizontal" : "scrollbar-vertical"),
          padding   : 1
        };
      }
    },

    "scrollbar/slider" :
    {
      alias : "slider",

      style : function(states)
      {
        return {
          padding : states.horizontal ? [0, 1, 0, 1] : [1, 0, 1, 0]
        };
      }
    },

    "scrollbar/slider/knob" :
    {
      include : "button-frame",

      style : function(states)
      {

        var decorator = states.horizontal ? "scrollbar-slider-horizontal" :
                                            "scrollbar-slider-vertical";
        if (states.disabled) {
          decorator += "-disabled";
        }

        return {
          decorator : decorator,
          minHeight : states.horizontal ? undefined : 9,
          minWidth  : states.horizontal ? 9 : undefined,
          padding : undefined,
          margin : 0
        };
      }
    },

    "scrollbar/button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        var icon = "decoration/scrollbar/scrollbar-";
        if (states.left) {
          icon += "left.png";
        } else if (states.right) {
          icon += "right.png";
        } else if (states.up) {
          icon += "up.png";
        } else {
          icon += "down.png";
        }

        if (states.left || states.right)
        {
          var paddingLeft = states.left ? 3 : 4;
          return {
            padding : [3, 0, 3, paddingLeft],
            icon : icon,
            width: 15,
            height: 14,
            margin: 0
          };
        }
        else
        {

          return {
            padding : 3,
            icon : icon,
            width: 14,
            height: 15,
            margin: 0
          };
        }
      }
    },

    "scrollbar/button-begin" : "scrollbar/button",
    "scrollbar/button-end" : "scrollbar/button",





    /*
    ---------------------------------------------------------------------------
      SLIDER
    ---------------------------------------------------------------------------
    */

    "slider" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        return {
          decorator : decorator
        };
      }
    },

    "slider/knob" :
    {
      include : "button-frame",

      style : function(states)
      {
        return {
          decorator : states.disabled ? "scrollbar-slider-horizontal-disabled" :
                                        "scrollbar-slider-horizontal",
          height : 14,
          width : 14,
          padding: 0,
          margin: 0
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    "list" :
    {
      alias : "scrollarea",

      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        return {
          backgroundColor : "background-light",
          decorator : decorator
        };
      }
    },

    "list/pane" : "widget",

    "listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          padding   : states.dragover ? [4, 4, 2, 4] : 4,
          textColor : states.selected ? "text-selected" : undefined,
          decorator : states.selected ? "selected" : undefined,
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      SLIDEBAR
    ---------------------------------------------------------------------------
    */

    "slidebar" : {},
    "slidebar/scrollpane" : {},
    "slidebar/content" : {},

    "slidebar/button-forward" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          padding : 5,
          center : true,
          icon : states.vertical ?
            "decoration/arrows/down.png" :
            "decoration/arrows/right.png"
        };
      }
    },

    "slidebar/button-backward" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          padding : 5,
          center : true,
          icon : states.vertical ?
            "decoration/arrows/up.png" :
            "decoration/arrows/left.png"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tabview" :
    {
      style : function(states)
      {
        return {
          contentPadding : 16
        };
      }
    },

    "tabview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        var result =
        {
          marginBottom : states.barTop ? -1 : 0,
          marginTop : states.barBottom ? -4 : 0,
          marginLeft : states.barRight ? -3: 0,
          marginRight : states.barLeft ? -1 : 0,
          paddingTop : 0,
          paddingRight : 0,
          paddingBottom : 0,
          paddingLeft : 0
        };

        if (states.barTop || states.barBottom)
        {
          result.paddingLeft = 5;
          result.paddingRight = 7;
        }
        else
        {
          result.paddingTop = 5;
          result.paddingBottom = 7;
        }

        return result;
      }
    },

    "tabview/bar/button-forward" :
    {
      include : "slidebar/button-forward",
      alias : "slidebar/button-forward",

      style : function(states)
      {
        if (states.barTop || states.barBottom)
        {
          return {
            marginTop : 2,
            marginBottom: 2
          };
        }
        else
        {
          return {
            marginLeft : 2,
            marginRight : 2
          };
        }
      }
    },

    "tabview/bar/button-backward" :
    {
      include : "slidebar/button-backward",
      alias : "slidebar/button-backward",

      style : function(states)
      {
        if (states.barTop || states.barBottom)
        {
          return {
            marginTop : 2,
            marginBottom: 2
          };
        }
        else
        {
          return {
            marginLeft : 2,
            marginRight : 2
          };
        }
      }
    },

    "tabview/bar/scrollpane" : {},

    "tabview/pane" :
    {
      style : function(states)
      {
        return {
          decorator : "tabview-pane",

          marginBottom : states.barBottom ? -1 : 0,
          marginTop : states.barTop ? -1 : 0,
          marginLeft : states.barLeft ? -1 : 0,
          marginRight : states.barRight ? -1 : 0
        };
      }
    },

    "tabview-page" : {
      alias : "widget",
      include : "widget",

      style : function(states) {
        // is used for the padding of the pane
        return {
          padding : [4, 3]
        };
      }
    },

    "tabview-page/button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator, padding=0;
        var marginTop=0, marginBottom=0, marginLeft=0, marginRight=0;

        if (states.checked)
        {
          if (states.barTop)
          {
            decorator = "tabview-page-button-top-active";
            padding = [5, 11];
            marginLeft = states.firstTab ? 0 : -5;
            marginRight = states.lastTab ? 0 : -5;
          }
          else if (states.barBottom)
          {
            decorator = "tabview-page-button-bottom-active";
            padding = [5, 11];
            marginLeft = states.firstTab ? 0 : -5;
            marginRight = states.lastTab ? 0 : -5;
            marginTop = 3;
          }
          else if (states.barRight)
          {
            decorator = "tabview-page-button-right-active";
            padding = [5, 10];
            marginTop = states.firstTab ? 0 : -5;
            marginBottom = states.lastTab ? 0 : -5;
            marginLeft = 2;
          }
          else
          {
            decorator = "tabview-page-button-left-active";
            padding = [5, 10];
            marginTop = states.firstTab ? 0 : -5;
            marginBottom = states.lastTab ? 0 : -5;
          }
        }
        else
        {
          if (states.barTop)
          {
            decorator = "tabview-page-button-top-inactive";
            padding = [3, 9];
            marginTop = 4;
            marginLeft = states.firstTab ? 5 : 1;
            marginRight = 1;
          }
          else if (states.barBottom)
          {
            decorator = "tabview-page-button-bottom-inactive";
            padding = [3, 9];
            marginBottom = 4;
            marginLeft = states.firstTab ? 5 : 1;
            marginRight = 1;
            marginTop = 3;
          }
          else if (states.barRight)
          {
            decorator = "tabview-page-button-right-inactive";
            padding = [3, 9];
            marginRight = 5;
            marginTop = states.firstTab ? 5 : 1;
            marginBottom = 1;
            marginLeft = 3;
          }
          else
          {
            decorator = "tabview-page-button-left-inactive";
            padding = [3, 9];
            marginLeft = 5;
            marginTop = states.firstTab ? 5 : 1;
            marginBottom = 1;
            marginRight = 1;
          }
        }

        return {
          zIndex : states.checked ? 10 : 5,
          decorator : decorator,
          padding   : padding,
          marginTop : marginTop,
          marginBottom : marginBottom,
          marginLeft : marginLeft,
          marginRight : marginRight,
          textColor : states.disabled ? "text-disabled" :
            states.checked ? "text-active" : "text-inactive"
        };
      }
    },

    "tabview-page/button/label" :
    {
      alias : "label",

      style : function(states)
      {
        return {
          padding : states.focused ? [0, 1, 0, 1] : [1, 2, 1, 2],
          //margin : states.focused ? 0 : 1,
          decorator : states.focused ? "keyboard-focus" : undefined
        };
      }
    },

    "tabview-page/button/close-button" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          icon : "qx/icon/Tango/16/actions/window-close.png"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar",
          spacing : 2
        };
      }
    },

    "toolbar/part" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-part",
          spacing : 2
        };
      }
    },

    "toolbar/part/container" :
    {
      style : function(states)
      {
        return {
          paddingLeft : 2,
          paddingRight : 2
        };
      }
    },

    "toolbar/part/handle" :
    {
      style : function(states)
      {
        return {
          source : "decoration/toolbar/toolbar-handle-knob.gif",
          marginLeft : 3,
          marginRight : 3
        };
      }
    },

    "toolbar-button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator;
        if (
          states.pressed ||
          (states.checked && !states.hovered) ||
          (states.checked && states.disabled))
        {
          decorator = "toolbar-button-checked";
        } else if (states.hovered && !states.disabled) {
          decorator = "toolbar-button-hovered";
        }

        return {
          marginTop : 2,
          marginBottom : 2,
          padding : (states.pressed || states.checked || states.hovered) &&
            !states.disabled || (states.disabled && states.checked) ? 3 : 5,
          decorator : decorator
        };
      }
    },

    "toolbar-menubutton" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          showArrow : true
        };
      }
    },

    "toolbar-menubutton/arrow" :
    {
      alias : "image",
      include : "image",

      style : function(states)
      {
        return {
          source : "decoration/arrows/down-small.png"
        };
      }
    },

    "toolbar-splitbutton" :
    {
      style : function(states)
      {
        return {
          marginTop : 2,
          marginBottom : 2
        };
      }
    },

    "toolbar-splitbutton/button" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down.png",
          marginTop : undefined,
          marginBottom : undefined
        };
      }
    },

    "toolbar-splitbutton/arrow" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        if (states.pressed || states.checked || (states.hovered && !states.disabled)) {
          var padding = 1;
        } else {
          var padding = 3;
        }

        return {
          padding : padding,
          icon : "decoration/arrows/down.png",
          marginTop : undefined,
          marginBottom : undefined
        };
      }
    },

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-separator",
          margin    : 7
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree" : "list",

    "tree-item" :
    {
      style : function(states)
      {
        var decorator = states.selected ? "selected" : undefined;

        return {
          padding    : [ 2, 6 ],
          textColor  : states.selected ? "text-selected" : undefined,
          decorator  : decorator,
          opacity : states.drag ? 0.5 : undefined
        };
      }
    },

    "tree-item/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          paddingRight : 5
        };
      }
    },

    "tree-item/label" : "label",

    "tree-item/open" :
    {
      include : "image",

      style : function(states)
      {
        var icon;
        if (states.selected && states.opened)
        {
          icon = "decoration/tree/open-selected.png";
        }
        else if (states.selected && !states.opened)
        {
          icon = "decoration/tree/closed-selected.png";
        }
        else if (states.opened)
        {
          icon = "decoration/tree/open.png";
        }
        else
        {
          icon = "decoration/tree/closed.png";
        }

        return {
          padding : [0, 5, 0, 2],
          source  : icon
        };
      }
    },

    "tree-folder" :
    {
      include : "tree-item",
      alias : "tree-item",

      style : function(states)
      {
        var icon, iconOpened;
        if (states.small) {
          icon = states.opened ? "icon/16/places/folder-open.png" : "icon/16/places/folder.png";
          iconOpened = "icon/16/places/folder-open.png";
        } else if (states.large) {
          icon = states.opened ? "icon/32/places/folder-open.png" : "icon/32/places/folder.png";
          iconOpened = "icon/32/places/folder-open.png";
        } else {
          icon = states.opened ? "icon/22/places/folder-open.png" : "icon/22/places/folder.png";
          iconOpened = "icon/22/places/folder-open.png";
        }

        return {
          icon : icon,
          iconOpened : iconOpened
        };
      }
    },

    "tree-file" :
    {
      include : "tree-item",
      alias : "tree-item",

      style : function(states)
      {
        return {
          icon :
            states.small ? "icon/16/mimetypes/office-document.png" :
            states.large ? "icon/32/mimetypes/office-document.png" :
            "icon/22/mimetypes/office-document.png"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual" : "table",

    "treevirtual-folder" :
    {
      style : function(states)
      {
        return {
          icon : states.opened ?
            "icon/16/places/folder-open.png" :
            "icon/16/places/folder.png"
        };
      }
    },

    "treevirtual-file" :
    {
      include : "treevirtual-folder",
      alias : "treevirtual-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/office-document.png"
        };
      }
    },

    "treevirtual-line" :
    {
      style : function(states)
      {
        return {
          icon : "qx/static/blank.gif"
        };
      }
    },

    "treevirtual-contract" :
    {
      style : function(states)
      {
        return {
          icon : "decoration/tree/open.png",
          paddingLeft : 5,
          paddingTop : 2
        };
      }
    },

    "treevirtual-expand" :
    {
      style : function(states)
      {
        return {
          icon : "decoration/tree/closed.png",
          paddingLeft : 5,
          paddingTop : 2
        };
      }
    },

    "treevirtual-only-contract" : "treevirtual-contract",
    "treevirtual-only-expand" : "treevirtual-expand",
    "treevirtual-start-contract" : "treevirtual-contract",
    "treevirtual-start-expand" : "treevirtual-expand",
    "treevirtual-end-contract" : "treevirtual-contract",
    "treevirtual-end-expand" : "treevirtual-expand",
    "treevirtual-cross-contract" : "treevirtual-contract",
    "treevirtual-cross-expand" : "treevirtual-expand",

    "treevirtual-end" :
    {
      style : function(states)
      {
        return {
          icon : "qx/static/blank.gif"
        };
      }
    },

    "treevirtual-cross" :
    {
      style : function(states)
      {
        return {
          icon : "qx/static/blank.gif"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      TOOL TIP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "background-tip",
          padding : [ 1, 3, 2, 3 ],
          offset : [ 15, 5, 5, 5 ]
        };
      }
    },

    "tooltip/atom" : "atom",

    "tooltip-error" : {
      style : function(states)
      {
        return {
          placeMethod: "widget",
          offset: [-3, 1, 0, 0],
          arrowPosition : states.placementLeft ? "left" : "right",
          position: "right-top",
          showTimeout: 100,
          hideTimeout: 10000,
          padding: [0, 4, 4, 0]
        };
      }
    },

    "tooltip-error/arrow" : {
      include : "image",

      style : function(states)
      {
        var source = states.placementLeft ?
          "decoration/form/tooltip-error-arrow-right.png" : "decoration/form/tooltip-error-arrow.png";
        return {
          source : source,
          padding : [6, 0, 0, 0],
          zIndex : 10000001
        };
      }
    },

    "tooltip-error/atom" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          textColor: "text-selected",
          backgroundColor : undefined,
          decorator: "tooltip-error",
          font: "bold",
          padding: [3, 4, 4, 4],
          margin: [1, 0, 0, 0],
          maxWidth: 333
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      style : function(states)
      {
        return {
          decorator : states.showStatusbar ? "window-incl-statusbar" :
            "window",
          contentPadding : [ 10, 10, 10, 10 ],
          margin : states.maximized ? 0 : [0, 5, 5, 0]
        };
      }
    },

    "window-resize-frame" :
    {
      style : function(states)
      {
        return {
          decorator : states.showStatusbar ?
            "window-resize-frame-incl-statusbar" : "window-resize-frame"
        };
      }
    },

    "window/pane" :
    {
      style : function(states)
      {
        return {
          decorator : "window-pane"
        };
      }
    },

    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          decorator : (states.active ? "window-captionbar-active" :
            "window-captionbar-inactive"),
          textColor : states.active ? "window-caption-active-text" : "text-gray",
          minHeight : 26,
          paddingRight : 2
        };
      }
    },

    "window/icon" :
    {
      style : function(states)
      {
        return {
          margin : [ 5, 0, 3, 6 ]
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          alignY      : "middle",
          font        : "bold",
          marginLeft  : 6,
          marginRight : 12
        };
      }
    },

    "window/minimize-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/minimize-active-hovered.png" :
                                                  "decoration/window/minimize-active.png" :
                                                  "decoration/window/minimize-inactive.png",
          margin : [ 4, 8, 2, 0 ]
        };
      }
    },

    "window/restore-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/restore-active-hovered.png" :
                                                  "decoration/window/restore-active.png" :
                                                  "decoration/window/restore-inactive.png",
          margin : [ 5, 8, 2, 0 ]
        };
      }
    },

    "window/maximize-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/maximize-active-hovered.png" :
                                                  "decoration/window/maximize-active.png" :
                                                  "decoration/window/maximize-inactive.png",
          margin : [ 4, 8, 2, 0 ]
        };
      }
    },

    "window/close-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/close-active-hovered.png" :
                                                  "decoration/window/close-active.png" :
                                                  "decoration/window/close-inactive.png",
          margin : [ 4, 8, 2, 0 ]
        };
      }
    },

    "window/statusbar" :
    {
      style : function(states)
      {
        return {
          padding   : [ 2, 6 ],
          decorator : "window-statusbar",
          minHeight : 18
        };
      }
    },

    "window/statusbar-text" :
    {
      style : function(states)
      {
        return {
          font : "small"
        };
      }
    },







    /*
    ---------------------------------------------------------------------------
      IFRAME
    ---------------------------------------------------------------------------
    */

    "iframe" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer" :
    {
      style : function(states)
      {
        return {
          decorator : "pane"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" :
    {
      style : function(states)
      {
        return {
          decorator : "splitpane"
        };
      }
    },

    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 3 : undefined,
          height : states.vertical ? 3 : undefined,
          backgroundColor : "background-splitpane"
        };
      }
    },

    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : states.horizontal ? "decoration/splitpane/knob-horizontal.png" : "decoration/splitpane/knob-vertical.png"
        };
      }
    },

    "splitpane/slider" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 3 : undefined,
          height : states.vertical ? 3 : undefined,
          backgroundColor : "background-splitpane"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      SELECTBOX
    ---------------------------------------------------------------------------
    */

    "selectbox" : "button-frame",

    "selectbox/atom" : "atom",
    "selectbox/popup" : "popup",

    "selectbox/list" : {
      alias : "list"
    },

    "selectbox/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          source : "decoration/arrows/down.png",
          paddingLeft : 5
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        return {
          padding : 2,
          decorator : decorator,
          backgroundColor : "background-light"
        };
      }
    },

    "datechooser/navigation-bar" : {},

    "datechooser/nav-button"  :
    {
      include : "button-frame",
      alias : "button-frame",

      style : function(states)
      {
        var result = {
          padding : [ 2, 4 ]
        };

        if (states.lastYear) {
          result.icon = "decoration/arrows/rewind.png";
          result.marginRight = 1;
        } else if (states.lastMonth) {
          result.icon = "decoration/arrows/left.png";
        } else if (states.nextYear) {
          result.icon = "decoration/arrows/forward.png";
          result.marginLeft = 1;
        } else if (states.nextMonth) {
          result.icon = "decoration/arrows/right.png";
        }

        return result;
      }
    },

    "datechooser/last-year-button-tooltip" : "tooltip",
    "datechooser/last-month-button-tooltip" : "tooltip",
    "datechooser/next-year-button-tooltip" : "tooltip",
    "datechooser/next-month-button-tooltip" : "tooltip",

    "datechooser/last-year-button" : "datechooser/nav-button",
    "datechooser/last-month-button" : "datechooser/nav-button",
    "datechooser/next-month-button" : "datechooser/nav-button",
    "datechooser/next-year-button" : "datechooser/nav-button",

    "datechooser/month-year-label" :
    {
      style : function(states)
      {
        return {
          font      : "bold",
          textAlign : "center",
          textColor: states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "datechooser/date-pane" :
    {
      style : function(states)
      {
        return {
          textColor: states.disabled ? "text-disabled" : undefined,
          marginTop : 2
        };
      }
    },

    "datechooser/weekday" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : states.weekend ? "text-light" : undefined,
          textAlign : "center",
          paddingTop : 2,
          backgroundColor : "background-medium"
        };
      }
    },

    "datechooser/week" :
    {
      style : function(states)
      {
        return {
          textAlign : "center",
          padding   : [ 2, 4 ],
          backgroundColor : "background-medium"
        };
      }
    },

    "datechooser/day" :
    {
      style : function(states)
      {
        var decorator = states.disabled ? undefined : states.selected ? "selected" : undefined;

        return {
          textAlign : "center",
          decorator : decorator,
          textColor : states.disabled ? "text-disabled" : states.selected ? "text-selected" : states.otherMonth ? "text-light" : undefined,
          font      : states.today ? "bold" : undefined,
          padding   : [ 2, 4 ]
        };
      }
    },







    /*
    ---------------------------------------------------------------------------
      COMBOBOX
    ---------------------------------------------------------------------------
    */

    "combobox" :
    {
      style : function(states)
      {
        var decorator;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (focused && invalid && !disabled) {
          decorator = "input-focused-invalid";
        } else if (focused && !invalid && !disabled) {
          decorator = "input-focused";
        } else if (disabled) {
          decorator = "input-disabled";
        } else if (!focused && invalid && !disabled) {
          decorator = "border-invalid";
        } else {
          decorator = "input";
        }

        return {
          decorator : decorator
        };
      }
    },

    "combobox/popup" : "popup",

    "combobox/list" : {
      alias : "list"
    },

    "combobox/button" :
    {
      include : "button-frame",
      alias   : "button-frame",

      style : function(states, superStyles)
      {
        var ret = {
          icon : "decoration/arrows/down.png",
          padding : [superStyles.padding[0], superStyles.padding[1] - 6],
          margin : undefined
        };

        if (states.selected) {
          ret.decorator = "button-focused";
        }

        return ret;
      }
    },

    "combobox/textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

   "menu" :
    {
      style : function(states)
      {
        var result =
        {
          decorator : "menu",
          spacingX : 6,
          spacingY : 1,
          iconColumnWidth : 16,
          arrowColumnWidth : 4,
          placementModeY : states.submenu || states.contextmenu ? "best-fit" : "keep-align"
        };

        if (states.submenu)
        {
          result.position = "right-top";
          result.offset = [-2, -3];
        }

        return result;
      }
    },

    "menu/slidebar" : "menu-slidebar",

    "menu-slidebar" : "widget",

    "menu-slidebar-button" :
    {
      style : function(states)
      {
        var decorator = states.hovered  ? "selected" : undefined;

        return {
          decorator : decorator,
          padding : 7,
          center : true
        };
      }
    },

    "menu-slidebar/button-backward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : states.hovered ? "decoration/arrows/up-invert.png" : "decoration/arrows/up.png"
        };
      }
    },

    "menu-slidebar/button-forward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : states.hovered ? "decoration/arrows/down-invert.png" : "decoration/arrows/down.png"
        };
      }
    },

    "menu-separator" :
    {
      style : function(states)
      {
        return {
          height : 0,
          decorator : "menu-separator",
          margin    : [ 4, 2 ]
        };
      }
    },

    "menu-button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = states.selected ? "selected" : undefined;

        return {
          decorator : decorator,
          textColor : states.selected ? "text-selected" : undefined,
          padding   : [ 4, 6 ]
        };
      }
    },

    "menu-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          alignY : "middle"
        };
      }
    },

    "menu-button/label" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          padding : 1
        };
      }
    },

    "menu-button/shortcut" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          marginLeft : 14,
          padding : 1
        };
      }
    },

    "menu-button/arrow" :
    {
      include : "image",

      style : function(states)
      {
        return {
          source : states.selected ? "decoration/arrows/right-invert.png" : "decoration/arrows/right.png",
          alignY : "middle"
        };
      }
    },

    "menu-checkbox" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? undefined :
            states.selected ? "decoration/menu/checkbox-invert.gif" :
              "decoration/menu/checkbox.gif"
        };
      }
    },

    "menu-radiobutton" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? undefined :
            states.selected ? "decoration/menu/radiobutton-invert.gif" :
              "decoration/menu/radiobutton.gif"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

   "menubar" :
   {
     style : function(states)
     {
       return {
         decorator : "menubar"
       };
     }
   },

   "menubar-button" :
   {
     alias : "atom",

     style : function(states)
     {
       var decorator = (states.pressed || states.hovered) && !states.disabled ? "selected" : undefined;

       return {
         decorator : decorator,
         textColor : states.pressed || states.hovered ? "text-selected" : undefined,
         padding   : [ 3, 8 ]
       };
     }
   },



    /*
    ---------------------------------------------------------------------------
      COLOR SELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" : "widget",
    "colorselector/control-bar" : "widget",
    "colorselector/control-pane": "widget",
    "colorselector/visual-pane" : "groupbox",
    "colorselector/preset-grid" : "widget",

    "colorselector/colorbucket":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          width : 16,
          height : 16
        };
      }
    },

    "colorselector/preset-field-set" : "groupbox",
    "colorselector/input-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 20
        };
      }
    },

    "colorselector/preview-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 20
        };
      }
    },


    "colorselector/hex-field-composite" : "widget",
    "colorselector/hex-field" : "textfield",

    "colorselector/rgb-spinner-composite" : "widget",
    "colorselector/rgb-spinner-red" : "spinner",
    "colorselector/rgb-spinner-green" : "spinner",
    "colorselector/rgb-spinner-blue" : "spinner",

    "colorselector/hsb-spinner-composite" : "widget",
    "colorselector/hsb-spinner-hue" : "spinner",
    "colorselector/hsb-spinner-saturation" : "spinner",
    "colorselector/hsb-spinner-brightness" : "spinner",

    "colorselector/preview-content-old":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          width : 50,
          height : 10
        };
      }
    },

    "colorselector/preview-content-new":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          backgroundColor : "background-light",
          width : 50,
          height : 10
        };
      }
    },


    "colorselector/hue-saturation-field":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          margin : 5
        };
      }
    },

    "colorselector/brightness-field":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          margin : [5, 7]
        };
      }
    },

    "colorselector/hue-saturation-pane": "widget",
    "colorselector/hue-saturation-handle" : "widget",
    "colorselector/brightness-pane": "widget",
    "colorselector/brightness-handle" : "widget",




    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */

    "colorpopup" :
    {
      alias : "popup",
      include : "popup",

      style : function(states)
      {
        return {
          padding : 5,
          backgroundColor : "background-application"
        };
      }
    },

    "colorpopup/field":
    {
      style : function(states)
      {
        return {
          decorator : "main",
          margin : 2,
          width : 14,
          height : 14,
          backgroundColor : "background-light"
        };
      }
    },

    "colorpopup/selector-button" : "button",
    "colorpopup/auto-button" : "button",
    "colorpopup/preview-pane" : "groupbox",

    "colorpopup/current-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginLeft : 4,
          decorator : "main",
          allowGrowX : true
        };
      }
    },

    "colorpopup/selected-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginRight : 4,
          decorator : "main",
          allowGrowX : true
        };
      }
    },

    "colorpopup/colorselector-okbutton":
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-ok.png"
        };
      }
    },

    "colorpopup/colorselector-cancelbutton":
   {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-cancel.png"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" :
    {
      alias : "widget",

      style : function(states)
      {
        return {
          decorator : "table"
        };
      }
    },

    "table/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "table-statusbar",
          padding   : [ 0, 2 ]
        };
      }
    },

    "table/column-button" :
    {
      alias : "button-frame",

      style : function(states)
      {
        return {
          decorator : "table-scroller-header",
          padding   : 3,
          icon      : "decoration/table/select-column-order.png"
        };
      }
    },

    "table-column-reset-button" :
    {
      include : "menu-button",
      alias : "menu-button",

      style : function()
      {
        return {
          icon : "icon/16/actions/view-refresh.png"
        };
      }
    },

    "table-scroller" : "widget",

    "table-scroller/scrollbar-x": "scrollbar",
    "table-scroller/scrollbar-y": "scrollbar",

    "table-scroller/header":
    {
      style : function(states)
      {
        return {
          decorator : "table-scroller-header",
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "table-scroller/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "table-pane"
        };
      }
    },

    "table-scroller/focus-indicator" :
    {
      style : function(states)
      {
        return {
          decorator : "table-scroller-focus-indicator"
        };
      }
    },

    "table-scroller/resize-line" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "border-separator",
          width : 2
        };
      }
    },

    "table-header-cell" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          minWidth  : 13,
          minHeight : 20,
          padding   : states.hovered ? [ 3, 4, 2, 4 ] : [ 3, 4 ],
          decorator : states.hovered ? "table-header-cell-hovered" : "table-header-cell",
          sortIcon  : states.sorted ?
              (states.sortedAscending ? "decoration/table/ascending.png" : "decoration/table/descending.png")
              : undefined
        };
      }
    },

    "table-header-cell/label" :
    {
      style : function(states)
      {
        return {
          minWidth : 0,
          alignY : "middle",
          paddingRight : 5
        };
      }
    },

    "table-header-cell/sort-icon" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          alignX : "right",
          opacity : states.disabled ? 0.3 : 1
        };
      }
    },

    "table-header-cell/icon" :
    {
      style : function(states)
      {
        return {
          minWidth : 0,
          alignY : "middle",
          paddingRight : 5,
          opacity : states.disabled ? 0.3 : 1
        };
      }
    },

    "table-editor-textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
          padding : [ 2, 2 ],
          backgroundColor : "background-light"
        };
      }
    },

    "table-editor-selectbox" :
    {
      include : "selectbox",
      alias : "selectbox",

      style : function(states)
      {
        return {
          padding : [ 0, 2 ],
          backgroundColor : "background-light"
        };
      }
    },

    "table-editor-combobox" :
    {
      include : "combobox",
      alias : "combobox",

      style : function(states)
      {
        return {
          decorator : undefined,
          backgroundColor : "background-light"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE
    ---------------------------------------------------------------------------
    */

    "progressive-table-header" :
    {
      alias : "widget",

      style : function(states)
      {
        return {
          decorator : "progressive-table-header"
        };
      }
    },

    "progressive-table-header-cell" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          minWidth : 40,
          minHeight : 25,
          paddingLeft : 6,
          decorator : "progressive-table-header-cell"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "bold",
          textColor : "text-selected",
          padding : [8, 12],
          decorator : "app-header"
        };
      }
    },

    "app-header-label": "label",

    "app-splitpane" : {
      alias : "splitpane",
      style : function(states) {
        return {
          padding: 0
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      VIRTUAL WIDGETS
    ---------------------------------------------------------------------------
    */

    "virtual-list" : "list",
    "virtual-list/row-layer" : "row-layer",

    "row-layer" : "widget",

    "group-item" :
    {
      include : "label",
      alias : "label",

      style : function(states)
      {
        return {
          padding : 4,
          decorator : "group-item",
          textColor : "groupitem-text",
          font: "bold"
        };
      }
    },

    "virtual-selectbox" : "selectbox",
    "virtual-selectbox/dropdown" : "popup",
    "virtual-selectbox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-combobox" : "combobox",
    "virtual-combobox/dropdown" : "popup",
    "virtual-combobox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          itemHeight : 26
        };
      }
    },

    "virtual-tree-folder" : "tree-folder",
    "virtual-tree-file" : "tree-file",

    "column-layer" : "widget",

    "cell" :
    {
      style : function(states)
      {
        return {
          textColor: states.selected ? "text-selected" : "text-label",
          padding: [3, 6],
          font: "default"
        };
      }
    },

    "cell-string" : "cell",
    "cell-number" :
    {
      include : "cell",
      style : function(states)
      {
        return {
          textAlign : "right"
        };
      }
    },
    "cell-image" : "cell",
    "cell-boolean" :
    {
      include : "cell",
      style : function(states)
      {
        return {
          iconTrue : "decoration/table/boolean-true.png",
          iconFalse : "decoration/table/boolean-false.png"
        };
      }
    },
    "cell-atom" : "cell",
    "cell-date" : "cell",
    "cell-html" : "cell",



    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */
    "progressbar":
    {
      style: function(states) {
        return {
          decorator: "progressbar",
          padding: [1],
          backgroundColor: "progressbar-background",
          width : 200,
          height: 20
        };
      }
    },

    "progressbar/progress":
    {
      style: function(states)
      {
        return {
          decorator: (states.disabled ? "group-item" : "selected")
        };
      }
    }
  }
});
