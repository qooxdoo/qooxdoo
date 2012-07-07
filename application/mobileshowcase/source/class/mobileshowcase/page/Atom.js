/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Mobile page responsible for showing the "tab" showcase.
 */
qx.Class.define("mobileshowcase.page.Atom",
{
  extend : qx.ui.mobile.page.NavigationPage,


  construct : function()
  {
    this.base(arguments);
    this.setTitle("Atoms, Buttons");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {

    __disabled: false,

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.getContent().add(this.__createAtoms());
    },

    __createAtoms : function()
    {
      var imageURL = "http://demo.qooxdoo.org/1.4/demobrowser/resource/qx/icon/Tango/32/actions/go-previous.png";
      var container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      var atom1 = new qx.ui.mobile.basic.Atom("Atom1", imageURL);
      container.add(atom1);
      var atom2 = new qx.ui.mobile.basic.Atom("Atom2", imageURL);
      atom2.setIconPosition('top');
      container.add(atom2);
      var atom3 = new qx.ui.mobile.basic.Atom("Atom3", imageURL);
      atom3.setIconPosition('right');
      container.add(atom3);
      var atom4 = new qx.ui.mobile.basic.Atom("Atom4", imageURL);
      atom4.setIconPosition('bottom');
      container.add(atom4);
      var button = new qx.ui.mobile.form.Button("Toggle enable/disable");
      container.add(button);
      button.addListener("tap", function(){
        if(!this.__disabled)
        {
          atom1.setEnabled(false);atom2.setEnabled(false);atom3.setEnabled(false);atom4.setEnabled(false);
          this.__disabled = true;
        }
        else
        {
          atom1.setEnabled(true);atom2.setEnabled(true);atom3.setEnabled(true);atom4.setEnabled(true);
          this.__disabled = false;
        }
      }, this);
      return container;
    },

    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});