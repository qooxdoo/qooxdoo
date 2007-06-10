qx.Class.define("qx.html2.Coordinate",
{
  statics :
  {
    /**
     * Adapted from Mochikit
     *
     * @type static
     * @param element {var} TODOC
     * @return {var} TODOC
     */
    realOffset : function(element)
    {
      var valueT = 0;
      var valueL = 0;

      do
      {
        valueT += element.scrollTop || 0;
        valueL += element.scrollLeft || 0;
        element = element.parentNode;
      }
      while (element);

      return {
        left : valueL, 
        top valueT
      };
    },
    
    
    /**
     * Adopted from Mochikit
     *
     * @type static
     * @param element {var} TODOC
     * @return {var} TODOC
     */
    cumulativeOffset : function(element)
    {
      var valueT = 0;
      var valueL = 0;

      do
      {
        valueT += element.offsetTop || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      }
      while (element);

      return { 
        left : valueL, 
        top : valueT 
      };
    },
    
            
    /**
     * Gets the current position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
     *
     * @type static
     * @param el {Element} TODOC
     * @return {Array} The XY position of the element(s)
     */
    getXY : function(el)
    {
      var f = function(el)
      {
        // has to be part of document to have pageXY
        if ((el.parentNode === null || el.offsetParent === null || this.getStyle(el, 'display') == 'none') && el != document.body) {
          return false;
        }

        var parentNode = null;
        var pos = [];
        var box;

        if (el.getBoundingClientRect)
        {  // IE
          box = el.getBoundingClientRect();
          var doc = document;

          if (!this.inDocument(el) && parent.document != document)
          {  // might be in a frame, need to get its scroll
            doc = parent.document;

            if (!this.isAncestor(doc.documentElement, el)) {
              return false;
            }
          }

          var scrollTop = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
          var scrollLeft = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);

          return [ box.left + scrollLeft, box.top + scrollTop ];
        }
        else
        {  // safari, opera, & gecko
          pos = [ el.offsetLeft, el.offsetTop ];
          parentNode = el.offsetParent;

          // safari: if el is abs or any parent is abs, subtract body offsets
          var hasAbs = this.getStyle(el, 'position') == 'absolute';

          if (parentNode != el)
          {
            while (parentNode)
            {
              pos[0] += parentNode.offsetLeft;
              pos[1] += parentNode.offsetTop;

              if (isSafari && !hasAbs && this.getStyle(parentNode, 'position') == 'absolute') {
                hasAbs = true;  // we need to offset if any parent is absolutely positioned
              }

              parentNode = parentNode.offsetParent;
            }
          }

          if (isSafari && hasAbs)
          {  // safari doubles in this case
            pos[0] -= document.body.offsetLeft;
            pos[1] -= document.body.offsetTop;
          }
        }

        parentNode = el.parentNode;

        // account for any scrolled ancestors
        while (parentNode.tagName && !patterns.ROOT_TAG.test(parentNode.tagName))
        {
          // work around opera inline scrollLeft/Top bug
          if (Y.Dom.getStyle(parentNode, 'display') != 'inline')
          {
            pos[0] -= parentNode.scrollLeft;
            pos[1] -= parentNode.scrollTop;
          }

          parentNode = parentNode.parentNode;
        }

        return pos;
      };

      return Y.Dom.batch(el, f, Y.Dom, true);
    }
  }
});
