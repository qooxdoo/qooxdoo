/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/22/apps/utilities-calculator.png)

#tag(showcase)

************************************************************************ */

qx.Class.define("demobrowser.demo.showcase.Calculator",
{
  extend : qx.application.Standalone,

  members :
  {
    __display : null,
    __cal : null,


    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @return {void}
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;

        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
       */

      this.__cal = new demobrowser.demo.showcase.CalculatorLogic();
      this.createCalculator();
    },


    /**
     * creates the user interface of the calculator
     *
     * @return {void}
     */
    createCalculator : function()
    {
      // Create the Window
      var win = new qx.ui.window.Window("Calculator", "icon/22/apps/utilities-calculator.png");
      win.setLayout(new qx.ui.layout.VBox(16));
      var border = new qx.ui.decoration.Single(1, "solid", "black");

      var box = new qx.ui.container.Composite().set(
      {
        minWidth   : 180,
        minHeight  : 280,
        padding    : 3,
        allowGrowX : true,
        allowGrowY : true
      });

      var gridLayout = new qx.ui.layout.Grid(5, 5);

      box.setLayout(gridLayout);

      this.__display = new qx.ui.basic.Label(this.__cal.getCurrentValue().toString()).set(
      {
        decorator : border,
        backgroundColor : "white",
        allowGrowX : true,
        allowGrowY : true,
        minWidth : 160,
        height : 50,

        font : new qx.bom.Font().set(
        {
          size   : 22,
          family : [ "Verdana", "sans-serif" ],
          bold   : true
        }),

        textAlign : "right"
      });

      this.__display.setEnabled(false);

      var fontButton = new qx.bom.Font().set(
      {
        size   : 14,
        family : [ "Verdana", "sans-serif" ],
        bold   : true
      });

      var button0 = new qx.ui.form.Button("0").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button1 = new qx.ui.form.Button("1").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button2 = new qx.ui.form.Button("2").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button3 = new qx.ui.form.Button("3").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button4 = new qx.ui.form.Button("4").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button5 = new qx.ui.form.Button("5").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button6 = new qx.ui.form.Button("6").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button7 = new qx.ui.form.Button("7").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button8 = new qx.ui.form.Button("8").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var button9 = new qx.ui.form.Button("9").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonC = new qx.ui.form.Button("C").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonCE = new qx.ui.form.Button("CE").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonDelete = new qx.ui.form.Button("Del").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonChangeSign = new qx.ui.form.Button("+/-").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonComma = new qx.ui.form.Button(".").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonPlus = new qx.ui.form.Button("+").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonMinus = new qx.ui.form.Button("-").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonMultiplication = new qx.ui.form.Button("*").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonDivision = new qx.ui.form.Button("/").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      var buttonResult = new qx.ui.form.Button("=").set(
      {
        font     : fontButton,
        minWidth : 40
      });

      gridLayout.setColumnFlex(0, 1);
      gridLayout.setColumnFlex(1, 1);
      gridLayout.setColumnFlex(2, 1);
      gridLayout.setColumnFlex(3, 1);

      gridLayout.setRowFlex(1, 1);
      gridLayout.setRowFlex(2, 1);
      gridLayout.setRowFlex(3, 1);
      gridLayout.setRowFlex(4, 1);
      gridLayout.setRowFlex(5, 1);
      gridLayout.setRowFlex(6, 1);

      box.add(this.__display,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 4
      });

      box.add(buttonC,
      {
        row     : 1,
        column  : 2,
        rowSpan : 1,
        colSpan : 2
      });

      box.add(buttonCE,
      {
        row    : 1,
        column : 1
      });

      box.add(buttonDelete,
      {
        row    : 1,
        column : 0
      });

      box.add(button7,
      {
        row    : 2,
        column : 0
      });

      box.add(button8,
      {
        row    : 2,
        column : 1
      });

      box.add(button9,
      {
        row    : 2,
        column : 2
      });

      box.add(buttonDivision,
      {
        row    : 2,
        column : 3
      });

      box.add(button4,
      {
        row    : 3,
        column : 0
      });

      box.add(button5,
      {
        row    : 3,
        column : 1
      });

      box.add(button6,
      {
        row    : 3,
        column : 2
      });

      box.add(buttonMultiplication,
      {
        row    : 3,
        column : 3
      });

      box.add(button1,
      {
        row    : 4,
        column : 0
      });

      box.add(button2,
      {
        row    : 4,
        column : 1
      });

      box.add(button3,
      {
        row    : 4,
        column : 2
      });

      box.add(buttonMinus,
      {
        row    : 4,
        column : 3
      });

      box.add(button0,
      {
        row    : 5,
        column : 0
      });

      box.add(buttonChangeSign,
      {
        row    : 5,
        column : 1
      });

      box.add(buttonComma,
      {
        row    : 5,
        column : 2
      });

      box.add(buttonPlus,
      {
        row    : 5,
        column : 3
      });

      box.add(buttonResult,
      {
        row     : 6,
        column  : 0,
        rowSpan : 1,
        colSpan : 4
      });

      win.setWidth(260);
      win.setMinWidth(260);
      win.setHeight(260);
      win.open();

      this.getRoot().add(win,
      {
        left : 20,
        top  : 20
      });

      win.add(box, { flex : 1 });

      buttonC.addListener("execute", function(e)
      {
        this.__cal.cleanDisplay();
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      buttonCE.addListener("execute", function(e)
      {
        this.__cal.clearEntry();

        if (this.__cal.getResult() != null) {
          this.__display.setValue(this.__cal.getCurrentValue().toString());
        }
      },
      this);

      buttonDelete.addListener("execute", function(e)
      {
        this.__cal.deleteNumber();
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      buttonChangeSign.addListener("execute", function(e)
      {
        this.__cal.setSign();

        if (this.__cal.getResult() != null) {
          this.__display.setValue(this.__cal.getResult().toString());
        }
      },

      // this.__cal.resetCurrentValue();
      this);

      button0.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(0);
        this.__display.setValue(this.__cal.getCurrentValue().toFixed(this.__cal.getZeroCounter()).toString());
      },
      this);

      button1.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(1);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button2.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(2);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button3.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(3);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button4.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(4);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button5.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(5);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button6.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(6);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button7.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(7);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button8.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(8);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      button9.addListener("execute", function(e)
      {
        this.__cal.setCurrentValue(9);
        this.__display.setValue(this.__cal.getCurrentValue().toString());
      },
      this);

      buttonPlus.addListener("execute", function(e)
      {
        this.__cal.calculate("+");

        if (this.__cal.getResult() != null) {
          this.__display.setValue(this.__cal.getResult().toString());
        }

        this.__cal.resetCurrentValue();
      },
      this);

      buttonMinus.addListener("execute", function(e)
      {
        this.__cal.calculate("-");

        if (this.__cal.getResult() != null) {
          this.__display.setValue(this.__cal.getResult().toString());
        }

        this.__cal.resetCurrentValue();
      },
      this);

      buttonMultiplication.addListener("execute", function(e)
      {
        this.__cal.calculate("*");

        if (this.__cal.getResult() != null) {
          this.__display.setValue(this.__cal.getResult().toString());
        }

        this.__cal.resetCurrentValue();
      },
      this);

      buttonDivision.addListener("execute", function(e)
      {
        this.__cal.calculate("/");

        if (this.__cal.getResult() != null) {
          this.__display.setValue(this.__cal.getResult().toString());
        }

        this.__cal.resetCurrentValue();
      },
      this);

      buttonResult.addListener("execute", function(e)
      {
        this.__cal.calculate("=");

        if (this.__cal.getResult() != null) {
          this.__display.setValue(this.__cal.getResult().toString());
        }

        this.__cal.resetCurrentValue();
      },
      this);

      buttonComma.addListener("execute", function(e) {
        this.__cal.setComma();
      }, this);
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("__cal", "__display");
  }
});

/*
 * PLEASE NOTE:
 * For demonstration purposes the following class is added to the same file as
 * the application class. For a regular qooxdoo application each class must live
 * in a file of its own. You may neglect any warnings when generating this demo.
 */

/**
 * This class is responsible for the logic of the calculator.
 */
qx.Class.define("demobrowser.demo.showcase.CalculatorLogic",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);
  },

  members :
  {
    __currentValue : 0,
    __result : 0,
    __currentOperation : "n",
    __opCounter : 0,
    __resultContainer : 0,
    __ecCounter : 0,
    __isCommaPressed : false,
    __commaDivider : 1,
    __zeroCounter : 0,
    __isSigned : false,
    __signPressedCounter : 0,


    /**
     * sets the pressed number into the display.
     *
     * @param __currentValue {var} Pressed number
     * @return {void}
     */
    setCurrentValue : function(__currentValue)
    {

      if (this.__isCommaPressed)
      {
        this.__commaDivider *= 10;
        this.__currentValue = this.__currentValue + (__currentValue / this.__commaDivider);

        if (__currentValue == 0) {
          this.__zeroCounter++;
        }
      }
      else
      {
        this.__isCommaPressed = false;

        if (this.__currentValue < 0) {
          this.__currentValue = this.__currentValue * 10 - __currentValue;
        } else {

        this.__currentValue = this.__currentValue * 10 + __currentValue;
        }

      }

    },


    /**
     * returns the counter to regulate the decimal place.
     *
     * @return __zeroCounter {var} a counter
     */
    getZeroCounter : function() {
      return this.__zeroCounter;
    },


    /**
     * sets a comma.
     *
     * @return {void}
     */
    setComma : function() {
      this.__isCommaPressed = true;
    },


    /**
     * returns the pressed number.
     *
     * @return __currentValue is the pressed value
     */
    getCurrentValue : function() {
      return this.__currentValue;
    },


    /**
     * resets the pressed number.
     *
     * @return {void}
     */
    resetCurrentValue : function() {
      this.__currentValue = null;
    },


    /**
     * cleans the display and resets all variables.
     *
     * @return {void}
     */
    cleanDisplay : function()
    {
      this.__signPressedCounter = 0;
      this.__resultContainer = 0;
      this.__currentOperation = "n";
      this.__zeroCounter = 0;
      this.__commaDivider = 1;
      this.__isCommaPressed = false;
      this.__ecCounter = 0;
      this.__opCounter = 0;
      this.__currentValue = 0;
      this.__result = 0;
      this.__isSigned = false;
    },


    /**
     * sets the result.
     *
     * @param __result {var} the calculated result.
     * @return {void}
     */
    setResult : function(__result) {
      this.__result = __result;
    },


    /**
     * returns the calculated result.
     *
     * @return __result {var} calculated result.
     */
    getResult : function() {
      return Math.round(this.__result * 10000000) / 10000000;
    },


    /**
     * sets the operator.
     *
     * @param op {var} pressed operator
     * @return {void}
     */
    setCurrentOperation : function(op) {
      this.__currentOperation = op;
    },


    /**
     * returns the recent pressed operator.
     *
     * @return __currentOperation {var} recent operator
     */
    getCurrentOperation : function() {
      return this.__currentOperation;
    },


    /**
     * clears the entry.
     *
     * @return {void}
     */
    clearEntry : function()
    {
      this.__isSigned = false;
      this.__zeroCounter = 0;
      this.__commaDivider = 1;
      this.__isCommaPressed = false;
      this.__ecCounter++;
      this.__currentValue = 0;

      if (this.__ecCounter < 2) {
        this.__resultContainer = this.__result;
      }

      if (this.__opCounter >= 2)
      {
        this.__result = 0;
        this.__opCounter = 0;
      }
    },


    /**
     * sets the sign from plus to minus or the other way round.
     *
     * @return {void}
     */
    setSign : function()
    {
      this.__signPressedCounter++;

      if (this.__signPressedCounter % 2 == 0) {
        this.__isSigned = false;
      } else {
        this.__isSigned = true;
      }

      if (this.__currentValue == null) {
        this.__currentValue = this.__result;
      }

      this.__currentValue = this.__currentValue * (-1);

      if (this.__result == 0) {
        this.__result = this.__currentValue;
      }

      if (this.__result != 0)
      {
        this.__resultContainer = this.__result;
        this.__result = this.__currentValue;
      }
    },

    /**
     * deletes the last pressed number.
     *
     * @return {void}
     */
    deleteNumber : function()
    {
      var isDecimal = false;
      var isNegative = false;

      if (this.__currentValue < 0)
      {
        this.__currentValue = this.__currentValue * (-1);
        isNegative = true;
      }

      if (this.__currentValue != null)
      {
        if (this.__currentValue.toString().lastIndexOf(".") != -1)
        {
          this.__currentValue = this.__currentValue * this.__commaDivider;
          isDecimal = true;
        }
      }

      var num1 = this.__currentValue % 10;
      var num2 = num1 / 10;
      this.__currentValue = this.__currentValue / 10;
      this.__currentValue = this.__currentValue - num2;

      if (isDecimal)
      {
        this.__commaDivider /= 10;
        this.__currentValue = this.__currentValue / (this.__commaDivider);
        isDecimal = false;
      }

      if (isNegative)
      {
        this.__currentValue = this.__currentValue * (-1);
        isNegative = false;
      }
    },


    /**
     * computes the given numbers with the desired operation.
     *
     * @param currentOperation {var} desired operation to compute
     * @return {void}
     */
    calculate : function(currentOperation)
    {
      if (currentOperation == "+" || currentOperation == "*" || currentOperation == "/" || currentOperation == "-" || currentOperation == "=")
      {
        this.__isCommaPressed = false;
        this.__commaDivider = 1;
        this.__zeroCounter = 0;

        if (this.__currentOperation != "n")
        {
          if (this.__currentOperation == "+")
          {
            if (this.__result == null) {
              this.__result = this.__resultContainer;
            }

            if (this.__isSigned) {
              this.__result = this.__resultContainer + this.__currentValue;
            } else {
              this.__result = this.__result + this.__currentValue;
            }

            this.__currentValue = this.__result;
            this.__resultContainer = this.__result;
          }

          if (this.__currentOperation == "-")
          {
            if (this.__result == 0)
            {
              this.__result = this.__currentValue;
              this.__currentValue = 0;
            }

            if (this.__result == null) {
              this.__result = this.__resultContainer;
            }

            if (this.__isSigned) {
              this.__result = this.__resultContainer - this.__currentValue;
            } else {
              this.__result = this.__result - this.__currentValue;
            }

            this.__currentValue = this.__result;
            this.__resultContainer = this.__result;
          }

          if (this.__currentOperation == "/")
          {
            if (this.__result == 0)
            {
              this.__result = this.__currentValue;
              this.__currentValue = 1;
            }

            if (this.__result == null) {
              this.__result = this.__resultContainer;
            }

            if (this.__currentValue != null)
            {
              if (this.__currentValue != 0)
              {
                if (this.__isSigned) {
                  this.__result = this.__resultContainer / this.__currentValue;
                } else {
                  this.__result = this.__result / this.__currentValue;
                }
              }
              else
              {
                alert("You can't divide by 0!");
              }
            }

            this.__currentValue = this.__result;
            this.__resultContainer = this.__result;
          }

          if (this.__currentOperation == "*")
          {
            if (this.__result == 0) {
              this.__result = 1;
            }

            if (this.__currentValue == null) {
              this.__currentValue = 1;
            }

            if (this.__result == null) {
              this.__result = this.__resultContainer;
            }

            if (this.__isSigned) {
              this.__result = this.__resultContainer * this.__currentValue;
            } else {
              this.__result = this.__result * this.__currentValue;
            }

            this.__currentValue = this.__result;
            this.__resultContainer = this.__result;
          }
        }
        else
        {
          this.__result = this.__currentValue;
        }

        if (currentOperation != "=") {
          this.__currentOperation = currentOperation;
        }
        else
        {
          this.__opCounter++;
          this.__result = this.__resultContainer;

          this.__currentOperation = "n";
        }

        this.__isSigned = false;
        this.__signPressedCounter = 0;

        return;
      }
    }
  }
});