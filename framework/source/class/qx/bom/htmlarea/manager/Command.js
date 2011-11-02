/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Available commands for the HtmlArea component
 *
 */
qx.Class.define("qx.bom.htmlarea.manager.Command",
{
  extend : qx.core.Object,

  /**
   * Constructor
   *
   * @param editorInstance {qx.bom.htmlarea.HtmlArea} editor instance
   * @return {void}
   */
  construct : function(editorInstance)
  {
    this.base(arguments);

    this.__editorInstance = editorInstance;
    this.__doc            = null;

    this._commands       = null;
    this.__populateCommandList();

    // When executing these commands, IE 6 sometimes selects the last <span> tag
    // completly by mistake. It is necessary to check if the range is still
    // collapsed after executing one of these commands.
    this.__invalidFocusCommands =
    {
      "Bold"          : true,
      "Italic"        : true,
      "Underline"     : true,
      "StrikeThrough" : true
    };

    /**
     * Computed pixel sizes for values size attribute in <font> tag
     */
    this.__fontSizeNames = [ 10, 12, 16, 18, 24, 32, 48 ];

    // In Gecko-browser hyperlinks which are based on *collapsed* selection are
    // inserted as DOM nodes. To keep track of these nodes they are equipped
    // with an unique id (-> "qx_link" + __hyperLinkId)
    this.__hyperLinkId = 0;
  },

  statics :
  {
    /**
     * Possible values for the style property background-position
     */
    __backgroundPosition : "|top|bottom|center|left|right|right top|left top|left bottom|right bottom|",

    /**
     * Possible values for the style property background-repeat
     */
    __backgroundRepeat : "repeat repeat-x repeat-y no-repeat"

  },

  members :
  {
    __doc : null,
    __editorInstance : null,
    __startTyping : false,
    __invalidFocusCommands : null,
    __fontSizeNames : null,
    __hyperLinkId : null,


    /* ****************************************************************
     *                BASIC / INITIALISATION
     * **************************************************************** */

    /**
     * Set the contentDocument on which this manager should execute
     * his commands
     *
     * @param doc {Object} contentDocument of the editor instance
     * @return {void}
     */
    setContentDocument : function(doc) {
      this.__doc = doc;
    },


    /* ****************************************************************
     *                  COMMAND PROCESSING
     * **************************************************************** */

    /**
     * Returns the commandobject of the given command name
     *
     * @param commandName {String} name of the command
     * @return {Object ? null} commandObject or null if no command is available for the given command name
     */
    getCommandObject : function(commandName)
    {
      if (this._commands[commandName]) {
        return this._commands[commandName];
      } else {
        return null;
      }
    },

    /**
     * Populate the internal "commands" object with the available commands and their settings.
     *
     * @return {void}
     */
    __populateCommandList : function()
    {
      this._commands =
      {
        bold                  : { useBuiltin : false, identifier : "Bold", method : "__setBold" },
        italic                : { useBuiltin : false, identifier : "Italic", method : "__setItalic" },
        underline             : { useBuiltin : false, identifier : "Underline", method : "__setUnderline" },
        strikethrough         : { useBuiltin : false, identifier : "StrikeThrough", method : "__setStrikeThrough" },
        fontfamily            : { useBuiltin : true, identifier : "FontName", method : null },
        fontsize              : { useBuiltin : false, identifier : "FontSize", method : "__setFontSize" },

        textcolor             : { useBuiltin : true, identifier : "ForeColor", method : null },
        textbackgroundcolor   : { useBuiltin : false, identifier : null, method : "__setTextBackgroundColor" },

        backgroundcolor       : { useBuiltin : false, identifier : null, method : "__setBackgroundColor" },
        backgroundimage       : { useBuiltin : false, identifier : null, method : "__setBackgroundImage" },

        justifyleft           : { useBuiltin : false, identifier : "JustifyLeft", method : "__setTextAlign" },
        justifyright          : { useBuiltin : false, identifier : "JustifyRight", method : "__setTextAlign" },
        justifycenter         : { useBuiltin : false, identifier : "JustifyCenter", method : "__setTextAlign" },
        justifyfull           : { useBuiltin : false, identifier : "JustifyFull", method : "__setTextAlign" },

        indent                : { useBuiltin : true, identifier : "Indent", method : null },
        outdent               : { useBuiltin : true, identifier : "Outdent", method : null },

        copy                  : { useBuiltin : true, identifier : "Copy", method : null },
        cut                   : { useBuiltin : true, identifier : "Cut", method : null },
        paste                 : { useBuiltin : true, identifier : "Paste", method : null },

        insertorderedlist     : { useBuiltin : false, identifier : "InsertOrderedList", method : "__insertList" },
        insertunorderedlist   : { useBuiltin : false, identifier : "InsertUnorderedList", method : "__insertList" },

        inserthorizontalrule  : { useBuiltin : false, identifier : "InsertHtml", method : "__insertHr" },
        insertimage           : { useBuiltin : false, identifier : "InsertImage", method : "__insertImage" },

        inserthyperlink       : { useBuiltin : false, identifier : "CreateLink", method : "__insertHyperLink" },

        selectall             : { useBuiltin : false, identifier : "SelectAll", method : "__selectAll" },
        selectedtext          : { useBuiltin : false, identifier : null, method : "__getSelectedText" },
        selectedhtml          : { useBuiltin : false, identifier : null, method : "__getSelectedHtml" },

        inserthtml            : { useBuiltin : false, identifier : "InsertHtml", method : "__insertHtml" },
        resethtml             : { useBuiltin : false, identifier : null, method : "__resetHtml" },
        gethtml               : { useBuiltin : false, identifier : null, method : "__getHtml" },
        removeformat          : { useBuiltin : true, identifier : "RemoveFormat", method : null }
      }
    },


    /**
     * Executes the given command
     *
     * @param command {String} Command to execute
     * @param value {String ? Integer ? null} Value of the command (if any)
     * @return {Boolean} Result of operation
     */
    execute : function(command, value)
    {
      if (!this.__editorInstance.isReady())
      {
        this.error("editor not ready! '"+command+"':'"+value+"'");
        return false;
      }

      // Normalize
      command = command.toLowerCase();
      value   = value != null ? value : null;

      // Check if the given command is supported
      if (this._commands[command])
      {
        var result;
        var commandObject = this._commands[command];

        // We have to make sure that the elements inside the selection are
        // inside a paragraph before executing a command. Otherwise executing
        // commands will cause problems for our paragraph handling.
        //
        // EXCEPTION: this interferes with webkit browsers at indent/outdent.
        if (!((qx.core.Environment.get("engine.name") == "webkit") &&
          (command == "indent" || command == "outdent")))
        {
          if (this.__paragraphMissing()) {
            this.__insertHelperParagraph();
          }
        }

        // Pass all useBuiltin commands right to the browser
        if (commandObject.useBuiltin) {
          result = this.__executeCommand(commandObject.identifier, false, value);
        }
        else
        {
          // Call the specialized method
          if (commandObject.method != null && this[commandObject.method]) {
            result = this[commandObject.method].call(this, value, commandObject);
          }
          else {
            this.error("The method '"+ commandObject.method +"' you calling to execute the command '"+ command +"' is not available!");
          }
        }

        this.__editorInstance.resetSavedRange();
        return result;
      }
      else {
        this.error("Command " + command + " is currently not supported!");
      }
    },


    /**
     * Checks if the focus node is not inside a paragraph tag.
     *
     * @return {Boolean} True if no paragraph is found, otherwise false.
     */
    __paragraphMissing : function()
    {
      var Node = qx.dom.Node;
      var focusNode = this.__editorInstance.getFocusNode();
      var insideBlockElement = false;
      var bodyIsFocusNode = false;

      if (focusNode)
      {
        if (Node.isText(focusNode))
        {
          var parents = qx.dom.Hierarchy.getAncestors(focusNode);

          for(var i=0, j=parents.length; i<j; i++)
          {
            if (Node.isNodeName(parents[i], "p") || qx.bom.htmlarea.HtmlArea.isHeadlineNode(parents[i]))
            {
              insideBlockElement = true;
              break;
            }
          }
        }
        else if (Node.isNodeName(focusNode, "body")) {
          bodyIsFocusNode = true;
        }
      }

      return bodyIsFocusNode || !insideBlockElement;
    },


    /**
     * Inserts a paragraph tag around selection or at the insert point
     * using executeCommand.
     *
     */
    __insertHelperParagraph : function() {
      this.__executeCommand("formatBlock", false, "p");
    },


    /**
     * Internal method to deal with special cases when executing commands
     *
     * @param command {String} command to execute
     * @param ui {Boolean} Whether to show an ui when executing a command. Default is false.
     * @param value {String ? Integer ? null} value of the command
     * @return {Boolean} Success of operation
     */
    __executeCommand : function(command, ui, value)
    {
      try
      {
        // The document object is the default target for all execCommands
        var execCommandTarget = this.__doc;

        // Flag indicating if range was empty before executing command. Needed for IE bug.
        var emptyRange = false;

        var range = this.__editorInstance.getRange();

        // Body element must have focus before executing command
        this.__doc.body.focus();

        // IE looses the selection if the user clicks on any other element e.g.
        // a toolbar item. To manipulate the selected text correctly IE has to
        // execute the command on the previously saved Text Range object rather
        // than the document object.
        //
        // Ignore the "SelectAll" command otherwise the range handling would
        // interfere with it.
        if ((qx.core.Environment.get("engine.name") == "mshtml"))
        {
          if(command != "selectall")
          {
            // Select the content of the Text Range object to set the cursor at the right position
            // and to give user feedback. Otherwise IE will set the cursor at the first position of the
            // editor area
            range.select();

            // If the saved Text Range object contains no text collapse it and
            // execute the command at the document object or selected range is
            // a control range with an image inside.
            if(((range.text) && (range.text.length > 0)) ||
               ((range.length == 1) && (range.item(0)) && (range.item(0).tagName == "IMG"))) {
              execCommandTarget = range;
            } else {
              execCommandTarget = this.__doc;
            }

          }

          // IE has the unwanted behavior to select text after executing some commands
          // (see this.__invalidFocusCommands).
          // If this happens, we have to collapse the range afterwards.
          if( ((qx.core.Environment.get("engine.name") == "mshtml")) && (this.__invalidFocusCommands[command]) )
          {
            if (range.text == "") {
              emptyRange = true;
            }
          }

        }

        var result = execCommandTarget.execCommand(command, ui, value);

        if (emptyRange && range.text != "") {
          range.collapse();
        }

        if ((qx.core.Environment.get("qx.debug")) &&
            qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
          this.debug("execCommand " + command + " with value " + value + " succeded");
        }

        // Mark the next insert of any char as a new undo step
        this.__startTyping = false;
      }
      catch(ex)
      {
        if ((qx.core.Environment.get("qx.debug")) &&
            qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug")) {
          this.debug("execCommand " + command + " with value " + value + " failed");
        }

        return false;
      }

      return result;
    },



    /* ************************************************************
     *          CUSTOM COMMAND IMPLEMENTATION
     * *********************************************************** */


     /**
      * Returns the range to operate on
      *
      * @signature function()
      * @return {Range} native range object
      */
     __getTargetRange : qx.core.Environment.select("engine.name", {
      "mshtml" : function()
      {
        var editor = this.__editorInstance;
        var range = editor.getSavedRange() != null ?
                    editor.getSavedRange() : editor.getRange();

        return range;
      },

      "default" : function() {
        return this.__editorInstance.getRange();
      }
     }),


     /**
      * Inserts custom HTML code at the selection point.
      *
      * @param value {String} HTML code to insert
      * @param commandObject {Object} command information
      * @return {Boolean} Success of the operation
      */
     __insertHtml : qx.core.Environment.select("engine.name",
     {
       "mshtml" : function(value, commandObject)
       {
         var result;

         // Special handling if a "br" element should be inserted
         if (value == qx.bom.htmlarea.HtmlArea.simpleLinebreak) {
           return this.__insertBrOnLinebreak();
         }
         else
         {
           this.__doc.body.focus();

           var sel   = this.__editorInstance.getSelection();
           var range = this.__getTargetRange();

           // DO NOT allow pasteHTML on control selections (like selected images)
           if(range && sel && sel.type != "Control")
           {
             // Try to pasteHTML on the stored range
             try
             {
               range.pasteHTML(value);
               range.collapse(false);
               range.select();
               result = true;
             }
             catch(e) {}
           }
           else {
             result = false;
           }

           this.__editorInstance.resetSavedRange();
           return result;
         }
       },

       "default" : function (value, commandObject)
       {
         // Body element must have focus before executing command
         this.__doc.body.focus();

         return this.__doc.execCommand(commandObject.identifier, false, value);
       }
     }),


     /**
      * Inserts a paragraph when hitting the "enter" key
      *
      * @signature function()
      * @return {Boolean} whether the key event should be stopped or not
      */
     insertParagraphOnLinebreak : qx.core.Environment.select("engine.name",
     {
       "gecko" : function()
       {
         // get the current styles as structure
         var helperStyleStructure = this.__getCurrentStylesGrouped();

         // check for styles to apply at the paragraph
         var paragraphStyle = this.__generateParagraphStyle(helperStyleStructure);

         // generate the span elements to preserve the styling
         var helperStyle = this.__generateHelperString(helperStyleStructure);

         // Generate unique ids to find the elements later
         var spanId = "__placeholder__" + Date.parse(new Date());
         var paragraphId = "__paragraph__" + Date.parse(new Date());

         // A paragraph will only be inserted, if the paragraph before it has content.
         // Therefore we also insert a helper node, then the paragraph and the style
         // nodes after it.
         var htmlToInsert = '';
         var helperString = '<span id="' + spanId + '"></span>';

         htmlToInsert += helperString;
         htmlToInsert += '<p id="' + paragraphId + '" ' + paragraphStyle + '>';
         htmlToInsert += helperStyle + '</p>';

         this.__editorInstance.getCommandManager().addUndoStep("inserthtml", "insertParagraph", this.getCommandObject("inserthtml"));

         this.execute("inserthtml", htmlToInsert);

         this.__hideSuperfluousParagraph();
         qx.bom.element.Attribute.reset(this.__doc.getElementById(spanId), "id");

         // If previous paragraph only contains helperString ->  it was empty.
         // Empty paragraphs are problematic in Gecko -> not properly rendered.
         var paragraphNode = this.__doc.getElementById(paragraphId);
         if(paragraphNode.previousSibling.innerHTML == helperString)
         {
           var helperNodeFragment = this.__generateHelperNodes();
           var brNode = this.__doc.createElement("br");

           var mozDirty = this.__doc.createAttribute("_moz_dirty");
           mozDirty.nodeValue = "";
           brNode.setAttributeNode(mozDirty);

           var type     = this.__doc.createAttribute("type");
           type.nodeValue = "_moz";
           brNode.setAttributeNode(type);

           // Insert a bogus node to set lineheight and style nodes to apply the styles.
           paragraphNode.previousSibling.appendChild(helperNodeFragment);
           paragraphNode.previousSibling.appendChild(brNode);
         }

         qx.bom.element.Attribute.reset(paragraphNode, "id");

         return true;
       },

      /**
       * Gecko does not copy the paragraph's background color, and text
       * alignment so do this manually.
       */
      "webkit" : function()
      {
        var styles = this.getCurrentStyles();
        var elementStyleString = "";

        // We need to copy the background color and text alignment for Webkit
        var relevantStyles = {
          "background-color" : true,
          "text-align": true
        };

        // Iterate over current styles and save relevant ones to string.
        for(var style in styles)
        {
          if (relevantStyles[style]) {
            elementStyleString += style + ":" + styles[style] + ";"
          }
        }

        // Insert the HTML containing the generated style string.
        this.__editorInstance.insertHtml("<p style='" + elementStyleString + "'><br class='webkit-block-placeholder' />");
      },

      "default" : qx.lang.Function.empty
      }),

      /**
        * Apply style attributes which need to to applied at paragraph (block)
        * elements instead of span (inline) elements. To avoid doubling the
        * styles this method does delete the style attribute from the data
        * structure if it can be applied at the paragraph element.
        *
        * @param currentStylesGrouped {Map} Data structure with current styles
        * @return {String} Style attributes for paragraph element
        */
      __generateParagraphStyle : qx.core.Environment.select("engine.name",
      {
        "gecko" : function(currentStylesGrouped)
        {
          var paragraphStyle = 'style="';
          var childElement = currentStylesGrouped.child;

          // text-align has to be applied to the paragraph element to get the
          // correct behaviour since it is the top block element for the text
          if (childElement["text-align"])
          {
            paragraphStyle += 'text-align:' + childElement["text-align"] + ';';
            delete currentStylesGrouped.child["text-align"];
          }

          // To fix Bug #3346 (selecting multiple paragraphs and changing the
          // font family) it is necessary to apply the font-family to the
          // paragraph element to prevent inserting any font-family style to
          // an inner "span" element which then block the font-family style
          // attribute of the "p" element (this will applied by FF when using
          // the "fontFamily" execCommand).
          if (childElement["font-family"])
          {
            paragraphStyle += 'font-family:' + childElement["font-family"] + ';';
            delete currentStylesGrouped.child["font-family"];
          }

          var paddingsToApply = {
              "padding-top" : true,
              "padding-bottom" : true,
              "padding-left" : true,
              "padding-right" : true
          };

          var marginsToApply = {
              "margin-top" : true,
              "margin-bottom" : true,
              "margin-left" : true,
              "margin-right" : true
          };

          for (var styleAttribute in childElement)
          {
            if (paddingsToApply[styleAttribute] || marginsToApply[styleAttribute])
            {
              paragraphStyle += styleAttribute + ':' + childElement[styleAttribute] + ';';
              delete currentStylesGrouped.child[styleAttribute];
            }
          }

          paragraphStyle += '"';

          return paragraphStyle;
        },

        "default" : function() {
          return "";
        }
      }),



      /**
       * Gecko inserts a superfluous paragraph despite our own paragraph
       * handling. If detected we remove this element
       *
       * @return {void}
       * @signature function()
       */
      __hideSuperfluousParagraph : qx.core.Environment.select("engine.name",
      {
        "gecko" : function()
        {
          var sel = this.__editorInstance.getSelection();

          if (!sel || !sel.focusNode) {
            return;
          }

          var focusNode = sel.focusNode;
          var traversalNode = sel.focusNode;

          while (!qx.dom.Node.isNodeName(traversalNode, "p")) {
            traversalNode = traversalNode.parentNode;
          }

          var prevSiblingId = traversalNode.previousSibling.id;
          var nextSiblingId = traversalNode.nextSibling ? traversalNode.nextSibling.id : null;

          if (qx.lang.String.startsWith(prevSiblingId, "__paragraph__") &&
              prevSiblingId == nextSiblingId)
          {
            var nextParagraph = traversalNode.nextSibling;
            var rng = this.__editorInstance.getRange();
            rng.selectNode(nextParagraph);
            sel.addRange(rng);

            var htmlToInsert = qx.bom.htmlarea.HtmlArea.EMPTY_DIV;
            this.__editorInstance.getCommandManager().addUndoStep("inserthtml", htmlToInsert, this.getCommandObject("inserthtml"));

            this.execute("inserthtml", htmlToInsert);

            var secondRange = this.__editorInstance.getRange();

            if (focusNode)
            {
              while (focusNode && focusNode.firstChild &&
                     qx.dom.Node.isElement(focusNode.firstChild))
              {
                focusNode = focusNode.firstChild;
              }
            }

            secondRange.selectNode(focusNode);

            sel.addRange(secondRange);
            secondRange.collapse(true);
          }
        },

        "default" : qx.lang.Function.empty
      }),


     /**
      * ONLY IE
      * Inserts a simple linebreak ('<br>') at the current position.
      *
      * @return {Boolean} Returns true if an br element is inserted
      */
     __insertBrOnLinebreak : qx.core.Environment.select("engine.name",
     {
       "mshtml" : function()
       {
         var rng = this.__editorInstance.getRange();

         // Only insert the "br" element if we are currently NOT inside a list.
         // Return "false" to let the browser handle this (event is not stopped).
         if (rng && !qx.dom.Node.isNodeName(rng.parentElement(), "li"))
         {
           rng.pasteHTML(qx.bom.htmlarea.HtmlArea.simpleLinebreak);
           rng.collapse(false);
           rng.select();

           return true;
         }

         return false;
       },

       "default" : function() {
         return false;
       }
     }),


     /**
      * Helper function to set a text align on a range.
      * In IE we need to explicitly get the current range before executing
      * the font size command on it.
      *
      * @param value {String} text align value
      * @param commandObject {Object} command object
      * @return {Boolean} Success of operation
      */
     __setTextAlign : function(value, commandObject)
     {
       var commandTarget = (qx.core.Environment.get("engine.name") == "mshtml") ? this.__editorInstance.getRange() : this.__doc;

       return commandTarget.execCommand(commandObject.identifier, false, value);
     },


     /**
      * Inserts a list.
      * Ensures that the list is inserted without indents. If any indents are
      * present they are removed before inserting the list.
      * This only applies for IE since other browsers are removing the indents
      * as default.
      *
      * @param value {String} list value
      * @param commandObject {Object} command object
      * @return {Boolean} Success of operation
      */
     __insertList : function(value, commandObject)
     {
       // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=1608 for details
       if ((qx.core.Environment.get("engine.name") == "mshtml"))
       {
         // Get the focusNode as starting node for looking after blockquotes.
         var focusNode = this.__editorInstance.getFocusNode();
         this.__manualOutdent(focusNode);
       }

       // Body element must have focus before executing command
       this.__doc.body.focus();

       var returnValue = this.__doc.execCommand(commandObject.identifier, false, value);

       if ((qx.core.Environment.get("engine.name") == "webkit"))
       {
         // Get the parent of the current focusNode as starting node for
         // looking after blockquotes for webkit.
         var focusNode = this.__editorInstance.getFocusNode();
         this.__manualOutdent(focusNode.parentNode);
       }

       return returnValue;
     },



     /**
      * This little helper method takes a node as argument and looks along the
      * parent hierarchy for any "blockquote" elements and removes them.
      *
      * @param startNode {Node} starting point of the lookup
      * @return {void}
      */
     __manualOutdent : function(startNode)
     {
       var blockquotes = [];
       var parent = startNode.parentNode;

       while (qx.dom.Node.isNodeName(parent, "blockquote"))
       {
         blockquotes.push(parent);
         parent = parent.parentNode;
       }

       // if indents are found move the focusNode to the current parent
       // -> the first parent node which is *no* blockquote
       if (blockquotes.length > 0)
       {
         // move focus node out of blockquotes
         parent.appendChild(startNode);

         // delete blockquote nodes
         // only the last in the array is needed since the it will also remove
         // the child "blockquote" elements
         parent.removeChild(blockquotes[blockquotes.length-1]);
       }
     },



    /**
     * Inserts an image
     *
     * @param attributes {Map} map with attributes which should be applied (e.g. "src", "border", "width" and "height")
     * @param commandObject {Object} command object
     * @return {Boolean} Success of operation
     */
     __insertImage : qx.core.Environment.select("engine.name", {
       "gecko" : function(attributes, commandObject)
       {
         // Only insert an image if the src attribute info is available
         if (attributes.src)
         {
           // Insert image via the execCommand and add the attributes afterwards
           this.__doc.execCommand(commandObject.identifier, false, attributes.src);

           // source is set so remove it from the attributes map
           delete attributes.src;

           // Selection is expected to be the image node
           var sel = this.__editorInstance.getSelection();

           // TODO: need to revert the execCommand if no selection exists?
           if (sel)
           {
             var anchorNode = sel.anchorNode;
             var offset = sel.anchorOffset;
             var img = anchorNode.childNodes[offset-1];

             var attrNode;
             for (var attribute in attributes)
             {
               attrNode = this.__doc.createAttribute(attribute);
               attrNode.nodeValue = attributes[attribute];

               img.setAttributeNode(attrNode);
             }

             // Gecko does not transfer the styles of the previous sibling to the
             // element which comes right after the inserted image.
             // -> we have to insert a corresponding span element for ourselves

             // these elements can have influence on the format
             var formatElements = { "font": true,
                                    "span": true };
             var startNode = null;
             var sibling = true;

             // check if the image is one the same hierarchy level
             // IMPORTANT: if e.g. the user copy-and-pastes a text styled with
             // FONT elements Gecko does add the image inside this font element
             if (qx.dom.Node.isElement(img.previousSibling) &&
                 formatElements[qx.dom.Node.getName(img.previousSibling)]) {
               startNode = img.previousSibling;
             }
             else if (formatElements[qx.dom.Node.getName(img.parentNode)])
             {
               startNode = img.parentNode;
               sibling = false;
             }

             // documentFragment - will hold the span(s)
             var documentFragment = this.__doc.createDocumentFragment();
             var inline;

             if (sibling && startNode != null)
             {
               // if the image is a sibling of the format elements we have to
               // check for the current styles and apply them with span element(s)
               var formatElements = this.__generateImageFormatElements(startNode);

               // append the elements to the documentFragment
               documentFragment.appendChild(formatElements.root);

               // set the inline element to later insert a text node
               inline = formatElements.inline;
             }
             else
             {
               // if the image is within a e.g. "font" element or a "font"
               // element with several nested "span" elements
               // -> just add a "span" element and use the inheritance
               inline = this.__doc.createElement("span");
               documentFragment.appendChild(inline);
             }

             // the inner-most span needs a TextNode for selection
             var inlineText = this.__doc.createTextNode("");
             inline.appendChild(inlineText);

             // get the image parent node
             var imageParent = img.parentNode;

             // image is last child -> append
             // image is anywhere in between -> use nextSibling
             if (img == imageParent.lastChild) {
               imageParent.appendChild(documentFragment);
             } else {
               imageParent.insertBefore(documentFragment, img.nextSibling);
             }

             // get the current range and select the *content* of the new span
             var rng = this.__editorInstance.getRange();
             rng.selectNodeContents(inline);
           }

           return true;
         }
         else {
           return false;
         }
       },

       "mshtml" : function(attributes, commandObject)
       {
         var result = false;

         // Put together the HTML for the image
         var img = "<img ";
         for (var attrName in attributes) {
           img += attrName + "='" + attributes[attrName] + "' ";
         }
         img += "/>";

         // IE *does not* support the "insertHtml" command and
         // the "insertImage" command is not sufficient.
         // We need to add the given attributes to the image, so the
         // only working solution is to use the "pasteHTML" method of the
         // TextRange Object.
         var sel = this.__editorInstance.getSelection();
         var currRange = this.__getTargetRange();

         // DO NOT allow pasteHTML at control selections (like selected images)
         if (sel && sel.type != "Control")
         {
           try
           {
             currRange.select();
             currRange.pasteHTML(img);

             result = true;
           } catch (e) {}
         }

         this.__editorInstance.resetSavedRange();
         return result;
       },

       "default" : function(attributes, commandObject)
       {
         // Only insert an image if the src attribute info is available
         if (attributes.src)
         {
           var img = "<img ";

           for (var attrName in attributes) {
             img += attrName + "='" + attributes[attrName] + "' ";
           }

           img += "/>";

           return this.__doc.execCommand("InsertHtml", false, img);
         }
         else
         {
           return false;
         }
       }
     }),


     /**
      * Generate "span" elements to "save" the formatting after an image
      * was inserted.
      *
      * @param startNode {Node} start node for getting current styles
      * @return {Node} format elements
      */
     __generateImageFormatElements : function(startNode)
     {
       // be sure to check for childs of the previous sibling
       // e.g. a font element with a nested span inside
       while (startNode.firstChild && startNode.firstChild.nodeType == 1)
       {
         startNode = startNode.firstChild;
       }

       // get the current style of this element
       var grouped = this.__getCurrentStylesGrouped(startNode);

       var root, inlineStyle, legacyFont;
       var styles = "";
       var parent = null;
       var inline = null;
       var child = grouped.child;

       while (child)
       {
         // Since non-default font sizes are managed by "font" tags with "size"
         // attributes it is necessary to handle this in a special way
         // if a "legacy-font-size" entry is within the grouped styles it is
         // necessary to create a font element to achieve the correct format
         inline = this.__doc.createElement(child["legacy-font-size"] ? "font" : "span");

         inlineStyle = this.__doc.createAttribute("style");
         inline.setAttributeNode(inlineStyle);

         // apply the styles
         for (var styleKey in child)
         {
           if (styleKey != "child" && styleKey != "legacy-font-size")
           {
             styles += styleKey + ":" + child[styleKey] + ";";
           }
           else if (styleKey == "legacy-font-size")
           {
             legacyFont = this.__doc.createAttribute("size");
             legacyFont.nodeValue = child[styleKey];
             inline.setAttributeNode(legacyFont);
           }
         }
         inlineStyle.nodeValue = styles;

         if (parent != null) {
           parent.appendChild(inline);
         } else {
           root = inline;
         }

         parent = inline;
         child = child.child;
         styles = "";
       }

       return { root : root,
                inline : inline };
     },


     /**
      * Inserts a hyperlink. In Gecko and Opera browser these is achieved by
      * inserting DOM nodes.
      * IE is using the "CreateLink" execCommand.
      *
      * @param url {String} url to insert
      * @param commandObject {Object} command object
      * @return {Boolean} result
      */
     __insertHyperLink : qx.core.Environment.select("engine.name",
     {
       "gecko|opera" : function(url, commandObject)
       {
         var sel = this.__editorInstance.getSelection();
         var rng = this.__editorInstance.getRange();

         // If the selection is collapsed insert a link with the URL as text.
         if (sel.isCollapsed)
         {
           // Only use the link id for links which are based on a collapsed selection
           var linkId = "qx_link" + (++this.__hyperLinkId);

           // Create and insert the link as DOM nodes
           var linkNode = this.__doc.createElement("a");
           var hrefAttr = this.__doc.createAttribute("href");
           var idAttr = this.__doc.createAttribute("id");
           var linkText = this.__doc.createTextNode(url);

           idAttr.nodeValue = linkId;
           linkNode.setAttributeNode(idAttr);

           hrefAttr.nodeValue = url;
           linkNode.setAttributeNode(hrefAttr);

           linkNode.appendChild(linkText);
           rng.insertNode(linkNode);
           rng.selectNode(linkNode);

           sel.collapseToEnd();

           return true;
         }
         else {
           return this.__doc.execCommand(commandObject.identifier, false, url);
         }
       },

       "mshtml" : function(url, commandObject)
       {
         // Check for a valid text range. If it is available (=text selected)
         // insert the link via the "insertLink" execCommand otherwise insert
         // the link with the URL as link text.
         try
         {
           var result;
           var range = this.__getTargetRange();
           var editor = this.__editorInstance;
           var range = editor.getSavedRange() != null ?
                       editor.getSavedRange() : editor.getRange();

           if (range != null && range.text != "") {
             result = range.execCommand(commandObject.identifier, false, url);
           } else {
             result = this.__insertHtml(' <a href="' + url + '">' + url + '</a> ', commandObject);
           }

           this.__editorInstance.resetSavedRange();
           return result;
         }
         catch(e)
         {
           if (qx.core.Environment.get("qx.debug")) {
             this.error("inserthyperlink failed!");
           }
           return false;
         }
       },

       "default" : function(url, commandObject) {
         return this.__doc.execCommand(commandObject.identifier, false, url);
       }
     }),

     /**
      * Internal method to insert an horizontal ruler in the document
      *
      * @param value {String} empty value
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __insertHr : function(value, commandObject)
     {
       var htmlText = "<hr />";

       // Gecko needs some extra HTML elements to keep the current style setting
       // after inserting the <hr> tag.
       if ((qx.core.Environment.get("engine.name") == "gecko")) {
         htmlText += this.__generateHelperString();
       }

       return this.__insertHtml(htmlText, commandObject);
     },

     /**
      * Helper function which generates a string containing HTML which can be
      * used to apply the current style to an element.
      *
      * *** ONLY IN USE FOR GECKO ***
      *
      * @param groupedStyles {Map} Data structure with grouped styles.
      *                            Structure of the "__getCurrentStylesGrouped" method.
      * @return {String} String containing tags with special style settings.
      */
     __generateHelperString : function(groupedStyles)
     {
       var formatString = "";
       var spanBegin = '<span style="';
       var closings = [];

       // retrieve the current styles as structure if no parameter is given
       var structure = typeof groupedStyles !== "undefined" ? groupedStyles : this.__getCurrentStylesGrouped();

       // first traverse the "child" chain
       var child = structure.child;
       var legacyFont = false;

       // if no styles are available no need to create an empty "span" element
       if (qx.lang.Object.isEmpty(child)) {
         return "";
       }

       while (child)
       {
         legacyFont = child["legacy-font-size"] != null;

         // Since non-default font sizes are managed by "font" tags with "size"
         // attributes it is necessary to handle this in a special way
         // if a "legacy-font-size" entry is within the grouped styles it is
         // necessary to create a font element to achieve the correct format
         formatString += legacyFont ? '<font style="' : spanBegin;
         for (var style in child) {
           formatString += (style != "child" && style != "legacy-font-size") ? style + ':' + child[style] + ';' : "";
         }
         formatString += legacyFont ? '" size="'+ child["legacy-font-size"] +'">' : '">';

         // memorize the element to close and adjust object structure
         closings.unshift(legacyFont ? "</font>" : "</span>");
         child = child.child;
       }

       // SPECIAL CASE: only one font element
       // Gecko "optimizes" this by removing the empty font element completely
       if (closings.length == 1 && closings[0] == "</font>") {
         formatString += "<span></span>";
       }

       // close the elements
       for (var i=0, j=closings.length; i<j; i++) {
         formatString += closings[i];
       }

       return formatString;
     },


     /**
      * Helper function which generates a documentFragment of <span>-tags
      * which can be used to apply the current style to an element.
      *
      * *** ONLY IN USE FOR GECKO ***
      *
      * @return {DocumentFragment} documentFragment containing styled elements
      */
     __generateHelperNodes : function()
     {
       var fragment = this.__doc.createDocumentFragment();

       // retrieve the current styles as structure
       var structure = this.__getCurrentStylesGrouped();

       // first traverse the "child" chain
       var parent = fragment;
       var child = structure.child;
       var element;
       var legacyFont = false;
       while (child)
       {
         legacyFont = child["legacy-font-size"] != null;

         element = this.__doc.createElement(legacyFont ? "font" : "span");
         parent.appendChild(element);

         // attach styles
         for (var style in child)
         {
           if (style != "child" && style != "legacy-font-size") {
             qx.bom.element.Style.set(element, style, child[style]);
           }
         }

         if (legacyFont)
         {
           var sizeAttr = this.__doc.createAttribute("size");
           sizeAttr.nodeValue = child["legacy-font-size"];
           element.setAttributeNode(sizeAttr);
         }

         parent = element;
         child = child.child;
       }

       return fragment;
     },


     /**
      * Works with the current styles and creates a hierarchy which can be
      * used to create nodes or strings out of the hierarchy.
      *
      * *** ONLY IN USE FOR GECKO ***
      *
      * @param elem {Node ? null} optional element as root node
      * @return {Map} Hierarchy with style information
      */
     __getCurrentStylesGrouped : function(elem)
     {
       var grouped = {};
       var child = null;

       var collectedStyles = this.getCurrentStyles(elem);

       child = grouped.child = {};

       for(var attribute in collectedStyles)
       {
         // "text-decoration" has to processed afterwards
         if (attribute != "text-decoration") {
           child[attribute] = collectedStyles[attribute];
         }
       }

       // Check for any text-decorations -> special handling, because one has
       // create for each text-decoration one corresponding span element to
       // ensure the correct rendering in Gecko
       if (collectedStyles["text-decoration"])
       {
         var textDecorations = collectedStyles["text-decoration"];

         // An extra <span> is needed for every text-decoration value,
         // because the color of a decoration is based on the element's color.
         for(var i=0, j=textDecorations.length; i<j; i++)
         {
           if (child == null) {
             child = grouped.child = {};
           } else {
             child = child.child = {};
           }

           child['color'] = textDecorations[i]['color'];
           child['text-decoration'] = textDecorations[i]['text-decoration'];
         }
       }

       // SPECIAL HANDLING
       // if any "text-decoration" is used it is necessary to add an extra inner
       // child to make sure an inner span is created which holds the color
       if (collectedStyles['color'] && collectedStyles['text-decoration'])
       {
         child = child.child = {};
         child['color'] = collectedStyles['color'];
       }

       return grouped;
     },


     /**
      * Internal helper function which retrieves all style settings, which are set
      * on the focus node and saves them on a span element.
      *
      * @param element {Element ? null} optional element reference the lookup should start
      * @return {Map} map with all style settings with style attributes as keys.
      */
     getCurrentStyles : function(element)
     {
       if (element == null)
       {
         var sel = this.__editorInstance.getSelection();

         if (!sel || sel.focusNode == null) {
           return {};
         }

         // Get HTML element on which the selection has ended
         element = (sel.focusNode.nodeType == 3) ? sel.focusNode.parentNode : sel.focusNode;
       }

       // Get element's ancestors to fetch all style attributes which are inherited
       // by the element to check
       var parents = qx.dom.Hierarchy.getAncestors(element);
       var elementAndParents = qx.lang.Array.insertBefore(parents, element, parents[0]);

       var collectedStyles = this.__collectStylesOfElementCollection(elementAndParents);
       var resultMap = this.__processCollectedStyles(collectedStyles, elementAndParents);

       return resultMap;
     },


     /**
      * Processes the given element collection and collects the applied CSS
      * styles. Does some additional corrections on the styles to retrieve the
      * correct values.
      *
      * @param elementCollection {Array} Array of elements to collect styles from.
      * @return {Map} collected styles in a map.
      */
     __collectStylesOfElementCollection : function(elementCollection)
     {
       var collectedStyles = {};
       var styleAttribute, element;

       for (var i=0, j=elementCollection.length; i<j; i++)
       {
         element = elementCollection[i];

         for (var k=0, l=element.style.length; k<l; k++)
         {
           styleAttribute = element.style[k];
           if (styleAttribute.length > 0 &&
               typeof collectedStyles[styleAttribute] === "undefined") {
             collectedStyles[styleAttribute] = element.style.getPropertyValue(styleAttribute);
           }
         }

         // only process the "FONT" elements to retrieve the font size
         // for the next paragraph. Only the first occurence is important.
         if(element.tagName.toUpperCase() == "FONT" && element.size &&
            collectedStyles["legacy-font-size"] === undefined) {
           collectedStyles["legacy-font-size"] = element.size;
         }
       }

       // The size of the "FONT" element has a higher priority as the CSS
       // font size value
       if (collectedStyles["legacy-font-size"] && collectedStyles["font-size"]) {
         delete collectedStyles["font-size"];
       }

       return collectedStyles;
     },


     /**
      * Walks over the collected styles and gets inherited value of each.
      *
      * @param collectedStyles {Map} All styles which should be processed
      * @param elementAndParents {Array} Array of all elements and their parent element to process
      * @return {Map} processed styles
      */
     __processCollectedStyles : function(collectedStyles, elementAndParents)
     {
       var element = elementAndParents[0];
       var elementComputedStyle = this.__editorInstance.getContentWindow().getComputedStyle(element, null);

       var styleValue;
       var resultMap = {};
       for(var style in collectedStyles)
       {
         // "legacy-font-size" is not valid CSS attribute
         // do not get the computed of it
         if (style != "legacy-font-size") {
           styleValue = elementComputedStyle.getPropertyValue(style);
         } else {
           styleValue = collectedStyles[style];
         }

         // Get the _real_ color if the collected style has the default value
         // "transparent" by retrieving it from the parent element.
         if(style == "background-color" && styleValue == "transparent") {
           resultMap[style] = this.__getBackgroundColor(elementAndParents);
         }
         // collect all "text-decoration" styles along the parent hierarchy
         // to get the correct (with all inherited values) "text-decoration" style
         else if(style == "text-decoration") {
           resultMap[style] = this.__getTextDecorations(elementAndParents);
         } else {
           resultMap[style] = styleValue;
         }
       }

       return resultMap;
     },


     /**
      * Helper function which walks over all given parent
      * elements and stores all text-decoration values and colors.
      *
      * Returns an array containing all computed values of "text-decoration"
      * and "text-color".
      *
      * @param parents {Array} List with element's parents.
      * @return {Array} List containing style information about element's parents.
      */
     __getTextDecorations : function(parents)
     {
       var decorationValue, colorValue, parentDecoration;
       var decorationValues = [];

       var editorWindow = this.__editorInstance.getContentWindow();
       for(var i=0, j=parents.length; i<j; i++)
       {
         parentDecoration = editorWindow.getComputedStyle(parents[i], null);

         decorationValue = parentDecoration.getPropertyValue("text-decoration");
         colorValue = parentDecoration.getPropertyValue("color");

         // Check if text-decoration is valid
         if (decorationValue != "none")
         {
           decorationValues.push({
             'text-decoration': decorationValue,
             'color': colorValue
           });
         }
       }

       return decorationValues;
     },


     /**
      * Helper function which walks over all given parent
      * elements and searches for an valid value for "background-color".
      *
      * Returns the computed value of "background-color" of one parent
      * element, if it contains a _real_ color.
      *
      * @param parents {Array} List with element's parents.
      * @return {String} Background color value.
      */
     __getBackgroundColor : function(parents)
     {
       var elem, parentDecoration, parentStyleValue;

       for(var i=0; i<parents.length; i++)
       {
         elem = parents[i];

         // Retrieve computed style
         parentDecoration = this.__editorInstance.getContentWindow().getComputedStyle(elem, null);
         parentStyleValue = parentDecoration.getPropertyValue("background-color");

         // If any _real_ color is found return this one
         if (parentStyleValue != "transparent") {
           return parentStyleValue;
         }

       }
     },

     /**
      * Internal method to change the font size of the selection.
      * Most of the code is used to change the size of the bullet points
      * synchronous to it's content.
      *
      * @param value {String} font size number (as used for <font> tags)
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __setFontSize : function(value, commandObject)
     {
       var sel = this.__editorInstance.getSelection();

       var rng = ((qx.core.Environment.get("engine.name") == "mshtml")) ?
           this.__editorInstance.getRange() :
           rng = sel.getRangeAt(0);

       // <ol> or <ul> tags, which are selected, will be saved here
       var lists = [];

       // Flag indicating whether a whole <li> tag is selected
       var listEntrySelected;

       var listTypes = ["OL", "UL"];
       var tmp, i, j, element;

       // At first the selection is examined to figure out
       // a) whether several lists or
       // b) one single <ol> or <li> tag is selected

       // Fetch selected element node to examine what is inside the selection
       element = ((qx.core.Environment.get("engine.name") == "mshtml")) ?
           rng.parentElement() :
           rng.commonAncestorContainer;

       // If it is the <body> tag, a whole bunch of elements has been selected
       if (element.tagName == "BODY")
       {
         for (var i=0; i<listTypes.length; i++)
         {
           // Search for list elements...
           tmp = element.getElementsByTagName(listTypes[i]);
           for (var j=0; j<tmp.length; j++)
           {
             if (tmp[j]) {
               lists.push(tmp[j]);
             }
           }
         }
       }
       // A list tag has been (possibly only partly) selected
       else if(qx.lang.Array.contains(listTypes, element.tagName)) {
         lists.push(element);
       }

       if(lists.length > 0)
       {
         // Walk through all list elements and check if they are selected
         for(var i=0; i<lists.length; i++)
         {
           var listElement = lists[i];

           // Check if the entire list element has been selected.
           //
           // Note: If more than one element is selected in IE, they are all
           // selected completely. This is a good thing, since IE does not
           // support anchorOffset or nodeOffset. :-)
           listEntrySelected = ((qx.core.Environment.get("engine.name") == "mshtml")) ?
               // Element is selected or <body> tag is selected
               // (in this case, the list item inside the selection is selected, too)
               ( (listElement == element) || (element.tagName == "BODY") ) :

               // In other browsers, we can test more preciously
               sel.containsNode(listElement, false);

           /* Walk through all list entries in list element: */
           for(j=0; j<listElement.childNodes.length; j++)
           {
             var listEntryElement = listElement.childNodes[j];

             /*
              * Anchor node and focus nodes are special:
              * 1. they are always text nodes
              * 2. the selection "stops" on the text nodes, so that it's parent element is not completely selected
              *
              * For these reasons, focus node and anchor node are checked separately
              */
             if(
               /*
                * Whole list is selected
                * Note: IE will never come further than this line
                */
               listEntrySelected ||

               /* Check if the complete focus text node selected */
               (
                   sel.focusNode.nodeValue &&
                   qx.dom.Hierarchy.contains(listEntryElement, sel.focusNode) &&
                   (sel.focusOffset == sel.focusNode.nodeValue.length)
               ) ||

               /* Check if the complete anchor text node selected */
               (
                   qx.dom.Hierarchy.contains(listEntryElement, sel.anchorNode) &&
                   (sel.anchorOffset == 0)
               ) ||

               /* Otherwise, check if the actual <li> tag is completely(!) selected */
               (sel.containsNode(listEntryElement, false))
             )
             {
               /* Set font size on <li> tag */
               listEntryElement.style.fontSize = (this.__fontSizeNames[value] || value) + "px";
             } // if

           } // for
         } // for

       /* No lists are selected */
       }else{

         /* Check if element is inside a list entry */

         /* Retrieve selected element node */
         var parentElement = ((qx.core.Environment.get("engine.name") == "mshtml")) ? element : sel.focusNode;

         /* Get all parents */
         var parents = qx.dom.Hierarchy.getAncestors(parentElement);
         for(i=0; i<parents.length; i++)
         {

           /* Element is a list entry */
           if(parents[i].tagName == "LI") {

             if
             (
               (
                 ((qx.core.Environment.get("engine.name") == "gecko"))
                 &&
                 (
                   /* Selection starts at the beginning... */
                   (sel.anchorOffset == 0) &&

                   /* ... and ends at the end of list entry's content*/
                   (sel.focusNode.nodeValue && (sel.focusOffset == sel.focusNode.nodeValue.length) ) &&

                   /* Selection starts inside the list entry's first child... */
                   qx.dom.Hierarchy.contains(parents[i].firstChild, sel.anchorNode) &&

                   /* ... and ends inside the last child */
                   qx.dom.Hierarchy.contains(parents[i].lastChild, sel.focusNode)
                  )
               )
               ||
               (
                 /* In IE just check if the HTML of the range is equal to the actual list entry */
                 ((qx.core.Environment.get("engine.name") == "mshtml")) &&
                 (rng.htmlText == parents[i].innerHTML)
               )
             ){
               /* Set font size on <li> tag */
               parents[i].style.fontSize = (this.__fontSizeNames[value] || value) + "px";
             }

             /* We only need to modify the nearest <li> tag */
             break;

           } // if
         } // for

       }

       /* Execute command on selection */
       if ((qx.core.Environment.get("engine.name") == "mshtml")) {
         this.__doc.body.focus();
         this.__editorInstance.getRange().select();
         return this.__doc.execCommand("FontSize", false, value);
       }
       /*
        * Gecko uses span tags to save the style settings over block elements.
        * These span tags contain CSS which has a higher priority than the
        * font tags which are inserted via execCommand().
        * For each span tag inside the selection the CSS property has to be
        * removed to hand over the control to the font size value of execCommand().
        */
       else if((qx.core.Environment.get("engine.name") == "gecko"))
       {

         var parent = rng.commonAncestorContainer;

         /* Check if selection is a DOM element */
         if(parent.nodeType === 1)
         {
           /*
            * Remove the font size property if it is available, otherwise it
            * will interfere with the setting of the "font" element.
            * If we try to set the font size with the CSS property we will
            * have to transform the font sizes 1-7 to px values which will
            * never work out correctly.
            */
           var spans = parent.getElementsByTagName("span");
           for (i=0; i<spans.length; i++) {
             if (spans[i].style.fontSize)
             {
               spans[i].style.fontSize = null;
             }
           }
         }
       }

       return this.__doc.execCommand("FontSize", false, value);
     },


     /**
      * Internal method to set a background color for text.
      * Special implementation for Webkit to imitate the behaviour of IE.
      * If the selection is collapsed Webkit sets the background color
      * to the whole word which is currently under the caret.
      * All others (IE, Gecko and Opera) are using the execCommand directly.
      *
      * @param value {String} color to set
      * @param commandObject {Object} command infos
      * @return {Boolean} success of operation
      */
     __setTextBackgroundColor : qx.core.Environment.select("engine.name", {
       "mshtml" : function(value, commandObject)
       {
         // Body element must have focus before executing command
         this.__doc.body.focus();

         return this.__doc.execCommand("BackColor", false, value);
       },

       "gecko|opera" : function(value, commandObject)
       {
         // Body element must have focus before executing command
         this.__doc.body.focus();

         return this.__doc.execCommand("HiliteColor", false, value);
       },

       "webkit" : function(value, commandObject)
       {
         var sel = this.__editorInstance.getSelection();
         var rng = this.__editorInstance.getRange();

         // check for a range
         if (!sel || !sel.isCollapsed)
         {
           // Body element must have focus before executing command
           this.__doc.body.focus();

           this.__doc.execCommand("BackColor", false, value);

           // collapse the selection
           if (sel) {
             sel.collapseToEnd();
           }

           return true;
         }
         else
         {
           // Act like an IE browser
           // -> if the selection is collapsed select the whole word and
           // perform the action on this selection.
           var right  = sel.anchorOffset;
           var left   = sel.anchorOffset;
           var rng    = sel.getRangeAt(0);
           var anchor = sel.anchorNode;

           // Check the left side - stop at a linebreak or a space
           while (left > 0)
           {
             if (anchor.nodeValue.charCodeAt(left) == 160 ||
                 anchor.nodeValue.charCodeAt(left) == 32) {
               break;
             } else {
               left--;
             }
           }

           // Check the right side - stop at a linebreak or a space
           while (right < anchor.nodeValue.length)
           {
             if (anchor.nodeValue.charCodeAt(right) == 160 ||
                 anchor.nodeValue.charCodeAt(right) == 32) {
               break;
             } else {
               right++
             }
           }

           // Set the start and end of the range to cover the whole word
           rng.setStart(sel.anchorNode, sel.anchorNode.nodeValue.charAt(left) == " " ? left + 1 : left);
           rng.setEnd(sel.anchorNode, right);
           sel.addRange(rng);

           // Body element must have focus before executing command
           this.__doc.body.focus();

           this.__doc.execCommand("BackColor", false, value);

           // Collapse the selection
           sel.collapseToEnd();

           return true;
         }
       }
     }),

     /**
      * Internal method to set a background color for the whole document
      *
      * @param value {String} color info
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __setBackgroundColor : function(value, commandObject)
     {
       value = value != null && typeof value == "string" ? value : "transparent";
       qx.bom.element.Style.set(this.__doc.body, "backgroundColor", value);

       return true;
     },


     /**
      * Sets the background image of the document
      *
      * @param value {Array} Array consisting of url [0], background-repeat [1] and background-position [2]
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      */
     __setBackgroundImage : function(value, commandObject)
     {
       var url, repeat, position;
       var Command = qx.bom.htmlarea.manager.Command;

       if (value == null) {
         url = null;
       }
       else
       {
         url      = value[0];
         repeat   = value[1];
         position = value[2];
       }

       // If url is null remove the background image
       if (url == null || typeof url != "string")
       {
         qx.bom.element.Style.set(this.__doc.body, "backgroundImage", "");
         qx.bom.element.Style.set(this.__doc.body, "backgroundRepeat", "");
         qx.bom.element.Style.set(this.__doc.body, "backgroundPosition", "");

         return true;
       }

       // Normalize the url parameter. Especially when doing undo/redo operations
       // the url *can* be passed in as full CSS like 'url(SOMEURL)' rather than
       // just 'SOMEURL'.
       else
       {
         // Quick test for 'url('
         if (url.search(/^url.*\(/) == -1) {
           url = "url(" + url + ")";
         }
       }

       // Return silently if the parameter "repeat" is not valid and report
       //the error in debug mode
       if (repeat != null && !qx.lang.String.contains(Command.__backgroundRepeat, repeat))
       {
         if (qx.core.Environment.get("qx.debug")) {
           this.error("The value '" +repeat + "' is not allowed for parameter 'repeat'. Possible values are '" + Command.__backgroundRepeat + "'");
         }
         return false;
       }
       else {
         repeat = "no-repeat";
       }

       if (position != null)
       {
         if (qx.lang.Type.isString(position) &&
             !qx.lang.String.contains(Command.__backgroundPosition, '|'+position+'|'))
         {
           if (qx.core.Environment.get("qx.debug")) {
             this.error("The value '" + position + "' is not allowed for parameter 'position'. Possible values are '" + Command.__backgroundPosition + "'");
           }
           return false;
         }
         else
         {
           if (qx.lang.Type.isArray(position) && position.length == 2) {
             position = position[0] + " " + position[1];
           }
           else
           {
             if (qx.core.Environment.get("qx.debug")) {
               this.error("If an array is provided for parameter 'position' it has to define two elements!");
             }
             return false;
           }
         }
       } else {
         // Set the default value if no value is given
         position = "top";
       }

       // Don't use the "background" css property to prevent overwriting the
       // current background color
       qx.bom.element.Style.set(this.__doc.body, "backgroundImage", url);
       qx.bom.element.Style.set(this.__doc.body, "backgroundRepeat", repeat);
       qx.bom.element.Style.set(this.__doc.body, "backgroundPosition", position);

       return true;
     },


     /**
      * Selects the whole text.
      * IE uses an own implementation because the execCommand is not reliable.
      *
      * @return {Boolean} Success of operation
      */
     __selectAll : qx.core.Environment.select("engine.name", {
       "mshtml" : function(value, commandObject)
       {
         var rng = this.__doc.body.createTextRange();
         rng.select();

         return true;
       },

       "default" : function(value, commandObject)
       {
         return this.__executeCommand(commandObject.identifier, false, value);
       }
     }),


    /**
     * Returns the content of the actual range as text
     *
     * @return {String} selected text
     */
    __getSelectedText : function() {
      return this.__editorInstance.getSelectedText();
    },


    /**
     * returns the content of the actual range as text
     *
     * @return {String} selected text
     */
    __getSelectedHtml : function() {
      return this.__editorInstance.getSelectedHtml();
    },


    /**
     * Checks the formatting at the beginning of a line and resets the
     * formatting manually if necessary.
     *
     * This workaround fixes the wrong behaviour of Gecko browser which does
     * not remove the formatting itself if the cursor is at the beginning of a
     * new line and the user has not entered any text yet.
     *
     * @param attribute {String} Style attribute to check for
     * @param value {String} Style attribute value to check for
     * @return {Boolean} Whether the formatting was removed manually
     */
    __syncFormattingAtBeginOfLine : function(attribute, value)
    {
      var focusNode = this.__editorInstance.getFocusNode();
      if (focusNode.textContent == "")
      {
        // get all parent elements + including the current focus element
        var ancestors = qx.dom.Hierarchy.getAncestors(focusNode);
        ancestors.unshift(focusNode);

        var Node = qx.dom.Node;
        var Style = qx.bom.element.Style;
        var currentElement = ancestors.shift();
        while (ancestors.length > 0)
        {
          if (Node.getName(currentElement) == "p" || Node.getName(currentElement) == "body") {
            break;
          }

          // Use the local value here to get the style of the current element
          // and NOT the computed value of the element.
          if (Style.get(currentElement, attribute, Style.LOCAL_MODE) == value)
          {
            Style.reset(currentElement, attribute);
            return true;
          }

          currentElement = ancestors.shift();
        }
      }

      return false;
    },


    /**
     * Special implementation for Gecko browser to fix the wrong formatting
     * at the beginning of a new line.
     *
     * @param value {String} command value
     * @param commandObject {Object} command infos
     * @return {Boolean} Success of operation
     *
     * @signature function(value, commandObject)
     */
    __setBold : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(value, commandObject)
      {
        // Checks for any "font-weight: bold" formatting and resets it
        // manually if present
        if (this.__syncFormattingAtBeginOfLine("fontWeight", "bold")) {
          return true;
        } else {
          return this.__executeCommand(commandObject.identifier, false, value);
        }
      },

      "default" : function(value, commandObject) {
        return this.__executeCommand(commandObject.identifier, false, value);
      }
    }),


    /**
     * Special implementation for Gecko browser to fix the wrong formatting
     * at the beginning of a new line.
     *
     * @param value {String} command value
     * @param commandObject {Object} command infos
     * @return {Boolean} Success of operation
     *
     * @signature function(value, commandObject)
     */
    __setItalic : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(value, commandObject)
      {
        // Checks for any "font-style: italic" formatting and resets it
        // manually if present
        if (this.__syncFormattingAtBeginOfLine("fontStyle", "italic")) {
          return true;
        } else {
          return this.__executeCommand(commandObject.identifier, false, value);
        }
      },

      "default" : function(value, commandObject) {
        return this.__executeCommand(commandObject.identifier, false, value);
      }
    }),


     /**
      * Special implementation for Gecko browser to fix the wrong formatting
      * at the beginning of a new line.
      *
      * Special implementation for webkit browser to set the text-decoration
      * underline. In webkit the apply of text-decoration is different to other
      * browsers and cannot be performed with an <code>execCommand</code>
      *
      * @param value {String} color info
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      * @signature function(value, commandObject)
      */
     __setUnderline  : qx.core.Environment.select("engine.name",
     {
       "gecko" : function(value, commandObject)
       {
         // Checks for any "text-decoration: underline" formatting and resets it
         // manually if present
         if (this.__syncFormattingAtBeginOfLine("textDecoration", "underline")) {
           return true;
         } else {
           return this.__executeCommand(commandObject.identifier, false, value);
         }
       },

       "default" : function(value, commandObject) {
         return this.__executeCommand(commandObject.identifier, false, value);
       }
     }),


     /**
      * Special implementation for Gecko browser to fix the wrong formatting
      * at the beginning of a new line.
      *
      * Special implementation for webkit browser to set the text-decoration
      * strikethrough. In webkit the apply of text-decoration is different to other
      * browsers and cannot be performed with an <code>execCommand</code>
      *
      * @param value {String} color info
      * @param commandObject {Object} command infos
      * @return {Boolean} Success of operation
      *
      * @signature function(value, commandObject)
      */
     __setStrikeThrough  : qx.core.Environment.select("engine.name",
     {
       "gecko" : function(value, commandObject)
       {
         // Checks for any "text-decoration: line-through" formatting and resets
         // it manually if present
         if (this.__syncFormattingAtBeginOfLine("textDecoration", "line-through")) {
           return true;
         } else {
           return this.__executeCommand(commandObject.identifier, false, value);
         }
       },

       "default" : function(value, commandObject) {
         return this.__executeCommand(commandObject.identifier, false, value);
       }
     })
  },


  /**
   * Destructor
   */
  destruct : function()
  {
    this.__doc = this.__editorInstance = this._commands = null;
    this.__invalidFocusCommands = this.__fontSizeNames = null;
  }
});