/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Steitz (aback)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Decorator for CommandManager instance to implement Undo/Redo functionality
 *
 *
 * @param commandManager {qx.bom.htmlarea.manager.Command} commandManager instance to decorate
 */
qx.Class.define("qx.bom.htmlarea.manager.UndoRedo",
{
  extend : qx.core.Object,

  /**
   * Constructor
   *
   * @param commandManager {htmlarea.command.Manager} command manager instance
   * @param editorInstance {qx.ui.embed.HtmlArea} editor instance
   * @lint ignoreDeprecated(_commands)
   * @return {void}
   */
  construct : function(commandManager, editorInstance)
  {
    this.base(arguments);

    this.__commandManager = commandManager;
    this.__editorInstance = editorInstance;

    this.__undoStack = [];
    this.__redoStack = [];
    this._commands  = null;
    this.__doc = null;
    this.__registeredHandler = {};
    this.__knownActionTypes = { command : true,
                                content : true,
                                custom : true };

    this.__populateCommandList();

    this.__handleKeyPress = qx.lang.Function.bind(this._handleKeyPress, this);
    this.__handleMouseUp = qx.lang.Function.bind(this._handleMouseUp, this);

    if ((qx.core.Environment.get("engine.name") == "mshtml")) {
      this.__handleMouseDown = qx.lang.Function.bind(this._handleMouseDown, this);
    }
  },


  /**
   * @lint ignoreDeprecated(_commands)
   */
  members :
  {
    __redoPossible : false,
    __undoPossible : false,

    __contentChange : false,

    __knownActionTypes : null,

    /* Map with infos about custom registered handler */
    __registeredHandler : null,

    __commandManager : null,
    __doc : null,
    __undoStack : null,
    __redoStack : null,
    __editorInstance : null,
    __handleKeyPress : null,
    __handleMouseUp : null,
    __handleMouseDown : null,
    __currentContent : null,


    /* *******************************************************
     *
     *                 PUBLIC METHODS
     *
     * *******************************************************/

    /**
     * Set the document instance on which the UndoManager should perform his actions.
     *
     * @param doc {Document} document node to work on
     * @return {void}
     */
    setContentDocument : function(doc)
    {
      this.__doc = doc;
      this.__commandManager.setContentDocument(doc);

      qx.event.Registration.addListener(doc.body, "keypress", this.__handleKeyPress, this);

      // monitor internal changes like image resizing etc.
      qx.event.Registration.addListener(doc.body, "mouseup", this.__handleMouseUp, this);

      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // monitor internal changes like image resizing etc.
        qx.event.Registration.addListener(doc.body, "mousedown", this.__handleMouseDown, this, true);
      }
    },


    /**
     * Inserts a paragraph when hitting the "enter" key.
     * Delegates to the real command manager instance.
     *
     * @type member
     * @return {Boolean} whether the key event should be stopped or not
     */
    insertParagraphOnLinebreak : function() {
      return this.__commandManager.insertParagraphOnLinebreak();
    },


    /**
     * Executes the given command and collects (if necessary) undo information.
     *
     * @param command {String} Command to execute
     * @param value {String ? Integer ? null} Value of the command (if any)
     * @return {Boolean} Result of operation
     */
    execute : function(command, value)
    {
      var result;

      // Normalize
      command = command.toLowerCase();

      // Check for commands handled directly be this manager otherwise pass it
      // along to the command manager and collect undo infos.
      if (this._commands[command])
      {
        // Pass all commands directly to the commandManager if they marked as
        // "passthrough". This way it is possible to execute commands without
        // adding them to the undoStack.
        if (this._commands[command].passthrough) {
          result = this.__commandManager.execute(command, value);
        } else {
          result = this[command].call(this);
        }
      }
      else
      {
        if ((qx.core.Environment.get("engine.name") == "mshtml") ||
            (qx.core.Environment.get("engine.name") == "webkit"))
        {
          this.__collectUndoInfo(command, value, this.__commandManager.getCommandObject(command));

          result = this.__commandManager.execute(command, value);

          // remove last undo step from stack if command wasn't successful
          if (!result) {
            this.__undoStack.pop();
          }
        }
        else
        {
          result = this.__commandManager.execute(command, value);

          if (result) {
            this.__collectUndoInfo(command, value, this.__commandManager.getCommandObject(command));
          }
        }

        if (command == "undo" && this.__undoStack.length == 0)
        {
          this.__undoPossible = false;
          this.__fireUndoRedoStateEvent();
        }
        else if (command == "redo" && this.__redoStack.length == 0)
        {
          this.__redoPossible = false;
          this.__fireUndoRedoStateEvent();
        }
      }

      this.__contentChange = false;

      return result;
    },


    /**
     * Public API method to add an undo step
     *
     * @param command {String} Command identifier
     * @param value {String} value of command
     * @param commandObject {Object} Info object about command
     *
     * @return {void}
     */
    addUndoStep : function(command, value, commandObject) {
      this.__collectUndoInfo(command, value, commandObject);
    },


    /**
     * Register a handler for a customized actionType. This handler methods
     * (undo and redo) are called whenever the UndoManager encounters the
     * given actionType to undo/redo the change.
     *
     * @param actionType {String} actionType to react on with undo and redo methods
     * @param undoHandler {function} undo method
     * @param redoHandler {function} redo method
     * @param context {Object} In this context the methods are called. When no
     *               context is given the context is the UndoManager itself.
     *
     * @return {void}
     *
     */
    registerHandler : function(actionType, undoHandler, redoHandler, context)
    {
      this.__registeredHandler[actionType] = { undo    : undoHandler,
                                               redo    : redoHandler,
                                               context : context };
    },


    /* *******************************************************
     *
     *                  UNDO METHODS
     *
     * *******************************************************/


    /**
     * Service method to check if an undo operation is currently possible
     *
     * @return {Boolean} Whether an undo is possible or not
     */
    isUndoPossible : function() {
      return this.__undoPossible;
    },


    /**
     * Undo facade method. The different types of undo (command/custom/content)
     * are delegated to their specialized implementation.
     *
     * @return {Boolean}
     */
    undo : function()
    {
       var result;

       if (this.__contentChange) {
         this.__addAdditionalContentUndoStep();
       }

       // Look after the change history
       // if any custom change was found undo it manually
       if (this.__undoStack.length > 0)
       {
         var undoStep = this.__undoStack.pop();

         if (this.__knownActionTypes[undoStep.actionType.toLowerCase()])
         {
           switch(undoStep.actionType)
           {
             case "Command":
               result = this.__undoCommand(undoStep);
               break;

             case "Content":
               result = this.__undoContent(undoStep);
               break;

             case "Internal":
               result = this.__undoInternal(undoStep);
               break;

             case "Custom":
               result = this.__undoCustom(undoStep);
               break;
           }
         }
         // Any there any handlers which are registered to this actionType?
         else if(this.__registeredHandler[undoStep.actionType])
         {
            var handler = this.__registeredHandler[undoStep.actionType];
            result = handler.undo.call(handler.context ? handler.context : this, undoStep);

            // add it automatically to the redoStack
            this.__addToRedoStack(undoStep);
         }
         else {
           this.error("actionType " + undoStep.actionType + " is not managed! Please provide a handler method!");
         }

         this.__redoPossible = true;
         this.__fireUndoRedoStateEvent();

         return result;
       }
     },


     /**
      * Undo a custom command like setting a backgroumd image/color. These commands
      * are not supported by the browsers with an execCommand identifier. The command
      * has to be executed manually and therefore the undo mechanism.
      *
      * @param undoInfo {Object} Undo info object
      * @return {Boolean}
      */
    __undoCustom : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(undoInfo)
      {
        var currentContent = this.__doc.body.innerHTML;

        var oldContent = undoInfo.content;
        this.__doc.body.innerHTML = oldContent;

        var redoAction = undoInfo;
        redoAction.content = currentContent;
        this.__addToRedoStack(redoAction);

        return true;
      },

      "default" : function(undoInfo)
      {
        // Fill the info for the (possible) redo
        var redoAction = undoInfo;
        var Style = qx.bom.element.Style;

        // Add the (different) needed parameter for the redo
        switch(undoInfo.command)
        {
          case "backgroundcolor":
            redoAction.parameter = [ Style.get(this.__doc.body, "backgroundColor") ];
          break;

          case "backgroundimage":
            redoAction.parameter = [ Style.get(this.__doc.body, "backgroundImage"),
                                     Style.get(this.__doc.body, "backgroundRepeat"),
                                     Style.get(this.__doc.body, "backgroundPosition") ];
          break;
        }

        this.__addToRedoStack(redoAction);

        // Remove the link manually
        // Only necessary if the link was inserted at a collapsed selection
        if (undoInfo.command == "inserthyperlink")
        {
          if ((qx.core.Environment.get("engine.name") == "gecko"))
          {
            var linkId = "qx_link" + this.__commandManager.__hyperLinkId;
            var link = this.__doc.getElementById(linkId);

            if (link)
            {
              link.parentNode.removeChild(link);

              return true;
            }
            else {
              return false;
            }
          }
        }
        else {
          return this.__commandManager.execute(undoInfo.command, undoInfo.value);
        }
      }
    }),


    /**
     * Undo a browser-supported command.
     *
     * @param undoInfo {Object} Undo info object
     * @return {Boolean}
     * @signature function(undoInfo)
     */
    __undoCommand : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(undoInfo) {},

      "default" : function(undoInfo)
      {
        this.__addToRedoStack(undoInfo);

        if ((qx.core.Environment.get("engine.name") == "gecko"))
        {
          if (undoInfo.command == "inserthtml" &&
              undoInfo.value == qx.bom.htmlarea.HtmlArea.EMPTY_DIV &&
              this.__checkForNextUndoStep("inserthtml", "insertParagraph"))
          {
            this.__executeExtraUndoStep();
          }
        }

        return this.__performUndo();
      }
    }),


    /**
     * Checks the next undo step with specific conditions
     *
     * @type member
     * @param command {String} command name
     * @param value {String} command value
     * @return {Boolean} Whether a next undo step is available
     */
    __checkForNextUndoStep : function(command, value)
    {
      if (this.__undoStack.length > 0)
      {
        var nextUndoStep = this.__undoStack[this.__undoStack.length-1];
        return (nextUndoStep.command == command &&
                nextUndoStep.value == value);
      }

      return false;
    },


    /**
     * Sometimes it's necessary to perform two undo steps. Helper method to
     * to keep the stacks in correct state.
     *
     * @type member
     * @return {void}
     */
    __executeExtraUndoStep : function()
    {
      this.__performUndo();

      if (this.__undoStack.length > 0)
      {
        var nextUndoStep = this.__undoStack.pop();
        this.__addToRedoStack(nextUndoStep);
      }
    },


    /**
     * Undo an internal change like resizing an image/add table cell
     *
     * @param undoInfo {Object} Undo info object
     * @return {Boolean} Success of command
     */
    __undoInternal : function(undoInfo)
    {
      this.__addToRedoStack(undoInfo);

      return this.__performUndo();
    },


    /**
     * Undo content manipulation.
     *
     * @param undoInfo {Object} Undo info object
     * @return {Boolean}
     * @signature function(undoInfo)
     */
    __undoContent : qx.core.Environment.select("engine.name", {
      "gecko" : function(undoInfo)
      {
        this.__addToRedoStack(undoInfo);

        try {
          return this.__performUndo();
        }
        catch(error)
        {
          /* It appears, that an execCommand was bound to an element which is not available when calling 'undo' */
          if (qx.core.Environment.get("qx.debug")) {
            this.error("execCommand failed! Details: " + error)
          }
        }
      },

      "mshtml|webkit" : function(undoInfo) {},

      "default" : function(undoInfo)
      {
        this.__addToRedoStack(undoInfo);

        return this.__performUndo();
      }
    }),


    /**
     * Wrapper method for undo execCommand to prevent any exceptions bubbling
     * up to the user.
     *
     * @return {Boolean} Success of execCommand
     */
    __performUndo : function()
    {
      try {
        return this.__doc.execCommand("Undo", false, null);
      } catch(e) {
        return false;
      }
    },



    /* *******************************************************
     *
     *                  REDO METHODS
     *
     * *******************************************************/

    /**
     * Service method to check if a redo operation is currently possible
     *
     * @return {Boolean} Whether redo is possible or not
     */
    isRedoPossible : function() {
      return this.__redoPossible;
    },


    /**
     * Redo facade method. The different types of redo (command/custom/content)
     * are delegated to their specialized implementation.
     *
     * @return {Boolean}
     */
     redo : function()
     {
       if (this.__redoPossible)
       {
         var result;

         // Look after the change history
         // if any custom change was found redo it manually
         if (this.__redoStack.length > 0)
         {
           var redoStep = this.__redoStack.pop();

           if (this.__knownActionTypes[redoStep.actionType.toLowerCase()])
           {
             switch(redoStep.actionType)
             {
               case "Command":
                 result = this.__redoCommand(redoStep);
                 break;

               case "Content":
                 result = this.__redoContent(redoStep);
                 break;

               case "Internal":
                 result = this.__redoInternal(redoStep);
                 break;

               case "Custom":
                 result = this.__redoCustom(redoStep);
                 break;
             }
           }
           else if(this.__registeredHandler[redoStep.actionType])
           {
              var handler = this.__registeredHandler[redoStep.actionType];
              result = handler.redo.call(handler.context ? handler.context : this, redoStep);

              // add it automatically to the undoStack
              this.__addToUndoStack(redoStep);
           }
           else
           {
             this.error("actionType " + redoStep.actionType + " is not managed! Please provide a handler method!");
           }

           this.__undoPossible = true;
           this.__fireUndoRedoStateEvent();
         }

         return result;
      }
    },


    /**
     * Redo a custom command.
     *
     * @param redoInfo {Object} Redo info object
     * @return {Boolean}
     * @signature function(redoInfo)
     */
    __redoCustom : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(redoInfo)
      {
        var currentContent = this.__doc.body.innerHTML;

        var newContent = redoInfo.content;
        this.__doc.body.innerHTML = newContent;

        var undoInfo = redoInfo;
        undoInfo.content = currentContent;
        this.__addToUndoStack(undoInfo);

        return true;
      },

      "default" : function(redoInfo)
      {
        this.__addToUndoStack(redoInfo);

        return this.__performRedo();
      }
    }),


    /**
     * Redo a browser-supported command.
     *
     * @param redoInfo {Object} Redo info object
     * @return {Boolean}
     * @signature function(redoInfo)
     */
    __redoCommand : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(redoInfo) {},

      "default" : function(redoInfo)
      {
        this.__addToUndoStack(redoInfo);

        var result = this.__performRedo();

        if ((qx.core.Environment.get("engine.name") == "gecko"))
        {
          if (this.__checkForNextRedoStep("inserthtml", qx.bom.htmlarea.HtmlArea.EMPTY_DIV))
          {
            // we need to catch the focused paragraph before the extra redo step
            var focusedParagraph = this.__getFocusedParagraph();

            this.__executeExtraRedoStep();

            if (focusedParagraph != null) {
              this.__correctCaretPositionAfterRedo(focusedParagraph);
            }
          }
        }

        return result;
      }
    }),


    /**
     * Checks the next redo step with specific conditions
     *
     * @type member
     * @param command {String} command name
     * @param value {String} command value
     * @return {Boolean} Whether a next redo step is available
     */
    __checkForNextRedoStep : function(command, value)
    {
      if (this.__redoStack.length > 0)
      {
        var nextRedoStep = this.__redoStack[this.__redoStack.length-1];
        return (nextRedoStep.command == command &&
                nextRedoStep.value == value);
      }

      return false;
    },


    /**
     * Returns the current focused paragraph or null if the no paragraph
     * is within the selection.
     *
     * @return {Element?null} P element or null
     */
    __getFocusedParagraph : function()
    {
      if (this.__editorInstance == null) {
        return null;
      }

      var selection = this.__editorInstance.getSelection();
      var focusNode = selection ? selection.focusNode : null;

      if (focusNode == null) {
        return null;
      }

      try
      {
        while (focusNode.nodeName.toLowerCase() != "p")
        {
          focusNode = focusNode.parentNode;

          if (!focusNode || qx.dom.Node.isNodeName(focusNode, "body")) {
            return null;
          }
        }
      }
      catch (exc)
      {
        return null;
      }

      if (focusNode != null && qx.dom.Node.isNodeName(focusNode, "p")) {
        return focusNode;
      } else {
        return null;
      }
    },


    /**
     * Sometimes it is necessary to perform two redo steps at once. Helper method.
     *
     * @type member
     * @return {void}
     */
    __executeExtraRedoStep : function()
    {
      var nextRedoStep = this.__redoStack.pop();
      this.__addToUndoStack(nextRedoStep);
      this.__performRedo();
    },


    /**
     * Gecko does position the caret at the wrong position after redo commands.
     * Helper method to correct this wrong behaviour.
     *
     * @return {void}
     */
    __correctCaretPositionAfterRedo : qx.core.Environment.select("engine.name", {
      "gecko" : function(currentParagraph)
      {
        if (currentParagraph == this.__editorInstance.getContentBody().lastChild) {
          return;
        }

        var nodeToSelect = currentParagraph.firstChild;
        while (nodeToSelect.firstChild) {
          nodeToSelect = nodeToSelect.firstChild;
        }

        var selection = this.__editorInstance.getSelection();
        var range = this.__editorInstance.getRange();

        if (selection && range)
        {
          range.selectNode(nodeToSelect);
          selection.addRange(range);
          range.collapse(true);
        }
      },

      "default" : qx.lang.Function.empty
    }),


    /**
     * Redo an internal change like resizing an image/add table cell
     *
     * @param redoInfo {Object} Undo info object
     * @return {Boolean} Success of command
     */
    __redoInternal : function(redoInfo)
    {
      this.__addToUndoStack(redoInfo);

      return this.__performRedo();
    },


    /**
     * Redo a content manipulation
     *
     * @param redoInfo {Object} Redo info object
     * @return {Boolean}
     * @signature function(redoInfo)
     */
    __redoContent : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(redoInfo) {},

      "default" : function(redoInfo)
      {
        this.__addToUndoStack(redoInfo);
        return this.__performRedo();
      }
    }),


    /**
     * Wrapper method for redo execCommand to prevent any exceptions bubbling
     * up to the user.
     *
     * @return {Boolean} Success of execCommand
     */
    __performRedo : function()
    {
      try {
        return this.__doc.execCommand("Redo", false, null);
      } catch(e) {
        return false;
      }
    },


    /* *******************************************************
     *
     *             PRIVATE UTILITY METHODS
     *
     * *******************************************************/

    /**
     * Populates the internal command list. This list determines
     * which commands are handled directly by the undo manager and
     * which commands are passed through (without added to the undo/redo
     * history).
     *
     * @return {void}
     */
    __populateCommandList : function()
    {
      this._commands = {
        undo         : { passthrough : false },
        redo         : { passthrough : false }
      };

      /*
       * Actions for which a special undo operation is needed because
       * the browser could not handle them automatically with the "undo"
       * execCommand. This is only needed for non-mshtml as IE uses his own
       * undo mechanism.
       */
      this.__commandManager.getCommandObject("backgroundcolor").customUndo = true;
      this.__commandManager.getCommandObject("backgroundimage").customUndo = true;

      if ((qx.core.Environment.get("engine.name") == "gecko")) {
        // TODO: disable the undo of links which are not created at a text selection.
        //       Check if it's applicable at all to allow inserting links without
        //       a valid text selection
        // this.__commandManager.getCommandObject("inserthyperlink").customUndo = true;
      }
    },


    /**
     * Collects the necessary info about the current action and adds this
     * info to the undo history.
     *
     * @param command {String} command to execute
     * @param value {String ? Integer ? null} Value of the command (if any)
     * @param commandObject {Object} internal commandObject
     * @return {void}
     */
    __collectUndoInfo : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function(command, value, commandObject)
      {
        var undoObject = this.getUndoRedoObject();
        undoObject.commandObject = commandObject;
        undoObject.command = command;
        undoObject.value = value;
        undoObject.actionType = "Custom";
        undoObject.content = this.__doc.body.innerHTML;

        this.__updateUndoStack(undoObject);
      },

      "default" : function(command, value, commandObject)
      {
        if (this.__editorInstance == null) {
          return;
        }

        var undoObject = this.getUndoRedoObject();
        undoObject.commandObject = commandObject;
        undoObject.command = command;
        undoObject.value = value;
        undoObject.actionType = "Custom";

        var sel = this.__editorInstance.getSelection();

        if (commandObject.customUndo)
        {
          var parameters = [];
          switch(command)
          {
            case "backgroundcolor":
              parameters.push(qx.bom.element.Style.get(this.__doc.body, "backgroundColor"));
            break;

            case "backgroundimage":
              parameters.push(qx.bom.element.Style.get(this.__doc.body, "backgroundImage"),
                              qx.bom.element.Style.get(this.__doc.body, "backgroundRepeat"),
                              qx.bom.element.Style.get(this.__doc.body, "backgroundPosition"));
            break;

            case "inserthyperlink":
              // If the hyperlinks gets inserted on a selection treat it as a command step
              if (sel && !sel.isCollapsed) {
                undoObject.actionType = "Command";
              }
            break;
          }

          undoObject.parameter  = parameters;
        }
        else
        {
          if ((qx.core.Environment.get("engine.name") == "gecko"))
          {
            /*
             * Ignore commands which normally act on ranges if the current range
             * is collapsed, e.g. Gecko DOES NOT mark setting a collapsed range to
             * bold as an extra action.
             * However commands like inserting an ordered list or table which do not
             * need to act on a range to work should be captured.
             *
             */
            if (sel && sel.isCollapsed)
            {
              switch(command)
              {
                // TODO: create a list of all commands which DO NOT need to act on a range to perform!
                case "insertorderedlist":
                case "insertunorderedlist":
                case "justifyright":
                case "inserthtml":
                case "insertimage":
                  undoObject.actionType = "Command";
                break;

                default:
                  return;
              }
            }
            else {
              undoObject.actionType = "Command";
            }
          }
          else {
            undoObject.actionType = "Command";
          }
        }

        this.__updateUndoStack(undoObject);
      }
    }),


    /**
      * Adds the occurred changes to the undo history and
      * sets a flag for the redo action.
      *
      * @param changeInfo {Object ? String} Infos of the change.
      *                                     Either a map containing details or null for change through a command identifier
      * @return {void}
      */
     __updateUndoStack : function(changeInfo)
     {
       if (this.__contentChange) {
         this.__addAdditionalContentUndoStep();
       }

       this.__addToUndoStack(changeInfo);

       this.__redoPossible = false;
       this.__redoStack    = [];

       this.__fireUndoRedoStateEvent();
     },


     /**
      * Add additional "Content" undo step if the last is no "Content" undo step.
      */
     __addAdditionalContentUndoStep : function()
     {
       var lastUndoStep = this.__undoStack[this.__undoStack.length - 1];
       if (lastUndoStep == null || lastUndoStep.actionType != "Content")
       {
         var undoObject = this.getUndoRedoObject();
         undoObject.actionType = "Content";

         if ((qx.core.Environment.get("engine.name") == "mshtml") ||
             (qx.core.Environment.get("engine.name") == "webkit")) {
           undoObject.content = this.__currentContent;
           undoObject.actionType = "Custom";
           this.__currentContent = null;
         }

         this.__addToUndoStack(undoObject);

         this.__contentChange = false;
       }
     },


     /**
      * Helper method to get an undo object which is added to the undoStack
      *
      * @return {Object} undo object
      */
     getUndoRedoObject : function()
     {
       return {
        actionType: null,
        commandObject: null,
        command: null,
        value: null,
        parameter: null,
        range: null,
        marker: null,
        content: null
      };
     },


     /**
      * Utility method to add an entry to the undoStack.
      *
      * @param changeInfo {Object} Infos of the change
      * @return {void}
      */
     __addToUndoStack : function(changeInfo)
     {
       if ((qx.core.Environment.get("qx.debug")) &&
           qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug"))
       {
         this.debug("ADD TO UNDO STACK");
         this.debug(changeInfo.actionType + " " + changeInfo.command + " " + changeInfo.value);
       }

       this.__undoStack.push(changeInfo);
     },


     /**
      * Utility method to add an entry to the redoStack.
      *
      * @param changeInfo {Object} Infos of the change
      * @return {void}
      */
    __addToRedoStack : function(changeInfo)
    {
      if ((qx.core.Environment.get("qx.debug")) &&
          qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug"))
      {
        this.debug("ADD TO REDO STACK");
        this.debug(changeInfo.actionType + " " + changeInfo.command + " " + changeInfo.value);
      }

      this.__redoStack.push(changeInfo);
    },


     /**
     * Key press handler for the undo manager. Only acts on specific events which
     * are important to the undo manager.
     *
     * @param e {qx.event.type.Key} key event instance
     * @return {void}
     */
    _handleKeyPress : function(e)
    {
      var keyIdentifier = e.getKeyIdentifier().toLowerCase();
      var isCtrlPressed = e.isCtrlPressed();

      switch(keyIdentifier)
      {
        case "control":
        case "shift":
        case "left":
        case "right":
        case "up":
        case "down":
        case "pageup":
        case "pagedown":
        case "home":
        case "end":
        case "enter":
          // these keys do not mark a content change by the user
        break;

        case "a":
        case "b":
        case "i":
        case "u":
        case "k":
        case "y":
        case "z":
          // hitting hotkeys do not mark a content change
          if (!isCtrlPressed) {
            this.__markContentChange();
          }
        break;

        default:
          this.__redoPossible = false;
          this.__redoStack = [];
          this.__markContentChange();
       }
    },


    /**
     * A content change which is handled as separate undo step is marked.
     *
     * @return {void}
     */
    __markContentChange : function()
    {
      if (!this.__contentChange)
      {
        this.__contentChange = true;
        this.__undoPossible = true;

        // store current content for adding it to undo stack later
        if ((qx.core.Environment.get("engine.name") == "mshtml") ||
            (qx.core.Environment.get("engine.name") == "webkit")) {
          this.__currentContent = this.__doc.body.innerHTML;
        }

        this.__fireUndoRedoStateEvent();
      }
    },


    /** Holds the selected node for comparing between mouseUp and mouseDown events */
    __selectedNode : null,


    /**
     * Mouse down handler method.
     * Currently only implemented for IE.
     * Used to track internal changes like resizing an image or a table element.
     *
     * @param e {DOM event} mouse event instance
     * @return {void}
     */
    _handleMouseDown : qx.core.Environment.select("engine.name", {
      "mshtml" : function(e)
      {
        var checkNode = e.getOriginalTarget();

        if (qx.dom.Node.isElement(checkNode) &&
            (qx.dom.Node.isNodeName(checkNode, "img") || qx.dom.Node.isNodeName(checkNode, "table")))
        {
          this.__selectedNode = { node : checkNode,
                                  content : checkNode.outerHTML};
        }
        else {
          this.__selectedNode = null;
        }
      },

      "default" : function(e) {
        return true;
      }
    }),


    /**
     * Mouse up handler method.
     * Used to track internal changes like resizing an image or a table element.
     *
     * @param e {DOM event} mouse event instance
     * @return {void}
     */
    _handleMouseUp : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(e)
      {
        if (this.__editorInstance == null) {
          return;
        }

        var sel = this.__editorInstance.getSelection();

        if (!sel)
        {
          this.__selectedNode = null;
          return;
        }

        var anchorNode = sel.anchorNode;
        var checkNode = anchorNode.childNodes[sel.anchorOffset];

        // We have direct access to the currently selected node (e.g. an image)
        if (qx.dom.Node.isNodeName(checkNode, "img"))
        {
          // Store the element if is not available
          // otherwise compare the current image element with the stored one
          if (this.__selectedNode == null) {
            this.__selectedNode = checkNode.cloneNode(true);
          }
          else
          {
            if (this.__selectedNode.style.width != checkNode.style.width ||
                this.__selectedNode.style.height != checkNode.style.height)
            {
              // A change occurred -> add undo step and update the stored element
              this.__addInternalUndoStep();
              this.__selectedNode = checkNode.cloneNode(true);
            }
          }
        }
        else if (qx.dom.Node.isNodeName(anchorNode, "td") ||
                 qx.dom.Node.isNodeName(anchorNode.parentNode, "td"))
        {
          var tableNode = anchorNode.parentNode;

          while (qx.dom.Node.isNodeName(tableNode, "table")) {
            tableNode = tableNode.parentNode;
          }

          // Store the element if is not available
          // otherwise compare the current table element with the stored one
          if (this.__selectedNode == null) {
            this.__selectedNode = tableNode.cloneNode(true);
          }
          else
          {
            /*
             * Comparison is done inside a timeout method
             * to be sure that the changes (like adding a table cell)
             * to the DOM are already done.
             */
            qx.event.Timer.once(function()
            {
              // Compare width and height and innerHTML
              if (tableNode.style.width != this.__selectedNode.style.width ||
                  tableNode.style.height != this.__selectedNode.style.height ||
                  tableNode.innerHTML != this.__selectedNode.innerHTML)
              {
                // A change occurred -> add undo step and update the stored element
                this.__addInternalUndoStep();
                this.__selectedNode = tableNode.cloneNode(true);
              }
            }, this, 0);
          }
        }
        else {
          this.__selectedNode = null;
        }
      },

      "default" : function(e)
      {
        var checkNode = qx.bom.Event.getTarget(e);

        if (this.__selectedNode != null)
        {
          if (checkNode.nodeType == 1)
          {
            /* Check the clicked element otherwise check the childNodes */
            if (checkNode == this.__selectedNode.node)
            {
              if (checkNode.outerHTML != this.__selectedNode.content)
              {
                this.__selectedNode.content = checkNode.outerHTML;
                this.__addInternalUndoStep();
              }
            }
            else
            {
              for (var i=0, j=checkNode.childNodes.length; i<j; i++)
              {
                if (checkNode.childNodes[i] == this.__selectedNode.node)
                {
                  if (checkNode.childNodes[i].outerHTML != this.__selectedNode.content)
                  {
                    this.__selectedNode.content = checkNode.childNodes[i].outerHTML;
                    this.__addInternalUndoStep();
                  }
                }
              }
            }
          }
          else {
            this.__selectedNode = null;
          }
        }
      }
    }),


    /**
     * Adds an internal undo step to the undo stack.
     *
     * @return {void}
     */
    __addInternalUndoStep : qx.core.Environment.select("engine.name", {
      "mshtml|webkit" : function() {
        this.__collectUndoInfo("Internal", null, null);
      },

      "default" : function()
      {
        var undoStep = this.getUndoRedoObject();
        undoStep.actionType = "Internal";

        this.__addToUndoStack(undoStep);
      }
    }),


    /**
     * Fires the "undoRedoState" event to inform external components (like a toolbar)
     * about the current state of the undo/redo.
     * The event itself is fired from the HtmlArea instance and with a
     * timeout to not interfere with the current key event.
     *
     * @return {void}
     */
    __fireUndoRedoStateEvent : function()
    {
      qx.event.Timer.once(function(e)
      {
        // it may happen that this asynchronous function is executed during/after
        // the dispose phase.
        if (this.__editorInstance != null)
        {
          var data = {
            undo : this.isUndoPossible() ? 0 : -1,
            redo : this.isRedoPossible() ? 0 : -1
          };
          this.__editorInstance.fireDataEvent("undoRedoState", data);
        }
      }, this, 200);
    }
  },


  /**
   * Destructor
   */
  destruct : function()
  {
    try
    {
      qx.event.Registration.removeListener(this.__doc.body, "keypress", this.__handleKeyPress);
      qx.event.Registration.removeListener(this.__doc, "mouseup", this.__handleMouseUp);

      if ((qx.core.Environment.get("engine.name") == "mshtml")) {
        qx.event.Registration.removeListener(this.__doc, "mousedown", this.__handleMouseDown);
      }
    }
    catch(e) {}

    this._disposeObjects("__commandManager");
    this.__editorInstance = this.__undoStack = this.__redoStack = this._commands = this.__doc = null;
    this.__knownActionTypes = this.__registeredHandler = null;
  }
});