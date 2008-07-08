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

************************************************************************ */

/**
 * Modern color theme
 */
qx.Theme.define("qx.theme.modern.Color",
{
  title : "Modern",

  colors :
  {
    "background" : "#dfdfdf",
    "background-light" : "#F2F2F2",

    "text" : "#1a1a1a",
    "text-disabled" : [ 107, 106, 110 ],
    "text-selected" : "#fffefe",
    "text-focused" : "#1a1a1a", // TODO: check this one

    "input-text" : "black",

    "border" : "#2D405A",

    // TODO: adjust border colors
    "border-light" : "white",
    "border-light-shadow" : "#DCDFE4",
    "border-dark-shadow" : "#4d4d4d",
    "border-dark" : "#85878C",


    "focus" : "#92B1DC",

    "pane" : "#ededed",

    "selected" : "#00439d",
    "selected-inactive" : "#7a9bc8"
  }
});
