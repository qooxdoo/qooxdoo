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

   ======================================================================

   This class contains code based on the following work:

   * SWFFix
     http://www.swffix.org
     Version 0.3 (r17)

     Copyright:
       (c) 2007 SWFFix developers

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Geoff Stearns
       * Michael Williams
       * Bobby van der Sluis
       
************************************************************************ */

/* ************************************************************************

#module(bom)

************************************************************************ */

/**
 * Flash(TM) embed via script
 *
 * Include:
 * 
 * * Simple movie embedding (returning a cross-browser working DOM node)
 * * Support for custom parameters and attributes
 * * Support for Flash(TM) variables
 *
 * Does not include the following features from SWFFix:
 *
 * * Active content workarounds for already inserted movies (via markup)
 * * Express install support
 * * Transformation of standard conformance markup to cross browser support
 * * Support for alternative content (alt text)
 */
qx.Class.define("qx.bom.Flash",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      CREATION
    ---------------------------------------------------------------------------
    */

    /**
     * Creates an DOM element
     *
     * The dimension of the movie should define through CSS styles {@link qx.bom.element.Style}
     * 
     * It is possible to add these parameters as supported by Flash movies:
     *
     * * <code>play</code> - Possible values: true, false. Specifies whether the movie begins playing immediately on loading in the browser. The default value is true if this attribute is omitted.
     * * <code>loop</code> - Possible values: true, false. Specifies whether the movie repeats indefinitely or stops when it reaches the last frame. The default value is true if this attribute is omitted.
     * * <code>menu</code> - Possible values: true, false.
     * ** <code>true</code> displays the full menu, allowing the user a variety of options to enhance or control playback.
     * ** <code>false</code> displays a menu that contains only the Settings option and the About Flash option.
     * * <code>quality</code> - Possible values: low, high, autolow, autohigh, best.
     * ** <code>low</code> favors playback speed over appearance and never uses anti-aliasing.
     * ** <code>autolow</code> emphasizes speed at first but improves appearance whenever possible. Playback begins with anti-aliasing turned off. If the Flash Player detects that the processor can handle it, anti-aliasing is turned on.
     * ** <code>autohigh</code> emphasizes playback speed and appearance equally at first but sacrifices appearance for playback speed if necessary. Playback begins with anti-aliasing turned on. If the actual frame rate drops below the specified frame rate, anti-aliasing is turned off to improve playback speed. Use this setting to emulate the View > Antialias setting in Flash.
     * ** <code>medium</code> applies some anti-aliasing and does not smooth bitmaps. It produces a better quality than the Low setting, but lower quality than the High setting.
     * ** <code>high</code> favors appearance over playback speed and always applies anti-aliasing. If the movie does not contain animation, bitmaps are smoothed; if the movie has animation, bitmaps are not smoothed.
     * ** <code>best</code> provides the best display quality and does not consider playback speed. All output is anti-aliased and all bitmaps are smoothed.
     * * <code>scale</code> - Possible values: showall, noborder, exactfit.
     * ** <code>default</code> (Show all) makes the entire movie visible in the specified area without distortion, while maintaining the original aspect ratio of the movie. Borders may appear on two sides of the movie.
     * ** <code>noorder</code> scales the movie to fill the specified area, without distortion but possibly with some cropping, while maintaining the original aspect ratio of the movie.
     * ** <code>exactfit</code> makes the entire movie visible in the specified area without trying to preserve the original aspect ratio. Distortion may occur.
     * * <code>align</code> (attribute for Object) - Possible values: l, t, r, b.
     * ** Default centers the movie in the browser window and crops edges if the browser window is smaller than the movie.
     * ** <code>l</code> (left), <code>r</code> (right), <code>t</code> (top), and <code>b</code> (bottom) align the movie along the corresponding edge of the browser window and crop the remaining three sides as needed.
     * * <code>salign</code> - Possible values: l, t, r, b, tl, tr, bl, br.
     * ** <code>l</code>, <code>r</code>, <code>t</code>, and <code>b</code> align the movie along the left, right, top or bottom edge, respectively, of the browser window and crop the remaining three sides as needed.
     * ** <code>tl</code> and <code>tr</code> align the movie to the top left and top right corner, respectively, of the browser window and crop the bottom and remaining right or left side as needed.
     * ** <code>bl</code> and <code>br</code> align the movie to the bottom left and bottom right corner, respectively, of the browser window and crop the top and remaining right or left side as needed.
     * * <code>wmode</code> - Possible values: window, opaque, transparent. Sets the Window Mode property of the Flash movie for transparency, layering, and positioning in the browser.
     * ** <code>window</code> - movie plays in its own rectangular window on a web page.
     * ** <code>opaque</code> - the movie hides everything on the page behind it.
     * ** <code>transparent</code> - the background of the HTML page shows through all transparent portions of the movie, this may slow animation performance.
     * * <code>bgcolor</code> - [ hexadecimal RGB value] in the format #RRGGBB . Specifies the background color of the movie. Use this attribute to override the background color setting specified in the Flash file. This attribute does not affect the background color of the HTML page.
     * * <code>base</code> - . or [base directory] or [URL]. Specifies the base directory or URL used to resolve all relative path statements in the Flash Player movie. This attribute is helpful when your Flash Player movies are kept in a different directory from your other files.     
     *
     * @type static
     * @param movie {String} URI to the movie
     * @param variables? {Map} Flash variable data (these are available in the movie later)
     * @param params? {Map} Flash parameter data (these are used to configure the movie itself)
     * @param win {Window} Window to create the element for
     * @return {Element} DOM element node with the Flash movie
     */
    create : function(movie, variables, params, win)
    {
      // Generates attributes for flash movie
      var attributes = 
      {
        data : movie,
        width : "100%",
        height : "100%"
      };
      
      // Work on param copy
      var params = params ? qx.lang.Object.copy(params) : {};

      // Copy over variables (into params)
      if (variables)
      {
        for (var name in variables)
        {
          if (typeof params.flashvars != "undefined") {
            params.flashvars += "&" + name + "=" + variables[name];
          } else {
            params.flashvars = name + "=" + variables[name];
          }
        }
      }
      
      // Finally create the SWF
      var swf = this.__createSwf(attributes, params, win);
      
      // Objects do not allow styling well. We create a DIV wrapper around.
      var frame = qx.bom.Element.create("div", win);
      frame.appendChild(swf);
                
      // Return element from cross-browser wrapper
      return frame;
    },
    
    
    /** 
     * Creates a DOM element with a flash movie
     *
     * @type static
     * @param attributes {Map} Flash attribute data
     * @param params {Map} Flash parameter data
     * @return {Element} DOM element node with the Flash movie
     */
    __createSwf : qx.core.Variant.select("qx.client",
    {
      // Note: Old webkit support < 312 was removed.
      // This is not needed in qooxdoo.
            
      "mshtml" : function(attributes, params, win)
      {
        // Move data from params to attributes
        params.movie = attributes.data;
        delete attributes.data;
        
        // Cleanup classid
        delete attributes.classid;
  
        // Prepare parameters
        var paramsStr = "";
        for (name in params) {
          paramsStr += '<param name="' + name + '" value="' + params[name] + '" />';
        }
  
        // Create element
        // Note: outerHTML seems not to work for me. At least in IE7/WinVista
        var elem = qx.bom.Element.create("div", null, win);
        elem.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">' + paramsStr + '</object>';
        
        // Extract relevant node
        var swf = elem.firstChild;
        
        // Apply attributes
        delete attributes.classid;
        for (var name in attributes) {
          swf.setAttribute(name, attributes[name]);
        }        
        
        return swf;
      },
      
      "default" : function(attributes, params, win)
      {
        var swf = qx.bom.Element.create("object", attributes, win);
        swf.setAttribute("type", "application/x-shockwave-flash");

        // Cleanup
        delete attributes.classid;
        delete params.movie;
        
        // Apply attributes
        for (var name in attributes) {
          swf.setAttribute(name, attributes[name]);
        }
  
        // Add parameters
        var param;
        for (var name in params) 
        {
          param = document.createElement("param");
          param.setAttribute("name", name);
          param.setAttribute("value", params[value]);
          swf.appendChild(param);
        }
        
        return swf;
      }
    })  
  }
});
