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
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(showcase.page.htmleditor.Content)

************************************************************************ */

qx.Class.define("showcase.page.htmleditor.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "HTML Area",
      part: "htmleditor",
      icon: "showcase/htmleditor/icon.png",
      contentClass: "showcase.page.htmleditor.Content",
      description: showcase.page.DescriptionBuilder.build(
        "HTML Area",
        this.__descriptionText,
        this.__tryThis,
        this.__features,
        this.__manual,
        this.__demos,
        this.__api
      )
    });
  },
  
  
  members :
  {
    __descriptionText : "The HtmlArea, here embedded in an editor window, provides basic" +
    " cross-browser HTML editing capabilities and is available both as a low-level component" +
    " and as a widget. It offers events, allowing easy implementation of a toolbar " +
    "supplement. The UI controls of the toolbar can be used to interact " +
    "with the HTML editing component.",
      
    __tryThis : {
      "Text Formatting" : "Format some text with underline, bold, italic, ...",
      "Alignment" : "Align the text on the right side.",
      "Lists" : "Insert a numbered or bullet point list.",
      "Redo/Undo" : "Try reverting your changes by using the undo button."
    },
    
    __features : {
      "Inserting" : "You can insert HTML tables, images, hyperlinks, ..."
    },
    
    __manual : {
      "ui_html_editing": "Overview HTML Editing"
    },    
      
    __demos : {
      "#bom~HtmlArea.html" : "Low-Level editor",
      "#widget~HtmlArea.html" : "Editor widget"
    },

    __api : {
      "#qx.bom.htmlarea" : "HTML Area"
    }  
  }  
});