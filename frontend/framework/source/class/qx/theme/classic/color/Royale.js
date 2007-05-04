/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

/**
 * Windows Royale color theme
 */
qx.Theme.define("qx.theme.classic.color.Royale",
{
  title : "Windows Royale",

  colors :
  {
    // Unused
    activeborder        : [ 212, 208, 200 ],
    appworkspace        : [ 128, 128, 128 ],
    background          : [ 0, 0, 64 ],
    buttonhighlight     : [ 255, 255, 255 ],
    buttonshadow        : [ 167, 166, 170 ],
    inactiveborder      : [ 212, 208, 200 ],
    scrollbar           : [ 212, 208, 200 ],
    window              : [ 255, 255, 255 ],
    windowframe         : [ 0, 0, 0 ],
    windowtext          : [ 0, 0, 0 ],

    // Renamed
    activecaption       : [ 51, 94, 168 ],
    captiontext         : [ 255, 255, 255 ],
    inactivecaption     : [ 111, 161, 217 ],
    inactivecaptiontext : [ 255, 255, 255 ],
    buttonface          : [ 235, 233, 237 ],
    buttontext          : [ 0, 0, 0 ],
    graytext            : [ 167, 166, 170 ],
    highlight           : [ 51, 94, 168 ],
    highlighttext       : [ 255, 255, 255 ],
    infobackground      : [ 255, 255, 225 ],
    infotext            : [ 0, 0, 0 ],
    menu                : [ 255, 255, 255 ],
    menutext            : [ 0, 0, 0 ],

    // TODO
    threeddarkshadow    : [ 133, 135, 140 ],
    threedface          : [ 235, 233, 237 ],
    threedhighlight     : [ 255, 255, 255 ],
    threedlightshadow   : [ 220, 223, 228 ],
    threedshadow        : [ 167, 166, 170 ],

    // NEW
    "window-active-caption-text" : [ 255, 255, 255 ],  // captiontext
    "window-inactive-caption-text" : [ 255, 255, 255 ],  // inactivecaption
    "window-active-caption" : [ 51, 94, 168 ],  // activecaption
    "window-inactive-caption" : [ 111, 161, 217 ],  // inactivecaptiontext

    "button" : [ 235, 233, 237 ],  // buttonface
    "button-hover" : [ 135, 188, 229 ],  // NEW
    "button-abandoned" : [ 255, 240, 201 ],  // NEW
    "button-text" : [ 0, 0, 0 ],  // buttontext

    "effect" : [ 254, 200, 60 ], // NEW
    "selected" : [ 51, 94, 168 ],  // highlight

    "text" : [ 0, 0, 0 ],  // NEW
    "text-disabled" : [ 167, 166, 170 ],  // graytext
    "text-selected" : [ 255, 255, 255 ],  //highlighttext

    "tooltip" : [ 255, 255, 225 ],  // infobackground
    "tooltip-text" : [ 0, 0, 0 ],  // infotext

    "menu" : [ 255, 255, 255 ],  // menu

    "button-view" : [ 250, 251, 254 ],  // NEW
    "button-view-bar" : [ 225, 238, 255 ],  // NEW

    "tab-view-pane" : [ 250, 251, 254 ],  // NEW
    "tab-view-border" : [ 145, 165, 189 ],  // NEW
    "tab-view-button" : [ 225, 238, 255 ],  // NEW
    "tab-view-button-hover" : [ 250, 251, 254 ],  // NEW
    "tab-view-button-checked" : [ 250, 251, 254 ],  // NEW

    "radio-view-bar" : [ 225, 238, 255 ],  // NEW
    "radio-view-button-checked" : [ 250, 251, 254 ],  // NEW

    "list-view-border" : [ 167,166,170 ],  // NEW
    "list-view-header" : [ 242, 242, 242 ],  // NEW
    "list-view-header-border" : [ 214, 213, 217 ],  // NEW
    "list-view-header-cell-hover" : [ 255, 255, 255 ],  // NEW

    "date-chooser" : [ 255, 255, 255 ],  // NEW
    "date-chooser-title" : [ 98, 133, 186 ],  // NEW

    "table-pane" : [ 255, 255, 255 ],  // NEW
    "table-header" : [ 242, 242, 242 ],  // NEW
    "table-header-border" : [ 214, 213, 217 ],  // NEW
    "table-header-cell" : [ 235, 234, 219 ],  // NEW
    "table-header-cell-hover" : [ 255, 255, 255 ],  // NEW
    "table-focus-indicator" : [ 197, 200, 202 ],  // NEW
    "table-focus-indicator-active" : [ 179, 217, 255 ],  // NEW
  }
});
