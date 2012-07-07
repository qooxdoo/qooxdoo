/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("inspector.console.ConsoleView",
{
  extend : qx.ui.core.Widget,


  construct : function(console)
  {
    this.base(arguments);

    // store the reference to the window
    this._console = console;

    // create the popup for the auto completion
    this._autoCompletePopup = new inspector.console.AutoCompletePopup(this);

    // history stuff
    this._history = [];
    this._historyCounter = -1;

    // object folder
    this._objectFolder = [];
    this._objectFolderIndex = 0;

    // search stuff
    this._filter = "";

    // set the layout
    this._setLayout(new qx.ui.layout.VBox());

    // html embed
    this._content = new qx.ui.embed.Html("");
    this._content.setOverflowY("scroll");
    this._add(this._content, {flex: 1});

    // inputfield
    var inputComposite = new qx.ui.container.Composite();
    inputComposite.setDecorator("inset");
    var layout = new qx.ui.layout.HBox();
    layout.setAlignY("middle");
    inputComposite.setLayout(layout);
    this._add(inputComposite);
    var leadingLabel = new qx.ui.basic.Label(">>>");
    var font = new qx.bom.Font(12, ["Courier New"]);
    // TODO Blue arrows at the beginning
    leadingLabel.setFont(font);
    inputComposite.add(leadingLabel);
    this._inputTextField = new qx.ui.form.TextField("");
    this._inputTextField.setLiveUpdate(true);
    this._inputTextField.setDecorator(null);
    this._inputTextField.setFont(font);
    inputComposite.add(this._inputTextField, {flex: 1});

    // add the listener to the textfield
    this._inputTextField.addListener("keydown", this._keyDownHandler, this);
    this._inputTextField.addListener("keyup", this._keyUpHandler, this);
    this._inputTextField.addListener("keypress", this._keyPressHandler, this);

    this._inputTextField.addListener("changeValue", function(e) {
      if (this._autoCompletePopup.isOnScreen()) {
        this._autoCompletePopup.load(e.getData());
      }
    }, this);
  },

  members :
  {
    clear: function() {
      this._content.setHtml("");
    },


    getObjectById: function(id) {
      return this._objectFolder[id];
    },


    /**
     * TODOC
     *
     * @lint ignoreDeprecated(alert)
     * @param filter {}
     */
    filter: function(filter) {
      // store the new filter
      this._filter = filter;

      // try to filter
      try {
        var children = this._content.getContentElement().getDomElement().childNodes;

        // create a regexp object for filtering
        var regExp = new RegExp(this._filter);
        // go threw all children
        for (var i = 0; i < children.length; i++) {
          // if the browser is a ie
          if (qx.core.Environment.get("engine.name") == "mshtml") {
            // take the innerText as content
            var content = children[i].innerText;
          }  else {
            // for all others, take the textContent as content
            var content = children[i].textContent;
          }

          // test if the current content fits the filter
          if (qx.dom.Node.isElement(children[i]))
          {
            if (regExp.test(content)) {
              qx.bom.element.Style.set(children[i], "display", null);
            } else {
              qx.bom.element.Style.set(children[i], "display", "none");
            }
          }
        }
      } catch (e) {
        // if that doesnt work, tell the user why
        alert("Unable to filter: " + e);
      }
    },


    chooseAutoCompleteValue: function() {
      // get the current value of the textfield
      var value = this._inputTextField.getValue();
      // get the value to add to the textfield
      var name = this._autoCompletePopup.getCurrentSelection();
      // if something is selected
      if (name) {
        // get the stuff after the dot in the textfield
        var afterDot = value.substring(value.lastIndexOf(".") + 1);
        // remove the characters which are already in the textfield
        name = name.substring(afterDot.length, name.length);
        // append the new selected string
        this.appendString(name);
      }
      // hide the popup
      this._autoCompletePopup.hide();
      // focus the textfield
      this._inputTextField.focus();
    },


    appendString: function(string) {
      if (string != null) {
        // append the given string to the textfield
        this._inputTextField.setValue(this._inputTextField.getValue() + string);
        // if there is a ( in the textfield
        if (this._inputTextField.getValue().lastIndexOf("(") != -1) {
          // mark the stuff in the ()
          var start = this._inputTextField.getValue().lastIndexOf("(") + 1;
          var end = this._inputTextField.getValue().length - 1;
          this._inputTextField.setTextSelection(start, end);
        }
      }
    },



    _process: function(text) {
      // add the text to the embedded
      this._printText(this._console.escapeHtml(text));

      try {
        var object = inspector.console.Util.evalOnIframe(text);

        if (object != null)
        {
          this._objectFolder[this._objectFolderIndex] = {name: text, object: object};
          this._printReturnValue(object);
          this._objectFolderIndex++;
        }
      } catch (ex) {
        this.error(ex);
      }
    },



    _keyDownHandler: function(e) {

      // if the esc key is pressed
      if (e.getKeyIdentifier() == "Escape") {
        // hide the auto complete popup
        this._autoCompletePopup.hide();
        return;
      }

      // if the enter button is pressed
      if (e.getKeyIdentifier() == "Enter") {
        // if the auto complete popup is not on the screen
        if (!this._autoCompletePopup.isOnScreen()) {
          // save the string in the history
          this._history.unshift(this._inputTextField.getValue());
          // process the input
          this._process(this._inputTextField.getValue());
          // empty the textfield
          this._inputTextField.setValue("");
          // rest the history counter
          this._historyCounter = -1;
          // if the history is bigger than it should be
          if (this._history.length > 20) {
            // remove the last element
            this._history.pop();
          }
        // if the popup is on screen
        } else {
          this.chooseAutoCompleteValue();
        }
        return;
      }

      // if the up key is pressed
      if (e.getKeyIdentifier() == "Up") {
        // prevent that the cursor is set to another position
        e.preventDefault();
        // if the popup is on screen
        if (!this._autoCompletePopup.isOnScreen()) {
          // if a value is in the history
          if (this._history[this._historyCounter + 1] != undefined) {
            // increase the counter
            this._historyCounter++;
            // set the value to the textfield
            this._inputTextField.setValue(this._history[this._historyCounter]);
          }
        }
        return;
      }

      // if the down key is pressed
      if (e.getKeyIdentifier() == "Down") {
        // prevent that the cursor is set to another position
        e.preventDefault();
        // if the popup is nor on screen
        if (!this._autoCompletePopup.isOnScreen()) {
          // check if the counter is bigger than 0
          if (this._historyCounter > 0) {
            // if yes, decreass the counter
            this._historyCounter--;
            // set the new value from the history
            this._inputTextField.setValue(this._history[this._historyCounter]);
          }
        }
        return;
      }

      // if the control key is pressed
      if (e.getKeyIdentifier() == "Control") {
        // mark that in a flag
        this._ctrl = true;
        return;
      }

      // if the space or tab is pressed
      if (e.getKeyIdentifier() == "Space" || e.getKeyIdentifier() == "Tab") {
        // check if the control button is pressed
        if (this._ctrl || e.getKeyIdentifier() == "Tab") {
          // prevent the browser from leaving the textfield
          e.preventDefault();

          // if tab is the pressed key
          if (e.getKeyIdentifier() == "Tab") {
            var self = this;
            // remove the selection of the text
            window.setTimeout(function() {
              var length = self._inputTextField.getValue().length;
              self._inputTextField.setTextSelection(length, length);
            }, 0);
          }

          // do the auto complete
          try {
            // get the position for the popup
            var left = qx.bom.element.Location.getLeft(
              this.getContainerElement().getDomElement()
            );
            var top = qx.bom.element.Location.getTop(
              this._inputTextField.getContentElement().getDomElement()
            ) - this._autoCompletePopup.getHeight();
            // tell the popup to show itself
            this._autoCompletePopup.open(this._inputTextField.getValue(), left, top);
            // but still focus the textfield
            var self= this;
            window.setTimeout(function() {
              self._inputTextField.focus();
            }, 0);
          } catch (ex) {
            // do nothing
            this.info(ex);
          }
        }
        return;
      }
    },


    _keyUpHandler: function(e) {
      // if the control key will be released
      if (e.getKeyIdentifier() == "Control") {
        // remove the control flag
        this._ctrl = false;
      }
    },



    _keyPressHandler: function(e) {
      if (this._autoCompletePopup.isOnScreen()) {
        if (e.getKeyIdentifier() == "Down") {
          this._autoCompletePopup.selectionDown();
        } else if (e.getKeyIdentifier() == "Up") {
          this._autoCompletePopup.selectionUp();
        }
      }
    },


    _scrollToLastLine: function() {
      // flush the queues to ensure that the adding has been recognized
      qx.ui.core.queue.Manager.flush();
      // wait until everything is done
      var self = this;
      window.setTimeout(function() {
        // scroll to the bottom of the layout
        var element = self._content.getContentElement();

        var domElement = self._content.getContentElement().getDomElement();
        if (domElement != null) {
          var height = qx.bom.element.Dimension.getContentHeight(domElement);
          element.scrollToY(height);
        }
      }, 0);
    },




    /*
    *********************************
       PRINT FUNCTIONS
    *********************************
    */
    /**
     * Pints out a return value to the console. This also includes a special
     * treatment for qooxdoo objects and array.
     * @param returnValue {Object} The value to print.
     */
    _printReturnValue: function(returnValue) {
      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();

      // check for qooxdoo objects
      if (iFrameWindow && returnValue instanceof iFrameWindow.qx.core.Object) {
        // print out the qooxdoo object
        this._printQxObject(returnValue);

      // check for arrays
      } else if (returnValue instanceof iFrameWindow.Array) {
        var arrayRepresentation = this._printArray(returnValue);

        var label = this._getLabel("<span class='ins_console_link' onclick='" +
                                   "qx.core.Init.getApplication().inspectObjectByInternalId(" + this._objectFolderIndex + ")" +
                                   "'>" + arrayRepresentation + "</span>", "ins_console_return_array");
        this._content.setHtml(this._content.getHtml() + label);
        return;

      // check for objects
      } else if (iFrameWindow && (returnValue instanceof iFrameWindow.Object ||
          returnValue == iFrameWindow.window ||
          returnValue == iFrameWindow.document)) {
        // if yes, print out that it is one
        var label = this._getLabel("<span class='ins_console_link' onclick='" +
                                   "qx.core.Init.getApplication().inspectObjectByInternalId(" + this._objectFolderIndex + ")" +
                                   "'>" + returnValue + " </span>", "ins_console_return_object");
        this._content.setHtml(this._content.getHtml() + label);

        return;

      // everything else
      } else {
        // print out the return value
        var label = this._getLabel(returnValue, "ins_console_return_primitive");
        this._content.setHtml(this._content.getHtml() + label);
      }
      // scroll to the end of the console
      this._scrollToLastLine();
    },


    /**
     * Prints out a qooxdoo object to the console including a link to set
     * the object as the current selected object.
     * @param object {qx.core.Object} The qooxdoo object to print.
     */
    _printQxObject: function(object) {
      // build the label string
      var label = this._getLabel(
        "<span class='ins_console_link' onclick="
        + "\"qx.core.Init.getApplication().setWidgetByHash('"
        + object.toHashCode() + "', 'console');\"> " + object.classname
        + " [" + object.toHashCode() + "]</span> "
        + "<span class='ins_console_dom_link' onclick='" +
              "qx.core.Init.getApplication().inspectObjectByInternalId(" + this._objectFolderIndex + ")" +
              "'>inspect Object</span>",
        "ins_console_return_qxobject");
      // append the label string
      this._content.setHtml(this._content.getHtml() + label);
      // scroll to the end of the console
      this._scrollToLastLine();
    },


    /**
     * Prints out a standard text in black with the leading ">>> " to the console.
     * @param text {String} The text to print out.
     */
    _printText: function(text) {
      var label = this._getLabel(">>>&nbsp;" + text, "ins_console_text");
      this._content.setHtml(this._content.getHtml() + label);
      // scroll to the end of the console
      this._scrollToLastLine();
    },


    /*
    *********************************
       CREATE FUNCTIONS
    *********************************
    */
    /**
     * Creates a String containing a div corresponding to the given values.
     * @param text {String} The text of the label.
     * @param clazz {String} the css class of the div.
     * @param icon {String} The icon to show.
     */
    _getLabel: function(text, clazz, icon) {
      // create the text of the label
      var text = text;
      // handle the icon uri
      if (icon == "info" || icon == "error" || icon == "warning") {
        var imageURI = qx.util.ResourceManager.getInstance().toUri("inspector/images/shell/" +
                       icon + "Icon.png");
        var iconHtml = "<img src='" + imageURI + "' class='ins_console_icon'>";
        text = iconHtml + "&nbsp;" + text;
      }
      // create the surrounding div
      text = "<div class='ins_console_common'><div class='" + clazz + "'>" + text + "</div></div>";
      // return the text String
      return text;
    },

    _printArray : function(value)
    {
      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      if (value instanceof iFrameWindow.Array)
      {
        var result = new qx.util.StringBuilder();
        var length = value.length;
        var more = "";

        if (length > 2)
        {
          more = ", ..." + (length - 2) + " more";
          length = 2;
        }

        for (var i = 0; i < length; i++) {
          if (!result.isEmpty()) {
            result.add(", ");
          }

          result.add(this._printArray(value[i]));
        }

        return "[" + result.get() + more +"]";
      }
      else {
        return value;
      }
    },


    /*
    *********************************
       APPENDER IMPLEMENTATIONS
    *********************************
    */
    /**
     * Prints out an error to the console.
     * @param message {String} The error message.
     */
    error: function(message) {
      // open the console if it is not opened
      if (!this._console.isVisible()) {
        this._console.open();
      }
      var label = this._getLabel(message, "ins_console_error", "error");
      this._content.setHtml(this._content.getHtml() + label);
      // scroll to the end of the console
      this._scrollToLastLine();
    },


    /**
     * Prints out a warning message to the console.
     * @param message {String} The warning message to print out.
     */
    warn: function(message) {
      // open the console if it is not opened
      if (!this._console.isVisible()) {
        this._console.open();
      }
      var label = this._getLabel(message, "ins_console_warn", "warning");
      this._content.setHtml(this._content.getHtml() + label);
      // scroll to the end of the console
      this._scrollToLastLine();
    },


    /**
     * Prints out an info message to the console.
     * @param message {String} The info message.
     */
    info: function(message) {
      // open the console if it is not opened
      if (!this._console.isVisible()) {
        this._console.open();
      }
      var label = this._getLabel(message, "ins_console_info", "info");
      this._content.setHtml(this._content.getHtml() + label);
      // scroll to the end of the console
      this._scrollToLastLine();
    },


    /**
     * Prints out an debug message to the console.
     * @param message {String} The debug message.
     */
    debug: function(message) {
      // open the console if it is not opened
      if (!this._console.isVisible()) {
        this._console.open();
      }
      var label = this._getLabel(message, "ins_console_debug");
      this._content.setHtml(this._content.getHtml() + label);
      // scroll to the end of the console
      this._scrollToLastLine();
    }
  }
});