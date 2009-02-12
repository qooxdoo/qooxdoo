/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.performance.HtmlDivCell", 
{
  extend : qx.test.ui.virtual.performance.AbstractLayerTest,

  members :
  {
    getLayer : function() {
      return new qx.ui.virtual.layer.HtmlCell(this);
    },
    
    testScrollDown : function() {
      this.scrollDown();
    },

    testScrollUp : function() {
      this.scrollUp();
    },

    testScrollRight : function() {
      this.scrollRight();
    },

    testScrollLeft : function() {
      this.scrollLeft();
    },

    getCellHtml : function(row, column, left, top, width, height)
    {
      var html = [
        "<div style='",
        "float: left;",
        "text-align: center;",
        "width:", width, "px;",
        "height:", height, "px;",
        "'>",
        row,
        " / ",
        column,
        "</div>"                  
      ];
      return html.join("");
    }          
    
  }

});
