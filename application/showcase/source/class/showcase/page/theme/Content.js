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
      var presenter = new showcase.page.theme.calc.Presenter(calc, model);

      
      var calc = new showcase.page.theme.calc.view.Calculator(false);
      
      view.add(calc);
      calc.moveTo(340, 40);
      calc.open();      
      
      var model = new showcase.page.theme.calc.Model();
      var presenter = new showcase.page.theme.calc.Presenter(calc, model);
      
      return view;
    }
  }
});