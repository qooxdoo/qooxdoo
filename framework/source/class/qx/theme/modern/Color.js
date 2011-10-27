/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Alexander Steitz (aback)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Modern color theme
 */
qx.Theme.define("qx.theme.modern.Color",
{
  colors :
  {
    /*
    ---------------------------------------------------------------------------
      BACKGROUND COLORS
    ---------------------------------------------------------------------------
    */

    // application, desktop, ...
    "background-application" : "#DFDFDF",

    // pane color for windows, splitpanes, ...
    "background-pane" : "#F3F3F3",

    // textfields, ...
    "background-light" : "#FCFCFC",

    // headers, ...
    "background-medium" : "#EEEEEE",

    // splitpane
    "background-splitpane" : "#AFAFAF",

    // tooltip, ...
    "background-tip" : "#ffffdd",

    // error tooltip
    "background-tip-error": "#C72B2B",

    // tables, ...
    "background-odd" : "#E4E4E4",

    // html area
    "htmlarea-background" : "white",

    // progress bar
    "progressbar-background" : "white",




    /*
    ---------------------------------------------------------------------------
      TEXT COLORS
    ---------------------------------------------------------------------------
    */

    // other types
    "text-light" : "#909090",
    "text-gray" : "#4a4a4a",

    // labels
    "text-label" : "#1a1a1a",

    // group boxes
    "text-title" : "#314a6e",

    // text fields
    "text-input" : "#000000",

    // states
    "text-hovered"  : "#001533",
    "text-disabled" : "#7B7A7E",
    "text-selected" : "#fffefe",
    "text-active"   : "#26364D",
    "text-inactive" : "#404955",
    "text-placeholder" : "#CBC8CD",






    /*
    ---------------------------------------------------------------------------
      BORDER COLORS
    ---------------------------------------------------------------------------
    */

    "border-inner-scrollbar" : "white",

    // menus, tables, scrollbars, list, etc.
    "border-main" : "#4d4d4d",
    "menu-separator-top" : "#C5C5C5",
    "menu-separator-bottom" : "#FAFAFA",

    // between toolbars
    "border-separator" : "#808080",
    "border-toolbar-button-outer" : "#b6b6b6",
    "border-toolbar-border-inner" : "#f8f8f8",
    "border-toolbar-separator-right" : "#f4f4f4",
    "border-toolbar-separator-left" : "#b8b8b8",

    // text fields
    "border-input" : "#334866",
    "border-inner-input" : "white",

    // disabled text fields
    "border-disabled" : "#B6B6B6",

    // tab view, window
    "border-pane" : "#00204D",

    // buttons
    "border-button" : "#666666",

    // tables (vertical line)
    "border-column" : "#CCCCCC",

    // focus state of text fields
    "border-focused" : "#99C3FE",

    // invalid form widgets
    "invalid" : "#990000",
    "border-focused-invalid" : "#FF9999",

    // drag & drop
    "border-dragover" : "#33508D",

    "keyboard-focus" : "black",


    /*
    ---------------------------------------------------------------------------
      TABLE COLORS
    ---------------------------------------------------------------------------
    */

    // equal to "background-pane"
    "table-pane" : "#F3F3F3",

    // own table colors
    // "table-row-background-selected" and "table-row-background-focused-selected"
    // are inspired by the colors of the selection decorator
    "table-focus-indicator" : "#0880EF",
    "table-row-background-focused-selected" : "#084FAB",
    "table-row-background-focused" : "#80B4EF",
    "table-row-background-selected" : "#084FAB",

    // equal to "background-pane" and "background-odd"
    "table-row-background-even" : "#F3F3F3",
    "table-row-background-odd" : "#E4E4E4",

    // equal to "text-selected" and "text-label"
    "table-row-selected" : "#fffefe",
    "table-row" : "#1a1a1a",

    // equal to "border-collumn"
    "table-row-line" : "#CCC",
    "table-column-line" : "#CCC",

    "table-header-hovered" : "white",

    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE TABLE COLORS
    ---------------------------------------------------------------------------
    */

    "progressive-table-header"              : "#AAAAAA",
    "progressive-table-header-border-right" : "#F2F2F2",


    "progressive-table-row-background-even" : "#F4F4F4",
    "progressive-table-row-background-odd"  : "#E4E4E4",

    "progressive-progressbar-background"         : "gray",
    "progressive-progressbar-indicator-done"     : "#CCCCCC",
    "progressive-progressbar-indicator-undone"   : "white",
    "progressive-progressbar-percent-background" : "gray",
    "progressive-progressbar-percent-text"       : "white",


    /*
    ---------------------------------------------------------------------------
      CSS ONLY COLORS
    ---------------------------------------------------------------------------
    */
    "selected-start" : "#004DAD",
    "selected-end" : "#00368A",

    "tabview-background" : "#07125A",

    "shadow" : qx.core.Environment.get("css.rgba") ? "rgba(0, 0, 0, 0.4)" : "#999999",

    "pane-start" : "#FBFBFB",
    "pane-end" : "#F0F0F0",

    "group-background" : "#E8E8E8",
    "group-border" : "#B4B4B4",

    "radiobutton-background" : "#EFEFEF",

    "checkbox-border" : "#314A6E",
    "checkbox-focus" : "#87AFE7",
    "checkbox-hovered" : "#B2D2FF",
    "checkbox-hovered-inner" : "#D1E4FF",
    "checkbox-inner" : "#EEEEEE",
    "checkbox-start" : "#E4E4E4",
    "checkbox-end" : "#F3F3F3",
    "checkbox-disabled-border" : "#787878",
    "checkbox-disabled-inner" : "#CACACA",
    "checkbox-disabled-start" : "#D0D0D0",
    "checkbox-disabled-end" : "#D8D8D8",
    "checkbox-hovered-inner-invalid" : "#FAF2F2",
    "checkbox-hovered-invalid" : "#F7E9E9",

    "radiobutton-checked" : "#005BC3",
    "radiobutton-disabled" : "#D5D5D5",
    "radiobutton-checked-disabled" : "#7B7B7B",
    "radiobutton-hovered-invalid" : "#F7EAEA",

    "tooltip-error" : "#C82C2C",

    "scrollbar-start" : "#CCCCCC",
    "scrollbar-end" : "#F1F1F1",
    "scrollbar-slider-start" : "#EEEEEE",
    "scrollbar-slider-end" : "#C3C3C3",

    "button-border-disabled" : "#959595",
    "button-start" : "#F0F0F0",
    "button-end" : "#AFAFAF",
    "button-disabled-start" : "#F4F4F4",
    "button-disabled-end" : "#BABABA",
    "button-hovered-start" : "#F0F9FE",
    "button-hovered-end" : "#8EB8D6",
    "button-focused" : "#83BAEA",

    "border-invalid" : "#930000",

    "input-start" : "#F0F0F0",
    "input-end" : "#FBFCFB",
    "input-focused-start" : "#D7E7F4",
    "input-focused-end" : "#5CB0FD",
    "input-focused-inner-invalid" : "#FF6B78",
    "input-border-disabled" : "#9B9B9B",
    "input-border-inner" : "white",

    "toolbar-start" : "#EFEFEF",
    "toolbar-end" : "#DDDDDD",

    "window-border" : "#00204D",
    "window-border-caption" : "#727272",
    "window-caption-active-text" : "white",
    "window-caption-active-start" : "#084FAA",
    "window-caption-active-end" : "#003B91",
    "window-caption-inactive-start" : "#F2F2F2",
    "window-caption-inactive-end" : "#DBDBDB",
    "window-statusbar-background" : "#EFEFEF",

    "tabview-start" : "#FCFCFC",
    "tabview-end" : "#EEEEEE",
    "tabview-inactive" : "#777D8D",
    "tabview-inactive-start" : "#EAEAEA",
    "tabview-inactive-end" : "#CECECE",

    "table-header-start" : "#E8E8E8",
    "table-header-end" : "#B3B3B3",

    "menu-start" : "#E8E8E9",
    "menu-end" : "#D9D9D9",
    "menubar-start" : "#E8E8E8",

    "groupitem-start" : "#A7A7A7",
    "groupitem-end" : "#949494",
    "groupitem-text" : "white",
    "virtual-row-layer-background-even" : "white",
    "virtual-row-layer-background-odd" : "white"
  }
});