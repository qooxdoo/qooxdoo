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
qx.Class.define("showcase.page.theme.Content",
{
  extend : showcase.AbstractContent,


  construct : function(page) {
    this.base(arguments, page);

    this.setView(this._createView());
  },


  members :
  {
    _createView : function()
    {
      var view = new qx.ui.window.Desktop(new qx.ui.window.Manager());

      var calc = new showcase.page.theme.calc.view.Calculator(true);
      view.add(calc);
      calc.moveTo(60, 40);
      calc.open();

      var model = new showcase.page.theme.calc.Model();
      new showcase.page.theme.calc.Presenter(calc, model);


      var calc = new showcase.page.theme.calc.view.Calculator(false);

      view.add(calc);
      calc.moveTo(340, 40);
      calc.open();

      var model = new showcase.page.theme.calc.Model();
      new showcase.page.theme.calc.Presenter(calc, model);

      this.__monkeyDance(calc);

      return view;
    },


    __monkeyDance : function(calc)
    {
      if (!("WebkitTransition" in document.documentElement.style)) {
        return;
      }

      var showMonkey = true;
      var monkeyImage = new qx.ui.basic.Image("showcase/theme/affe.png").set({
        backgroundColor: "#525252",
        padding: [50, 5, 5, 0]
      });

      calc.addListener("dblclick", function(e)
      {
        var el = calc.getContainerElement().getDomElement();
        el.style.WebkitTransition = "-webkit-transform 0.3s ease-in";

        if (showMonkey) {
          el.style.WebkitTransform = "perspective(600) rotateY(90deg)";
        } else {
          el.style.WebkitTransform = "perspective(600) rotateY(270deg)";
        }

        el.addEventListener("webkitTransitionEnd", function()
        {
          el.removeEventListener("webkitTransitionEnd", arguments.callee, false);

          if (showMonkey)
          {
            var bounds = calc.getChildrenContainer().getBounds();
            monkeyImage.setUserBounds(0, 0, bounds.width, bounds.height);
            calc.add(monkeyImage);
            calc.setCaption("");
          }
          else
          {
            calc.remove(monkeyImage);
            calc.setCaption("Calculator");
          }

          qx.ui.core.queue.Manager.flush();

          el.style.WebkitTransition = "-webkit-transform 0.3s ease-out";
          if (showMonkey)
          {
            el.style.WebkitTransform = "perspective(600) rotateY(180deg)";
          }
          else
          {
            el.style.WebkitTransform = "perspective(600) rotateY(360deg)";
            el.addEventListener("webkitTransitionEnd", function()
            {
              el.removeEventListener("webkitTransitionEnd", arguments.callee, false);
              el.style.WebkitTransition = "";
              el.style.WebkitTransform = "perspective(600) rotateY(0deg)";
            }, false);
          }

          showMonkey = !showMonkey;
        }, false)
      })
    }
  }
});