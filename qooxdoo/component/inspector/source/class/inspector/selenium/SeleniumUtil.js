/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Selenium utilities
 */
qx.Class.define("inspector.selenium.SeleniumUtil",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Calculates a qooxdoo widget hierarchy locator (qxh) for a given widget.
     *
     * @param widget {qx.ui.core.Widget} The widget to locate
     * @param appRoot {qx.ui.root.Abstract} The application root widget
     * @param autWin {DOMWindow} The Window object of the widget's parebt app.
     * Default: The current window
     * @return {String} The complete locator
     */
    getQxhLocator : function(widget, appRoot, autWin)
    {
      var autWindow = autWin || window;
      if (!appRoot) {
        var appRoot = qx.core.Init.getApplication().getRoot();
      }
      var loc = [];
      while (widget) {
        if (widget === appRoot) {
          break;
        }

        var step = inspector.selenium.SeleniumUtil.getQxhLocatorStep(widget, autWindow);
        loc.push(step);
        widget = widget.getLayoutParent();
      }
      loc.reverse();
      if (appRoot.classname == "qx.ui.root.Inline") {
        var isleId = inspector.selenium.SeleniumUtil.getInlineIsleId(appRoot);
        loc = "qxh=inline:" + isleId + "//" + loc.join("/");
      } else {
        loc = "qxh=" + loc.join("/");
      }
      return loc;
    },

    /**
     * Determines a qxh locator step for a given widget
     *
     * @param widget {qx.ui.core.Widget} The widget to find a step for
     * @param autWin {DOMWindow} The Window object of the widget's parebt app.
     * Default: The current window
     * @return {String} Locator step
     */
    getQxhLocatorStep : function(widget, autWin)
    {
      var autWindow = autWin || window;
      var classname = widget.classname;
      var step = '[@classname="' + classname + '"]';
      if (classname.indexOf("qx.") == 0) {
        step = widget.classname;
      }

      var parent = widget.getLayoutParent();
      var twin = false;
      var childIndex = null;
      var children = [];

      if (parent.getChildren) {
        children = children.concat(parent.getChildren());
      }
      if (parent._getChildren) {
        var internalChildren = parent._getChildren();
        for (var x=0,y=internalChildren.length; x<y; x++) {
          if (!qx.lang.Array.contains(children, internalChildren[x])) {
            children.push(internalChildren[x]);
          }
        }
      }

      // Decide what kind of step to use: If the parent widget has multiple
      // children of the same class as the target widget, we can't use the
      // classname step type.
      for (var i=0,l=children.length; i<l; i++) {
        // found match, remember its position in the children list
        if (children[i] == widget && childIndex === null) {
          childIndex = i;
        }
        // target is of the same class as child, can't use classname locator
        else if (autWindow.qx.Class.getByName(children[i].classname) &&
                 widget instanceof autWindow.qx.Class.getByName(children[i].classname)) {
          twin = true;
        }
        // ditto if the child is of the same class as the target
        else if (autWindow.qx.Class.getByName(widget.classname) &&
                 children[i] instanceof autWindow.qx.Class.getByName(widget.classname)) {
          twin = true;
        }
        // finally check the class names just in case the instanceof checks fail
        else if (children[i].classname == widget.classname) {
          twin = true;
        }
      }

      if (twin) {
        step = "child[" + childIndex + "]";
      }

      return step;
    },

    /**
     * Returns the HTML ID attribute of an Inline root widget's container
     * element. If the element doesn't have an ID, its parent node is checked.
     *
     * @param inlineRoot {qx.ui.root.Inline} Inline root widget
     * @return {String} The found HTML ID
     */
    getInlineIsleId : function(inlineRoot)
    {
      var isleElem = inlineRoot.getContainerElement().getDomElement();
      if (isleElem.id) {
        return isleElem.id;
      } else if (isleElem.parentNode && isleElem.parentNode.id) {
        return isleElem.parentNode.id;
      }

      return "UNKNOWN_ISLE";
    }

  }

});