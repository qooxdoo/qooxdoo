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

************************************************************************ */

/* ************************************************************************

#module(client)

************************************************************************ */

/**
 * This class comes with all relevant informations regarding 
 * the client's operating system. This class is examining the userAgent of
 * the browser's build-in navigator object. Currently there are more than 
 * <b>4000</b> (in words: four thousand) different userAgent strings, so this class
 * aims to target only the relevant ones. However this list is not meant to be
 * complete.
 *
 * The listed constants are automatically filled on the initialization 
 * phase of the class. The defaults listed in the API viewer need not 
 * to be identical to the values at runtime.
 */
qx.Class.define("qx.html2.client.Os",
{
   /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
     /** {String} The name of the operating system */
     NAME : "",
     
     /** {Boolean} Flag to detect if the client system is Windows 95 */
     WIN95 : false,
     
     /** {Boolean} Flag to detect if the client system is Windows 98 */
     WIN98 : false,
     
     /** {Boolean} Flag to detect if the client system is Windows ME */
     WINME : false,
     
     /** {Boolean} Flag to detect if the client system is Windows NT */
     WINNT : false,
     
     /** {Boolean} Flag to detect if the client system is Windows NT4 */
     WINNT4 : false,
     
     /** {Boolean} Flag to detect if the client system is Windows 2000 */
     WIN2000 : false,
     
     /** {Boolean} Flag to detect if the client system is Windows XP */
     WINXP : false,
     
     /** {Boolean} Flag to detect if the client system is Windows Server 2003 */
     WINSERVER2003 : false,
     
     /** {Boolean} Flag to detect if the client system is Windows Vista */
     WINVISTA : false,
     
     /** {Boolean} Flag to detect if the client system is Windows CE */
     WINCE : false,
     
     /** {Boolean} Flag to detect if the client system has .NET installed */
     DOTNET : false,
     
     /** {String} .NET version (if installed) */
     DOTNETVERSION : null,
     
     /** {Boolean} Flag to detect if the client system has an installed Service Pack 1 */
     SP1 : false,
     
     /** {Boolean} Flag to detect if the client system has an installed Service Pack 2 */
     SP2 : false,
     
     /** {Boolean} Flag to detect if the client system is Linux */
     LINUX : false,
     
     /** {Boolean} Flag to detect if the client system is SunOS */
     SUNOS : false,
     
     /** {Boolean} Flag to detect if the client system is FreeBSD */
     FREEBSD : false,
     
     /** {Boolean} Flag to detect if the client system is NetBSD */
     NETBSD : false,

    /** {Boolean} Flag to detect if the client system is Mac OS X */
     MACOSX : false,
     
     /** {Boolean} Flag to detect if the client system is Mac OS X on a Intel processor */
     MACINTEL : false,
     
     /** {Boolean} Flag to detect if the client system is Mac OS X on a PowerPC */
     PPCMAC : false,
     
     /** {Boolean} Flag to detect if the client system is Symbian */
     SYMBIAN : false,
     
     /** {Boolean} Flag to detect if the client system is Nintendo DS */
     NITRO : false,
     
     /** {Boolean} Flag to detect if the client system is Playstation Portable */
     PSP : false,

     
     /**
      * Internal initialize helper
      *
      * @type static
      * @return {void}
      * @throws TODOC
      */
     __init : function()
     {
        var input = navigator.userAgent;
        
        if (input.indexOf("Windows NT 6.0") != -1)
        {
           this.NAME     = "vista";
           this.WINVISTA = true;
        }
        
        else if (input.indexOf("Windows NT 5.1") != -1)
        {
           this.NAME  = "winXP";
           this.WINXP = true;
           
           if (input.indexOf("MSIE") != -1 && input.indexOf("SV1") != -1)
           {
              this.SP2 = true;
           }
        }
        
        else if (input.indexOf("Windows NT 5.01") != -1)
        {
           this.NAME    = "win2000";
           this.WIN2000 = true;
           this.SP1     = true;
        }
        
        else if (input.indexOf("Windows NT 5.0") != -1 || input.indexOf("Windows 2000") != -1) // "Windows 2000" used by Opera
        {
           this.NAME    = "win2000";
           this.WIN2000 = true;
        }
        
        else if (input.indexOf("X11") != -1)
        {
           if (input.indexOf("Linux") != -1)
           {
             this.NAME = "linux";
             this.LINUX = true;
           }
           else if (input.indexOf("FreeBSD") != -1)
           {
             this.NAME = "freebsd";
             this.FREEBSD = true;
           }
           else if (input.indexOf("NetBSD") != -1)
           {
             this.NAME = "netbsd";
             this.NETBSD = true;
           }
           else if (input.indexOf("SunOS") != -1)
           {
             this.NAME = "sunOS";
             this.SUNOS = true;
           }
        }
        
        else if (input.indexOf("Mac OS X") != -1)
        {
           this.NAME   = "macOSX";
           this.MACOSX = true;
           
           if (input.indexOf("Intel"))
           {
             this.MACINTEL = true;
           }
           else if (input.indexOf("PPC")) {
             this.MACPPC = true;
           }
        }
                
        else if (input.indexOf("Windows NT 5.2") != -1)
        {
           this.NAME          = "winServer2003";
           this.WINSERVER2003 = true;
           
           if (input.indexOf("MSIE") != -1 && input.indexOf("SV1") != -1)
           {
              this.SP1 = true;
           }
        }
        
        else if (input.indexOf("Win 9x 4.90") != -1)
        {
           this.NAME  = "winMe";
           this.WINME = true;
        }
        
        else if (input.indexOf("Windows 98") != -1 || input.indexOf("Win98") != -1)
        {
           this.NAME  = "win98";
           this.WIN98 = true;
        }
        
        else if (input.indexOf("Windows 95") != -1 || input.indexOf("Win95") != -1)
        {
           this.NAME  = "win95";
           this.WIN95 = true;
        }
        
        else if (input.indexOf("Windows CE") != -1)
        {
           this.NAME  = "winCE";
           this.WINCE = true;
        }
        
        else if (input.indexOf("Symbian OS") != -1) // used by Opera on mobile phones
        {
           this.NAME    = "symbian OS";
           this.SYMBIAN = true;
        }
        
        else if (input.indexOf("Nitro") != -1) // used by Opera
        {
           this.NAME  = "nintendoDS";
           this.NITRO = true;
        }
        
        else if (input.indexOf("PSP") != -1)
        {
           this.NAME  = "psPortable";
           this.PSP = true;
        }
        
        else if (input.indexOf("Windows NT") != -1)
        {
           this.NAME    = "winNT";
           this.WINNT   = true;
        }
        
        else if (input.indexOf("WinNT3.51") != -1)
        {
           this.NAME    = "winNT";
           this.WINNT   = true;
        }
        
        else if (input.indexOf("Windows NT 4.0") != -1)
        {
           this.NAME    = "winNT4";
           this.WINNT4  = true;
        }
        
        else
        {
          throw new Error("Unable to detect os: " + input);
        }
        
        
        
        /* checking for .NET */   
        if (input.indexOf("MSIE") != -1)
        {
           if (input.indexOf(".NET CLR"))
           {
              this.DOTNET        = true;
              var result         = input.match(/NET\sCLR\s(\d+\.\d+\.\d+)/g);
              this.DOTNETVERSION = RegExp.$1;
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