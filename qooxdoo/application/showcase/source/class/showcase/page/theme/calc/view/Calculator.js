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

qx.Class.define("showcase.page.theme.calc.view.Calculator",
{
  extend : qx.ui.window.Window,
  implement : [showcase.page.theme.calc.view.ICalculator],


  construct : function(isModern)
  {
    this.base(arguments, "Calculator");
    this._isModern = !!isModern;

    if (this._isModern) {
      this.setAppearance("modern-calculator");
    }

    // configure window
    this.set({
      showMinimize: false,
      showMaximize: false,
      allowMaximize: false,
      showClose : false
    });

    // set window layout
    this.setLayout(new qx.ui.layout.VBox());

    // add display and buttons
    this._initButtons();

    this.add(this.getChildControl("display"));
    this.add(this._createButtonContainer(), {flex: 1});

    // attach key event listeners
    this._initKeyIdentifier();
    this.addListener("keydown", this._onKeyDown, this);
    this.addListener("keyup", this._onKeyUp, this);
    this.addListener("keypress", this._onKeyPress, this);
  },


  events : {
    "buttonPress" : "qx.event.type.Data"
  },


  properties :
  {
    appearance :
    {
      refine : true,
      init : "calculator"
    },

    display :
    {
      init : "0",
      event : "changeDisplay"
    },

    memory :
    {
      check : "Boolean",
      init : false,
      event : "changeMemory"
    },

    operation :
    {
      check : "String",
      init : "",
      event : "changeOperation"
    }
  },


  members :
  {
    /** {Map} Maps button ids to the button instances */
    _buttons : null,

    /** {Map} Maps the button's key identifier to the button instances */
    _keyIdentifier : null,

    /** The button, which is currently pressed using the keyboard */
    _pressedButton : null,


    /*
    ---------------------------------------------------------------------------
      INITIALIZATION
    ---------------------------------------------------------------------------
    */

    /**
     * Initialize the buttons and store them in the "_buttons" map.
     */
    _initButtons : function()
    {
      this._buttons =
      {
        "MC": new showcase.page.theme.calc.view.Button("MC", 0, 0),
        "M+": new showcase.page.theme.calc.view.Button("M+", 0, 1),
        "M-": new showcase.page.theme.calc.view.Button("M-", 0, 2),
        "MR": new showcase.page.theme.calc.view.Button("MR", 0, 3),

        "C": new showcase.page.theme.calc.view.Button("C", 1, 0),
        "sign": new showcase.page.theme.calc.view.Button("&plusmn;", 1, 1),
        "/": new showcase.page.theme.calc.view.Button("&divide;", 1, 2, null, null, "/"),
        "*": new showcase.page.theme.calc.view.Button("*", 1, 3, null, null, "*"),

        "7": new showcase.page.theme.calc.view.Button("7", 2, 0, null, null, "7"),
        "8": new showcase.page.theme.calc.view.Button("8", 2, 1, null, null, "8"),
        "9": new showcase.page.theme.calc.view.Button("9", 2, 2, null, null, "9"),
        "-": new showcase.page.theme.calc.view.Button("-", 2, 3, null, null, "-"),

        "4": new showcase.page.theme.calc.view.Button("4", 3, 0, null, null, "4"),
        "5": new showcase.page.theme.calc.view.Button("5", 3, 1, null, null, "5"),
        "6": new showcase.page.theme.calc.view.Button("6", 3, 2, null, null, "6"),
        "+": new showcase.page.theme.calc.view.Button("+", 3, 3, null, null, "+"),

        "1": new showcase.page.theme.calc.view.Button("1", 4, 0, null, null, "1"),
        "2": new showcase.page.theme.calc.view.Button("2", 4, 1, null, null, "2"),
        "3": new showcase.page.theme.calc.view.Button("3", 4, 2, null, null, "3"),
        "=": new showcase.page.theme.calc.view.Button("=", 4, 3, 2, null, "Enter"),

        "0": new showcase.page.theme.calc.view.Button("0", 5, 0, null, 2, "0"),
        ".": new showcase.page.theme.calc.view.Button(".", 5, 2, null, null, ".")
      };

      if (this._isModern)
      {
        for (var key in this._buttons) {
          this._buttons[key].setAppearance("button");
        }
      }
    },


    /**
     * Configures a map, which maps the button's key identifiers to the button.
     * The map is stored in the protected member "_keyIdentifier".
     */
    _initKeyIdentifier : function()
    {
      this._keyIdentifier = []
      for (var name in this._buttons)
      {
        var button = this._buttons[name];
        var key = button.getKeyIdentifier();
        button.addListener("execute", this._onButtonExecute, this);
        if (key) {
          this._keyIdentifier[key] = button;
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      WIDGET CREATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      if (id === "display")
      {
        var display = new showcase.page.theme.calc.view.Display();
        this.bind("display", display, "display");
        this.bind("memory", display, "memory");
        this.bind("operation", display, "operation");
        return display;
      } else {
        return this.base(arguments, id);
      }
    },


    /**
     * Creates the button container and configures it with a flexible grid
     * layout. Further it adds the buttons to the container.
     */
    _createButtonContainer : function()
    {
      var container = new qx.ui.container.Composite();

      // configure button container with a grid layout
      var grid = new qx.ui.layout.Grid(5, 5);
      container.setLayout(grid);

      // make grid resizeable
      for (var row=0; row<6; row++) {
        grid.setRowFlex(row, 1);
      }
      for (var col=0; col<6; col++) {
        grid.setColumnFlex(col, 1);
      }

      // add buttons
      for (var name in this._buttons) {
        container.add(this._buttons[name])
      }
      return container;
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    _onButtonExecute : function(e)
    {
      var name = qx.lang.Object.getKeyFromValue(this._buttons, e.getTarget());
      this.fireDataEvent("buttonPress", name);
    },


    /**
     * Key down event handler. Visually presses the button associated with the
     * pressed key.
     *
     * @param e {qx.event.type.KeySequence} Key event object
     */
    _onKeyDown : function(e)
    {
      var button = this._keyIdentifier[e.getKeyIdentifier()];
      if (!button) {
        return;
      }

      button.press();

      if (this._pressedButton && this._pressedButton !== button) {
        this._pressedButton.release();
      }
      this._pressedButton = button;

      e.stop();
    },


    /**
     * Key up event handler. Visually releases the button associated with the
     * released key.
     *
     * @param e {qx.event.type.KeySequence} Key event object
     */
    _onKeyUp : function(e)
    {
      var button = this._keyIdentifier[e.getKeyIdentifier()];
      if (!button) {
        return;
      }

      button.release();
      e.stop();
    },


    /**
     * Key press event handler. Executes the button associated with the pressed
     * key.
     *
     * @param e {qx.event.type.KeySequence} Key event object
     */
    _onKeyPress : function(e)
    {
      var button = this._keyIdentifier[e.getKeyIdentifier()];
      if (!button) {
        return;
      }

      button.execute();
      e.stop();
    }
  },

  destruct : function()
  {
    this._disposeMap("_buttons");
    this._disposeArray("_keyIdentifier");
  }
});