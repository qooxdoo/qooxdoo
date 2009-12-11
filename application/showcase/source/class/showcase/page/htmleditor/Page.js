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
      name: "HTML Editor",
      part: "htmleditor",
      icon: "showcase/htmleditor/icon.png",
      contentClass: "showcase.page.htmleditor.Content",
      description: showcase.page.DescriptionBuilder.build(
        "HTML Editor",
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
    __descriptionText : "The HtmlArea provides basic cross-browser HTML " + 
      "capabilities and is available as low-level and as a widget component. " + 
      "It offers events to easily implement a toolbar as supplement.. The UI " + 
      "controls of tis toolbar are used to easily interact with the HTML " + 
      "editing component.",
      
    __tryThis : {
      "Text Formatting" : "Format some text with underline, bold, italic, ...",
      "Alignment" : "Align the text on the right side.",
      "Lists" : "Insert a numberd or bullet point list.",
      "Redo/Undo" : "Try to revert your canges using the undo button."
    },
    
    __features : {
      "Inserting" : "You can insert table, images, Hyperlinks, ..."
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