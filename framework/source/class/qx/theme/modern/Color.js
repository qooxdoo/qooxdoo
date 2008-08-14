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
      BACKGROUND
    ---------------------------------------------------------------------------
    */
        
    "background" : "#dfdfdf",
    "background-light" : "#F2F2F2",

    // TODO: adjust these colors to Modern theme
    "background-focused" : "#F3F8FD",
    "background-focused-inner" : "#DBEAF9",
    "background-disabled" : "#F4F4F4",
    "background-selected" : "#3E6CA8",
    "background-field" : "#FCFCFC",



    /*
    ---------------------------------------------------------------------------
      TEXT
    ---------------------------------------------------------------------------
    */
    
    "text" : "#1a1a1a",
    "text-disabled" : [ 107, 106, 110 ],
    "text-selected" : "#fffefe",



    /*
    ---------------------------------------------------------------------------
      OTHER
    ---------------------------------------------------------------------------
    */
    
    "text-field" : "black",
    
    // Used for the "input-focused" and "focus" decorator
    "focus" : "#92B1DC",


    
    /*
    ---------------------------------------------------------------------------
      BORDER
    ---------------------------------------------------------------------------
    */
        
    "border" : "#2D405A",

    // these two borders are used in the appearance theme and for decorators
    "frame" : "#4d4d4d",
    "border-dark" : "#85878C",



    /*
    ---------------------------------------------------------------------------
      TABLE
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
      PROGRESSIVE TABLE
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
