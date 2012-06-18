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
     * Alexander Steitz (aback)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Oxygen/16/actions/format-*.png)
#asset(qx/icon/Oxygen/16/actions/edit-*.png)
#asset(qx/icon/Oxygen/16/actions/insert-image.png)
#asset(qx/icon/Oxygen/16/actions/insert-link.png)
#asset(qx/icon/Oxygen/16/actions/insert-text.png)
#asset(demobrowser/demo/icons/htmlarea/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "native"
 *
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.HtmlArea",
{
  extend : qx.application.Native,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __container : null,
    __buttonContainer : null,
    __htmlAreaContainer : null,
    __htmlArea : null,
    __widget : null,

    /**
     * Main method - application start point
     *
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      this.__container = qx.dom.Element.create("div");
      qx.bom.element.Style.setStyles(this.__container, { margin: "20px 20px" });

      var descriptionContainer = qx.dom.Element.create("div");
      qx.bom.element.Style.setStyles(descriptionContainer, { width: "840px",
                                                                    padding: "0px",
                                                                    margin: "0px" });
      var description = "<h1>HtmlArea low-level widget</h1>" +
                        "<p>This low-level widget can be used separately at " +
                        "traditional web pages / single-page applications.<br/> " +
                        "It is the foundation for the UI widget component.</p>" +
                        "<p style='margin-bottom:10px'><b>No UI-level code</b> is included in this demo." +
                        "You can play around with this widget by hitting the " +
                        "buttons at the toolbar.</p>";
      qx.bom.element.Attribute.set(descriptionContainer, "innerHTML", description);

      this.__buttonContainer = qx.dom.Element.create("div");
      qx.bom.element.Style.setStyles(this.__buttonContainer, { width: "840px",
                                                               padding: "0px",
                                                               margin: "0px",
                                                               lineHeight: "0px",
                                                               border: "1px solid #AAA" });

      this.__htmlAreaContainer = qx.dom.Element.create("div");
      qx.bom.element.Style.setStyles(this.__htmlAreaContainer, { width: "840px",
                                                                 height: "350px",
                                                                 border: "1px solid #AAA",
                                                                 borderTop: "0px",
                                                                 backgroundColor: "white" });
      qx.dom.Element.insertEnd(this.__htmlAreaContainer, this.__container);

      var demoContent = '<h1>About</h1><p>qooxdoo (pronounced [ku:ksdu:]) is a comprehensive and innovative Ajax application framework. Leveraging object-oriented JavaScript allows developers to build impressive cross-browser applications. No <acronym title="HyperText Markup Language">HTML</acronym>, <acronym title="Cascading Style Sheets">CSS</acronym> nor <acronym title="Document Object Model">DOM</acronym> knowledge is needed. qooxdoo includes a platform-independent development tool chain, a state-of-the-art <acronym title="Graphical User Interface">GUI</acronym> toolkit and an advanced client-server communication layer. It is Open Source under an <acronym title="GNU Lesser General Public License">LGPL</acronym>/<acronym title="Eclipse Public License">EPL</acronym> dual <a href="http://qooxdoo.org/license" class="wikilink1" title="license">license</a>.</p>';
      this.__htmlArea = new qx.bom.htmlarea.HtmlArea(this.__htmlAreaContainer, demoContent, null, "blank.html");

      this.__setupToolbar();

      qx.dom.Element.insertBegin(this.__buttonContainer, this.__container);
      qx.dom.Element.insertBegin(descriptionContainer, this.__container);
      qx.dom.Element.insertBegin(this.__container, document.body);
   },

   /* *********************************************
    *
    *      Special handler for Toolbar entries
    *
    * *********************************************
    */

   /**
    * Handler for "font-size" button
    *
    * @param e {qx.event.type.Event} event instance
    */
   __fontSizeHandler : function(e)
   {
     var result = window.prompt("FontSize: ", "");
     this.setFontSize(parseInt(result));
   },

   /**
    * Handler for "font-color" button
    *
    * @param e {qx.event.type.Event} event instance
    */
   __fontColorHandler : function(e)
   {
     var result = window.prompt("Color (Hex): ", "#");
     this.setTextColor(result);
   },

   /**
    * Handler for "text-background-color" button
    *
    * @param e {qx.event.type.Event} event instance
    */
   __textBackgroundColorHandler : function(e)
   {
     var result = window.prompt("BgColor (Hex): ", "#");
     this.setTextBackgroundColor(result);
   },

   /**
    * Handler for "insert image" button
    *
    * @param e {qx.event.type.Event} event instance
    */
   __insertImageHandler : function(e)
   {
     var attributes = { src    : qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/icons/htmlarea/qooxdoo_logo.png"),
                        border : 0,
                        title  : "qooxdoo logo",
                        alt    : "qooxdoo logo" };

     this.insertImage(attributes);
   },

   /**
    * Handler for "insert table" button
    *
    * @param e {qx.event.type.Event} event instance
    */
   __insertTableHandler : function(e)
   {
     var table = "<table border='1'>" +
                   "<tbody>" +
                     "<tr>" +
                       "<td>First Row, First cell</td>" +
                       "<td>First Row, Second cell</td>" +
                     "</tr>" +
                     "<tr>" +
                       "<td>Second Row, First cell</td>" +
                       "<td>Second Row, Second cell</td>" +
                     "</tr>" +
                   "</tbody>" +
                 "</table>";
     this.insertHtml(table);
   },

   /**
    * Handler for "insert link" button
    *
    * @param e {qx.event.type.Event} event instance
    */
   __insertLinkHandler : function(e)
    {
      var result = window.prompt("Link: ", "http://");
      this.insertHyperLink(result);
    },

   /**
    * Handler for "insert HTML" button
    *
    * @param e {qx.event.type.Event} event instance
    */
    __insertHTMLHandler : function(e)
    {
      var result = window.prompt("HTML Code:", "");
      this.insertHtml(result);
    },

   /* ***************************************
    *
    *            Toolbar info
    *
    * ***************************************
    */

   /**
    * Creates the selectbox for the "font-family"
    *
    * @return {Element} DOM element which holds the combobox
    */
   __fontFamilyToolbarEntry : function()
   {
     var container = qx.dom.Element.create("div");
     qx.bom.element.Style.setStyles(container, { "float": "left" });

     var listItem;
     var button = qx.dom.Element.create("select", { title: "Change font family" });

     if (qx.core.Environment.get("engine.name") == "mshtml") {
       qx.bom.element.Attribute.set(button, "hideFocus", "true");
     } else {
       qx.bom.element.Style.set(button, "outline", "none");
     }

     listItem = qx.bom.Collection.html("<option value=''></option>");
     qx.dom.Element.insertEnd(listItem[0], button);

     var entries = ["Tahoma", "Verdana", "Times New Roman", "Arial",
                    "Arial Black", "Courier New", "Courier", "Georgia",
                    "Impact", "Comic Sans MS", "Lucida Console" ];

     var htmlString;
     var entry;
     for (var i=0, j=entries.length;i<j;i++)
     {
       htmlString = "<option qxKeepFocus='on' qxSelectable='off'" +
                     "value='" + entries[i] + "'>" + entries[i] + "</option>";
       entry = qx.bom.Collection.html(htmlString);

       if (qx.core.Environment.get("engine.name") == "mshtml") {
         qx.bom.element.Attribute.set(entry[0], "hideFocus", "true");
       } else {
         qx.bom.element.Style.set(entry[0], "outline", "none");
       }

       qx.dom.Element.insertEnd(entry[0], button);
     }

     qx.event.Registration.addListener(button, "change", function(e)
     {
       var target = e.getTarget();
       var option = target.selectedIndex;

       if (option != 0)
       {
         this.setFontFamily(target.options[option].value);
         target.options[0].selected = true;
       }
     }, this.__htmlArea);

     qx.dom.Element.insertBegin(button, container);

     return container;
   },

   /**
    * Creates the selectbox for the "font-sizes"
    *
    * @return {Element} DOM element which holds the combobox
    */
   __fontSizeToolbarEntry : function()
   {
     var container = qx.dom.Element.create("div");
     qx.bom.element.Style.setStyles(container, { "marginRight": "16px",
                                                 "float": "left" });

     var listItem;
     var button = qx.dom.Element.create("select", { title: "Change font size" });

     if (qx.core.Environment.get("engine.name") == "mshtml") {
       qx.bom.element.Attribute.set(button, "hideFocus", "true");
     } else {
       qx.bom.element.Style.set(button, "outline", "none");
     }

     listItem = qx.bom.Collection.html("<option value=''></option>");
     qx.dom.Element.insertEnd(listItem[0], button);

     var entry;
     var htmlString;
     for (var i=1;i<=7;i++)
     {
       htmlString = "<option qxKeepFocus='on' qxSelectable='off' " +
                     "value='" + i + "'>" + i + "</option>";
       entry = qx.bom.Collection.html(htmlString);

       if (qx.core.Environment.get("engine.name") == "mshtml") {
         qx.bom.element.Attribute.set(entry[0], "hideFocus", "true");
       } else {
         qx.bom.element.Style.set(entry[0], "outline", "none");
       }

       qx.dom.Element.insertEnd(entry[0], button);
     }

     qx.event.Registration.addListener(button, "change", function(e)
     {
       var target = e.getTarget();
       var option = target.selectedIndex;

       if (option != 0)
       {
         this.setFontSize(target.options[option].value);
         target.options[0].selected = true;
       }
     }, this.__htmlArea);

     qx.dom.Element.insertBegin(button, container);

     return container;
   },

   /**
    * Creates the toolbar
    */
   __setupToolbar : function()
   {
     var toolbarEntries = [
        {
          bold:                { text: "Format Bold", image: "qx/icon/Oxygen/16/actions/format-text-bold.png", action: this.__htmlArea.setBold },
          italic:              { text: "Format Italic", image: "qx/icon/Oxygen/16/actions/format-text-italic.png", action: this.__htmlArea.setItalic },
          underline:           { text: "Format Underline", image: "qx/icon/Oxygen/16/actions/format-text-underline.png", action: this.__htmlArea.setUnderline },
          strikethrough:       { text: "Format Strikethrough", image: "qx/icon/Oxygen/16/actions/format-text-strikethrough.png", action: this.__htmlArea.setStrikeThrough },
          removeFormat:        { text: "Remove Format", image: "qx/icon/Oxygen/16/actions/edit-clear.png", action: this.__htmlArea.removeFormat }
        },

        {
          alignLeft:           { text: "Align Left", image: "qx/icon/Oxygen/16/actions/format-justify-left.png", action: this.__htmlArea.setJustifyLeft },
          alignCenter:         { text: "Align Center", image: "qx/icon/Oxygen/16/actions/format-justify-center.png", action: this.__htmlArea.setJustifyCenter },
          alignRight:          { text: "Align Right", image: "qx/icon/Oxygen/16/actions/format-justify-right.png", action: this.__htmlArea.setJustifyRight },
          alignJustify:        { text: "Align Justify", image: "qx/icon/Oxygen/16/actions/format-justify-fill.png", action: this.__htmlArea.setJustifyFull }
        },

        {
          fontFamily:          { custom: this.__fontFamilyToolbarEntry },
          fontSize:            { custom: this.__fontSizeToolbarEntry },
          fontColor:           { text: "Set Text Color", image:  "demobrowser/demo/icons/htmlarea/format-text-color.png", action: this.__fontColorHandler },
          textBackgroundColor: { text: "Set Text Background Color", image:  "demobrowser/demo/icons/htmlarea/format-fill-color.png", action: this.__textBackgroundColorHandler }
        },

        {
          indent:              { text: "Indent More", image: "qx/icon/Oxygen/16/actions/format-indent-more.png", action: this.__htmlArea.insertIndent },
          outdent:             { text: "Indent Less", image: "qx/icon/Oxygen/16/actions/format-indent-less.png", action: this.__htmlArea.insertOutdent }
        },


        {
          insertImage:         { text: "Insert Image", image: "qx/icon/Oxygen/16/actions/insert-image.png", action: this.__insertImageHandler },
          insertTable:         { text: "Insert Table", image: "demobrowser/demo/icons/htmlarea/insert-table.png", action: this.__insertTableHandler },
          insertLink:          { text: "Insert Link", image: "qx/icon/Oxygen/16/actions/insert-link.png", action: this.__insertLinkHandler },
          insertHTML:          { text: "Insert HTML Code", image: "demobrowser/demo/icons/htmlarea/insert-text.png", action: this.__insertHTMLHandler },
          insertHR:            { text: "Insert Horizontal Ruler", image: "demobrowser/demo/icons/htmlarea/insert-horizontal-rule.png", action: this.__htmlArea.insertHorizontalRuler }
        },

        {
          ol:                  { text: "Insert Ordered List", image: "demobrowser/demo/icons/htmlarea/format-list-ordered.png", action: this.__htmlArea.insertOrderedList },
          ul:                  { text: "Inserted Unordered List", image: "demobrowser/demo/icons/htmlarea/format-list-unordered.png", action: this.__htmlArea.insertUnorderedList }
        },

        {
          undo:                { text: "Undo Last Change", image: "qx/icon/Oxygen/16/actions/edit-undo.png", action: this.__htmlArea.undo },
          redo:                { text: "Redo Last Undo Step", image: "qx/icon/Oxygen/16/actions/edit-redo.png", action: this.__htmlArea.redo }
        }
     ];

     // Put together toolbar entries
     var part, partStyle, button, attributes;
     for (var i=0, j=toolbarEntries.length; i<j; i++)
     {
       partStyle = {};
       partStyle["marginRight"] = i == j-1 ? "0px" : "16px";
       partStyle["float"] = "left";

       part = qx.dom.Element.create("div");
       qx.bom.element.Style.setStyles(part, partStyle);

       for (var entry in toolbarEntries[i])
       {
         var infos = toolbarEntries[i][entry];

         if (infos.custom)
         {
           button = infos.custom.call(this);
         }
         else
         {
           var uri = qx.util.AliasManager.getInstance().resolve(infos.image);

           attributes = { type: "image",
                          src: qx.util.ResourceManager.getInstance().toUri(uri),
                          title: infos.text,
                          qxKeepFocus: "on",
                          qxSelectable: "off" };

           button = qx.dom.Element.create("input", attributes);
           qx.bom.element.Style.setStyles(button, { width: "16px",
                                                    height: "16px",
                                                    padding: "4px" });

           if (qx.core.Environment.get("engine.name") == "mshtml") {
             qx.bom.element.Attribute.set(button, "hideFocus", "true");
           } else {
             qx.bom.element.Style.set(button, "outline", "none");
           }


           qx.event.Registration.addListener(button, "click", infos.action, this.__htmlArea);
         }

         qx.dom.Element.insertEnd(button, part);
       }
       qx.dom.Element.insertEnd(part, this.__buttonContainer);
     }
     qx.dom.Element.insertEnd(qx.dom.Element.create("br", { style: "clear:both" }), this.__buttonContainer);
   }
  }
});
