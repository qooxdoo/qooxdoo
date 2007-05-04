/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

/* ************************************************************************


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

    "shadow" :
    {
      width : 1,
      color : "threedshadow"
    },

    "tooltip" :
    {
      width : 1,
      color : "tooltip-text"
    },

    "inset" :
    {
      width : 2,
      color : [ "threedshadow", "threedhighlight", "threedhighlight", "threedshadow" ],
      innerColor : [ "threeddarkshadow", "threedlightshadow", "threedlightshadow", "threeddarkshadow" ]
    },

    "outset" :
    {
      width : 2,
      color : [ "threedlightshadow", "threeddarkshadow", "threeddarkshadow", "threedlightshadow" ],
      innerColor : [ "threedhighlight", "threedshadow", "threedshadow", "threedhighlight" ]
    },

    "groove" :
    {
      width : 2,
      color : [ "threedshadow", "threedhighlight", "threedhighlight", "threedshadow" ],
      innerColor : [ "threedhighlight", "threedshadow", "threedshadow", "threedhighlight" ]
    },

    "ridge" :
    {
      width : 2,
      color : [ "threedhighlight", "threedshadow", "threedshadow", "threedhighlight" ],
      innerColor : [ "threedshadow", "threedhighlight", "threedhighlight", "threedshadow" ]
    },

    "inset-thin" :
    {
      width : 1,
      color : [ "threedshadow", "threedhighlight", "threedhighlight", "threedshadow" ]
    },

    "outset-thin" :
    {
      width : 1,
      color : [ "threedhighlight", "threedshadow", "threedshadow", "threedhighlight" ]
    },

    "divider-vertical" :
    {
      widthTop : 1,
      widthBottom : 1,
      colorTop: "threedshadow",
      colorBottom : "threedhighlight"
    },

    "divider-horizontal" :
    {
      widthLeft : 1,
      widthRight : 1,
      colorLeft : "threedhighlight",
      colorRight : "threedshadow"
    }
  }
});
