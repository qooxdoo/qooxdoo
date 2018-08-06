/* ************************************************************************

   SQville Software

   http://sqville.com

   Copyright:
     None

   License:
     MIT

   Authors:
     * Chris Eskew (chris.eskew@sqville.com)

************************************************************************ */

/**
 * The simple qooxdoo font theme.
 * 
 * 
 */
qx.Theme.define("qx.theme.clean.Font",
{
  
  fonts :
  {
    "default" :
    {
      size : 14,
      family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"],
      color : "text",
      lineHeight: 1.33
    },
    
    "default-bold" :
    {
      size : 14,
      family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"],
      color : "text",
      bold: true,
      lineHeight: 1.33
    },
    
    "window-header" :
    {
      size : 20,
      family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"],
      bold : false,
      lineHeight: 1.33
    },
    
    "unicode-icons-sm" :
    {
    	size : 20,
    	family : ["arial", "helvetica", "Segoe UI Symbol"]
    },
    
    "lbicon" :
    {
      size : 5,
      family : ["arial", "sans-serif"]
    },
    
    "odicon" :
    {
      size : 9
    },
    
    "icono" :
    {
      family : ["arial", "sans-serif"],
      size : 19
    },

    "bold" :
    {
      size : 13,
      family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"],
      bold : true,
      lineHeight: 1.33
    },
    
    "button" :
    {
      size : 13,
      family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"],
      bold : true,
      lineHeight: 1.33
    },
    
    "input" :
    {
    	size : 14,
    	family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"],
    	color : "text",
      lineHeight: 1.33
    },
   

    "headline" :
    {
      size : 24,
      family : ["sans-serif", "arial"]
    },

    "small" :
    {
      size : 11,
      family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"]
    },

    "monospace" :
    {
      size : 11,
      family : [ "DejaVu Sans Mono", "Courier New", "monospace" ]
    },
    
    "icssicon" :
    {
      size : 100,
      family : ["Lato", "Helvetica Neue", "arial", "Helvetica", "sans-serif"]
    },
    
    // Theme Browser Content Formatting
    "control-header" :
    {
    	include : "default",
    	size : 24,
    	bold : true
    },
    
    "control-header2" :
    {
    	include : "default",
    	size : 20
    }
  }
});
