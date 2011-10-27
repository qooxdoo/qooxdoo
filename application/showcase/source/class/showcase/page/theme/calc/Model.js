/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("showcase.page.theme.calc.Model",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.initState();
  },

  properties :
  {
    state :
    {
      check : ["number", "waitForNumber", "error"],
      event : "changeState",
      init : "number",
      apply : "_applyState"
    },

    errorMessage :
    {
      check : "String",
      init : "",
      event : "changeErrorMessage"
    },

    input :
    {
      check : "String",
      nullable : true,
      event : "changeInput"
    },

    maxInputLength :
    {
      check : "Integer",
      init : 20
    },

    operator :
    {
      check : ["+", "-", "*", "/"],
      nullable : true,
      event : "changeOperator"
    },

    operant :
    {
      check : "Number",
      nullable : true,
      event : "changeOperant"
    },

    value :
    {
      check : "Number",
      nullable : true,
      event : "changeValue"
    },

    memory :
    {
      check : "Number",
      nullable : true,
      event : "changeMemory"
    }
  },

  members :
  {
    readToken : function(token)
    {
      if (token.match(/^[0123456789]$/)) {
        this.__readDigit(token);
      } else if (token.match(/^[\+\-\*\/]$/)) {
        this.__readBinaryOperator(token);
      } else if (token == "sign") {
        this.__readSign();
      } else if (token == ".") {
        this.__readDot();
      } else if (token == "=") {
        this.__readEquals();
      } else if (token == "C") {
        this.__readClear();
      } else if (token == "M+") {
        this.__readMemory(token);
      } else if (token == "M-") {
        this.__readMemory(token);
      } else if (token == "MC") {
        this.__readMemoryClear();
      } else if (token == "MR") {
        this.__readMemoryRestore();
      }
    },


    __getInputAsNumber : function() {
      return parseFloat(this.getInput());
    },


    __compute : function(operant1, operant2, operator)
    {
      switch (operator)
      {
        case "+":
          return operant1 + operant2;
        case "-":
          return operant1 - operant2;
        case "*":
          return operant1 * operant2;
        case "/":
          if (operant2 == 0)
          {
            this.setErrorMessage("Division by zero!");
            this.setState("error");
            return null;
          } else {
            return operant1 / operant2;
          }
      }
    },


    _applyState : function(value, old)
    {
      if (value == "number") {
        this.setInput("0");
      } else if (value == "error") {
        this.setOperator(null);
      }
    },


    __readDigit : function(digit)
    {
      this.setState("number");
      var input = this.getInput();

      if (input.length >= this.getMaxInputLength()-1) {
        return;
      }

      if (digit == "0")
      {
        if (input !== "0") {
          input += "0";
        }
      }
      else
      {
        if (input == "0") {
          input = digit;
        } else {
          input += digit;
        }
      }

      this.setInput(input);
    },


    __readSign : function()
    {
      this.setState("number");
      var input = this.getInput();

      if (input == "0") {
        return;
      }
      var isNegative = input.charAt(0) == "-";
      if (isNegative) {
        input = input.substr(1);
      } else {
        input = "-" + input;
      }
      this.setInput(input);
    },


    __readDot : function()
    {
      this.setState("number");
      var input = this.getInput();

      if (input.length >= this.getMaxInputLength()-1) {
        return;
      }

      var isFraction = input.indexOf(".") !== -1;
      if (!isFraction) {
        input += ".";
      }
      this.setInput(input);
    },


    __readBinaryOperator : function(operator)
    {
      var state = this.getState();

      if (state == "error") {
        return;
      } else if (state == "waitForNumber") {
        this.setOperator(operator);
        return;
      }
      this.setState("waitForNumber");

      var operant = this.__getInputAsNumber();
      var value = this.getValue();

      if (value !== null) {
        this.setValue(this.__compute(value, operant, this.getOperator()));
      } else {
        this.setValue(operant);
      }

      this.setOperant(operant);
      this.setOperator(operator);
    },


    __readEquals : function()
    {
      var operator = this.getOperator();
      if (!operator) {
        return;
      }
      var value = this.getValue();

      if (this.getState() == "waitForNumber")
      {
        this.setValue(this.__compute(value, this.getOperant(), operator));
        return;
      }

      this.setState("waitForNumber");

      var operant = this.__getInputAsNumber();
      this.setOperant(operant);

      this.setValue(this.__compute(value, operant, operator));
    },


    __readClear : function()
    {
      this.setState("number");
      this.setOperator(null);
      this.setValue(null);
      this.setInput("0");
    },


    __readMemory : function(token)
    {
      var state = this.getState();
      var value;

      if (state == "error") {
        return
      } else if (state == "waitForNumber") {
        value = this.getValue();
      } else {
        value = this.__getInputAsNumber();
      }

      var memory = this.getMemory() || 0;
      if (token == "M+") {
        this.setMemory(memory + value);
      } else {
        this.setMemory(memory - value);
      }
    },


    __readMemoryRestore : function()
    {
      var memory = this.getMemory();
      if (memory == null) {
        return;
      }
      this.setState("number");
      this.setInput(memory.toString());
    },


    __readMemoryClear: function() {
      this.setMemory(null);
    }
  }
});