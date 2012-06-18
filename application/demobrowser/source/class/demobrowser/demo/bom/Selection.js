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
     * Alexander Steitz (aback)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Selection",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      /* ***************************************
       *  SETUP
       * ************************************* */
      var container = qx.dom.Element.create("div", { id : "container", style : "position:relative;padding:20px"});


      /* TEXT */
      var textContainer = qx.dom.Element.create("div", { id : "textContainer", style : "width:100%;margin-bottom:20px" });
      qx.dom.Element.insertEnd(textContainer, container);

      var textBlock = qx.dom.Element.create("div", { id : "textBlock", style : "margin-bottom:20px" });
      textBlock.innerHTML = "test test2 test3 test4 test5 test6";
      qx.dom.Element.insertEnd(textBlock, textContainer);

      var getSelDocumentButton = qx.bom.Input.create("button", { value : "getSelectionDocument", style : "margin: 4px"});
      qx.bom.Element.addListener(getSelDocumentButton, "click", this._getSelection, document);
      qx.dom.Element.insertEnd(getSelDocumentButton, textContainer);

      var setSelDocumentButton = qx.bom.Input.create("button", { value : "setSelectionDocument", style : "margin: 4px"});
      qx.bom.Element.addListener(setSelDocumentButton, "click", function(e)
      {
        qx.bom.Selection.set(document.getElementById("plaintext").firstChild, 0, 4);
        this.debug(qx.bom.Selection.getLength(document));
      }, this);
      qx.dom.Element.insertEnd(setSelDocumentButton, textContainer);


      var getStartDocumentButton = qx.bom.Input.create("button", { value : "getStartSelectionDocument", style : "margin: 4px"});
      qx.bom.Element.addListener(getStartDocumentButton, "click", this._getStart, document);
      qx.dom.Element.insertEnd(getStartDocumentButton, textContainer);

      var getEndDocumentButton = qx.bom.Input.create("button", { value : "getEndSelectionDocument", style : "margin: 4px"});
      qx.bom.Element.addListener(getEndDocumentButton, "click", this._getEnd, document);
      qx.dom.Element.insertEnd(getEndDocumentButton, textContainer);


      /* INPUT ELEMENT */
      var inputContainer = qx.dom.Element.create("div", { id : "inputContainer", style : "width:100%;margin-bottom:20px" });
      qx.dom.Element.insertEnd(inputContainer, container);

      this._input = qx.bom.Input.create("text", { id : "textfield", value : "test text", style:"width:20%;margin-right:10px" });
      qx.dom.Element.insertEnd(this._input, inputContainer);

      var getSelInputButton = qx.bom.Input.create("button", { value : "getSelectionInput", style : "margin-right: 8px"});
      qx.bom.Element.addListener(getSelInputButton, "click", this._getSelection, this._input);
      qx.dom.Element.insertEnd(getSelInputButton, inputContainer);

      var setSelInputButton = qx.bom.Input.create("button", { value : "setSelectionInput", style : "margin-right: 8px"});
      qx.bom.Element.addListener(setSelInputButton, "click", this._setSelection, this._input);
      qx.dom.Element.insertEnd(setSelInputButton, inputContainer);

      var getStartInputButton = qx.bom.Input.create("button", { value : "getStart", style : "margin-right: 8px"});
      qx.bom.Element.addListener(getStartInputButton, "click", this._getStart, this._input);
      qx.dom.Element.insertEnd(getStartInputButton, inputContainer);

      var getEndInputButton = qx.bom.Input.create("button", { value : "getEnd", style : "margin-right: 8px"});
      qx.bom.Element.addListener(getEndInputButton, "click", this._getEnd, this._input);
      qx.dom.Element.insertEnd(getEndInputButton, inputContainer);


      /* TEXTAREA ELEMENT */
      var areaContainer = qx.dom.Element.create("div", { id : "areaContainer", style : "width:100%;margin-bottom:20px" });
      qx.dom.Element.insertEnd(areaContainer, container);

      this._textArea = qx.bom.Input.create("textarea", { id : "textarea", rows : 7, cols : 20, value : "test\ntest2\ntest3\ntest4\ntest5", style : "width:300px;height:250px" });
      qx.dom.Element.insertEnd(this._textArea, areaContainer);

      var getSelTextAreaButton = qx.bom.Input.create("button", { value : "getSelectionTextarea", style : "margin-right: 8px"});
      qx.bom.Element.addListener(getSelTextAreaButton, "click", this._getSelection, this._textArea);
      qx.dom.Element.insertEnd(getSelTextAreaButton, areaContainer);

      var setSelTextAreaButton = qx.bom.Input.create("button", { value : "setSelectionTextarea", style : "margin-right: 8px"});
      qx.bom.Element.addListener(setSelTextAreaButton, "click", this._setSelection, this._textArea);
      qx.dom.Element.insertEnd(setSelTextAreaButton, areaContainer);

      var getStartTextAreaButton = qx.bom.Input.create("button", { value : "getStart", style : "margin-right: 8px"});
      qx.bom.Element.addListener(getStartTextAreaButton, "click", this._getStart, this._textArea);
      qx.dom.Element.insertEnd(getStartTextAreaButton, areaContainer);

      var getEndTextAreaButton = qx.bom.Input.create("button", { value : "getEnd", style : "margin-right: 8px"});
      qx.bom.Element.addListener(getEndTextAreaButton, "click", this._getEnd, this._textArea);
      qx.dom.Element.insertEnd(getEndTextAreaButton, areaContainer);



      var resultLabel = qx.dom.Element.create("div", { style : "margin: 4px 0px" });
      resultLabel.innerHTML = "<strong>Results</strong>";

      var resultDiv = qx.dom.Element.create("div", { id : "results", style : "width:500px;height:200px;" +
                                                                              "border:1px solid darkgrey;" +
                                                                              "background-color: lightgrey" });
      qx.dom.Element.insertEnd(resultLabel, container);
      qx.dom.Element.insertEnd(resultDiv, container);


      var textDiv = qx.dom.Element.create("div", { id : "plaintext" });
      textDiv.innerHTML = "this is a test";

      qx.dom.Element.insertEnd(textDiv, document.body);
      qx.dom.Element.insertEnd(container, document.body);
    },

    /* ***************************************
     *  EVENT LISTENER
     * ************************************* */
    _getSelection : function(e)
    {
      document.getElementById("results").innerHTML = qx.bom.Selection.get(this) +
                                                     "<br/>" +
                                                     qx.bom.Selection.getLength(this);
    },

    _getStart : function(e) {
      document.getElementById("results").innerHTML = qx.bom.Selection.getStart(this);
    },

    _getEnd : function(e) {
      document.getElementById("results").innerHTML = qx.bom.Selection.getEnd(this);
    },

    _setSelection : function(e)
    {
      qx.bom.Selection.set(this, 0, 7);
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this._input = this._textArea = null;
  }
});
