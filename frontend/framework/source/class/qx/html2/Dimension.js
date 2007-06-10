/** Adopted from YUI */
qx.Class.define("qx.html2.Dimension",
{
  statics :
  {
    /**
     * Returns the height of the document.
     *
     * @type static
     * @return {Integer} The height of the actual document (which includes the body and its margin).
     */
    getDocumentHeight : function()
    {
      var scrollHeight = (document.compatMode != 'CSS1Compat') ? document.body.scrollHeight : document.documentElement.scrollHeight;
      return Math.max(scrollHeight, this.getViewportHeight());
    },


    /**
     * Returns the width of the document.
     *
     * @type static
     * @return {Integer} The width of the actual document (which includes the body and its margin).
     */
    getDocumentWidth : function()
    {
      var scrollWidth = (document.compatMode != 'CSS1Compat') ? document.body.scrollWidth : document.documentElement.scrollWidth;
      return Math.max(scrollWidth, this.getViewportWidth());
    },


    /**
     * Returns the current height of the viewport.
     *
     * @type static
     * @return {Integer} The height of the viewable area of the page (excludes scrollbars).
     */
    getViewportHeight : function()
    {
      var height = self.innerHeight;  // Safari, Opera
      var mode = document.compatMode;

      if ((mode || isIE) && !isOpera)
      {  
        // IE, Gecko
        height = (mode == 'CSS1Compat') ? document.documentElement.clientHeight :   // Standards
        document.body.clientHeight;  // Quirks
      }

      return height;
    },


    /**
     * Returns the current width of the viewport.
     *
     * @type static
     * @return {Integer} The width of the viewable area of the page (excludes scrollbars).
     */
    getViewportWidth : function()
    {
      var width = self.innerWidth;  // Safari
      var mode = document.compatMode;

      if (mode || isIE)
      {  
        // IE, Gecko, Opera
        width = (mode == 'CSS1Compat') ? document.documentElement.clientWidth :   // Standards
        document.body.clientWidth;  // Quirks
      }

      return width;
    }   
  }
});
