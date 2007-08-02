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
     * Alexander Back (aback)
   ________________________________________________________________________

   This class contains code based on the following work:

     SWFObject: Javascript Flash Player detection and embed script
     http://blog.deconcept.com/swfobject/
     Version: 1.5

     Copyright:
       2007 Geoff Stearns

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

       Permission is hereby granted, free of charge, to any person obtaining a
       copy of this software and associated documentation files (the "Software"),
       to deal in the Software without restriction, including without limitation
       the rights to use, copy, modify, merge, publish, distribute, sublicense,
       and/or sell copies of the Software, and to permit persons to whom the
       Software is furnished to do so, subject to the following conditions:

       The above copyright notice and this permission notice shall be included in
       all copies or substantial portions of the Software.

       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
       IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
       FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
       AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
       LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
       FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.

     Authors:
       * Geoff Stearns (geoff@deconcept.com)

************************************************************************ */

/* ************************************************************************

#module(client2)
#require(qx.util.Version)

************************************************************************ */

/**
 * Flash Player detection
 *
 * This class contains code based on the following work:<br/>
 *   SWFObject: Javascript Flash Player detection and embed script<br/>
 *   http://blog.deconcept.com/swfobject/</br>
 *   Version: 1.5
 *
 * License:<br/>
 *   MIT: http://www.opensource.org/licenses/mit-license.php<br/>
 *   For more info, please see the corresponding source file.
 */
qx.Class.define("qx.html2.client.Flash",
{
   
   /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */
   
   statics :
   {
      /** {qx.util.Version} Version information about the installed flash player */
      PLAYERVERSION : null,
      
     /**
      * Internal initialize helper
      *
      * @type static
      * @return {void}
      * @throws TODOC
      */
      __init : function()
      {
         this.PLAYERVERSION = new qx.util.Version(0, 0, 0);
        
         if(navigator.plugins && navigator.mimeTypes.length)
         {
            var x = navigator.plugins["Shockwave Flash"];
          
            if(x && x.description)
            {
               this.PLAYERVERSION = new qx.util.Version(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
            }
         }
         else if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0) // if Windows CE
         {
            var axo = 1;
            var counter = 3;
        
            while(axo) {
              try
              {
                 counter++;
                 axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+ counter);
                 this.PLAYERVERSION = new qx.util.Version(counter, 0, 0);
              } 
              catch (e) {
                 axo = null;
              }
            }
         } 
         else // Win IE (non mobile)
         {
            // do minor version lookup in IE, but avoid fp6 crashing issues
            // see http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
            try
            {
               var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            }
            catch(e)
            {
               try
               {
                  var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                  this.PLAYERVERSION = new qx.util.Version(6, 0, 21);
               } 
               catch(e) {}
              
               try
               {
                  axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
               } 
               catch(e) {}
            }
           
            if (axo != null)
            {
               this.PLAYERVERSION = new qx.util.Version(axo.GetVariable("$version").split(" ")[1].split(","));
            }
         }
      }
   },
   
   /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */
   defer : function(statics)
   {
     statics.__init();
   }
});