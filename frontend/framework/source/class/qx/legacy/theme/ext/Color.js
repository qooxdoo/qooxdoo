/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Alexander Back (aback)

************************************************************************* */

/**
 * Ext-Clone color theme.
 */
qx.Theme.define("qx.theme.ext.Color",
{
  title : "Ext",

  extend : qx.theme.classic.color.Royale,

  colors :
  {
    "document-background"               : [ 243, 248, 253 ],
    "background"                        : [ 229, 244, 254 ],

    "border-light"                      : [ 101, 147, 207 ],
    "border-light-shadow"               : [ 253, 216, 137 ],
    "border-dark"                       : [ 0, 60, 116 ],
    "border-dark-shadow"                : [ 101, 147, 207 ],

    "effect"                            : [ 188, 212, 247 ],
    "selected"                          : [ 188, 212, 247 ],

    "text"                              : [ 31, 62, 117 ],
    "text-disabled"                     : [ 170, 170, 170 ],
    "text-selected"                     : [ 31, 62, 117 ],

    "tooltip"                           : [ 253, 255, 180 ],
    "tooltip-text"                      : "black",
    "tooltip-border"                    : [ 252, 201, 13 ],

    "menu"                              : "white",
    "list"                              : [ 250, 251, 254 ],
    "field"                             : [ 188, 212, 247 ],

    "button"                            : [ 188, 212, 247 ],
    "button-hover"                      : [ 229, 244, 254 ],
    "button-abandoned"                  : [ 235, 233, 237 ],

    "window-active-caption-text"        : [ 255, 255, 255 ],
    "window-inactive-caption-text"      : [ 128, 128, 128 ],
    "window-active-caption"             : [ 31, 62, 117 ],
    "window-inactive-caption"           : [ 220, 220, 220 ],

    "button-view-pane"                  : [ 255, 255, 255 ],
    "button-view-bar"                   : [ 188, 212, 247 ],
    "button-view-button"                : [ 188, 212, 247 ],
    "button-view-button-border"         : [ 31, 62, 117 ],

    "tab-view-pane"                     : [ 255, 255, 255 ],
    "tab-view-border"                   : [ 101, 147, 207 ],
    "tab-view-button"                   : [ 210, 214, 216 ],
    "tab-view-button-hover"             : [ 188, 212, 247 ],
    "tab-view-button-checked"           : [ 188, 212, 247 ],
    "tab-view-text"                     : [ 30, 60, 115 ],
    "tab-view-text-disabled"            : [ 102, 102, 102 ],

    "radio-view-pane"                   : [ 255, 255, 255 ],
    "radio-view-border"                 : [ 101, 147, 207 ],
    "radio-view-bar"                    : [ 188, 212, 247 ],
    "radio-view-button-checked"         : [ 250, 251, 254 ],

    "list-view"                         : "white",
    "list-view-border"                  : [ 101, 147, 207 ],
    "list-view-header"                  : [ 235, 234, 219 ],
    "list-view-header-border"           : [ 226, 226, 226 ],
    "list-view-header-separator-border" : [ 214, 213, 217 ],
    "list-view-header-border-hover"     : [ 249, 177, 25 ],
    "list-view-header-cell-hover"       : [ 250, 249, 244 ],
    "list-view-content-cell"            : [ 90, 138, 211 ],

    "date-chooser"                      : "white",
    "datec-chooser-title"               : [ 31, 62, 117 ],
    "date-chooser-day"                  : [ 31, 62, 117 ],

    "table-pane"                        : "white",
    "table-header"                      : [ 244, 248, 254 ],
    "table-header-border"               : [ 176, 199, 230 ],
    "table-header-border-hover"         : [ 101, 147, 207 ],
    "table-header-cell"                 : [ 244, 248, 254 ],
    "table-header-cell-hover"           : [ 255, 255, 255 ],
    "table-focus-indicator"             : [ 197, 200, 202 ],
    "table-row-background-focused-selected" : [ 90, 138, 211 ],
    "table-row-background-focused"      : [ 221, 238, 255 ],
    "table-row-background-selected"     : [ 101, 147, 207 ],
    "table-row-background-even"         : [ 239, 245, 253 ],
    "table-row-background-odd"          : [ 255, 255, 255 ],
    "table-row-selected"                : [ 255, 255, 255 ],
    "table-row"                         : [ 0, 0, 0],

    "general-border"                    : [ 101, 147, 207 ],

    "toolbar-background"                : [ 201, 222, 250 ],
    "toolbar-border"                    : [ 152, 192, 244 ],

    "group-box-legend"                  : [ 101, 147, 207 ],

    "splitpane-slider-dragging"         : [ 0, 60, 116 ]
  }
});
