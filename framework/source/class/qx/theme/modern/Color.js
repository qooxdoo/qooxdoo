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
     * Alexander Back (aback)

************************************************************************ */

/**
 * Modern color theme
 */
qx.Theme.define("qx.theme.modern.Color",
{
  title : "Modern",

  colors :
  {
    /*
    ---------------------------------------------------------------------------
      BACKGROUND COLORS
    ---------------------------------------------------------------------------
    */

    // core types
    "background-application" : "#DFDFDF",
    "background-light" : "#FCFCFC",
    "background-medium" : "#EAEAEA",

    // splitpane
    "background-splitpane" : "#AFAFAF",

    // tooltip, ...
    "background-tip" : "#ffffdd",

    // tables, ...
    "background-odd" : "#E4E4E4",




    /*
    ---------------------------------------------------------------------------
      TEXT COLORS
    ---------------------------------------------------------------------------
    */

    // types
    "text-label" : "#1a1a1a",
    "text-light" : "#909090",
    "text-input" : "#000000",

    // states
    "text-hovered"  : "#001533",
    "text-disabled" : "#6B6A6E",
    "text-selected" : "#fffefe",




    /*
    ---------------------------------------------------------------------------
      BORDER COLORS
    ---------------------------------------------------------------------------
    */

    // menus, tables, scrollbars, list, etc.
    "border-main" : "#4d4d4d",

    // between toolbars
    "border-separator" : "#808080",

    // text fields
    "border-input" : "#334866",

    // tab view, window
    "border-pane" : "#00204D",

    // buttons
    "border-button" : "#666666",

    // tables (vertical line)
    "border-column" : "#CCCCCC",

    // groupbox
    "border-group" : "#B6B6B6",

    // focus state: text fields
    "border-focused" : "#99C3FE",

    // background tabs
    "border-xxx" : "#667180",




    /*
    ---------------------------------------------------------------------------
      TABLE COLORS
    ---------------------------------------------------------------------------
    */

    "table-pane" : "white",

    // TODO: check these four colors
    "table-focus-indicator" : "#0073FF",
    "table-row-background-focused-selected" : "#084CA6",
    "table-row-background-focused" : "#0053DD",
    "table-row-background-selected" : "#084CA6",

    "table-row-background-even" : "#F4F4F4",
    "table-row-background-odd" : "#E4E4E4",
    "table-row-selected" : "white",
    "table-row" : "#1a1a1a",

    "table-row-line" : "#EEE",
    "table-column-line" : "#EEE",



    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE TABLE COLORS
    ---------------------------------------------------------------------------
    */

    "progressive-table-header"              : "#AAAAAA",

    "progressive-table-row-background-even" : "#F4F4F4",
    "progressive-table-row-background-odd"  : "#E4E4E4",

    "progressive-progressbar-background"         : "gray",
    "progressive-progressbar-indicator-done"     : "#CCCCCC",
    "progressive-progressbar-indicator-undone"   : "white",
    "progressive-progressbar-percent-background" : "gray",
    "progressive-progressbar-percent-text"       : "white"
  }
});
