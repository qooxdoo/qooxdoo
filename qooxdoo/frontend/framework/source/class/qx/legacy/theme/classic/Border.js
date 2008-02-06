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
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)

************************************************************************* */

/**
 * The default qooxdoo border theme.
 */
qx.Theme.define("qx.theme.classic.Border",
{
  title : "Classic",

  borders :
  {
    "black" :
    {
      width : 1,
      color : "black"
    },

    "white" :
    {
      width : 1,
      color : "white"
    },

    "dark-shadow" :
    {
      width : 1,
      color : "border-dark-shadow"
    },

    "light-shadow" :
    {
      width : 1,
      color : "border-light-shadow"
    },

    "light" :
    {
      width : 1,
      color : "border-light"
    },

    "dark" :
    {
      width : 1,
      color : "border-dark"
    },

    "tooltip" :
    {
      width : 1,
      color : "tooltip-text"
    },

    "inset" :
    {
      width : 2,
      color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
      innerColor : [ "border-dark", "border-light-shadow", "border-light-shadow", "border-dark" ]
    },

    "outset" :
    {
      width : 2,
      color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],
      innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
    },

    "groove" :
    {
      width : 2,
      color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
      innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
    },

    "ridge" :
    {
      width : 2,
      color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],
      innerColor : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ]
    },

    "inset-thin" :
    {
      width : 1,
      color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ]
    },

    "outset-thin" :
    {
      width : 1,
      color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
    },

    "resizer" :
    {
      width : [ 1, 3, 3, 1 ],
      color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],
      innerColor : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ]
    },

    "line-left" :
    {
      widthLeft : 1,
      colorLeft : "border-dark-shadow"
    },

    "line-right" :
    {
      widthRight : 1,
      colorRight : "border-dark-shadow"
    },

    "line-top" :
    {
      widthTop : 1,
      colorTop : "border-dark-shadow"
    },

    "line-bottom" :
    {
      widthBottom : 1,
      colorBottom : "border-dark-shadow"
    },

    "divider-vertical" :
    {
      widthTop : 1,
      colorTop : "border-dark-shadow"
    },

    "divider-horizontal" :
    {
      widthLeft : 1,
      colorLeft : "border-dark-shadow"
    }
  }
});
