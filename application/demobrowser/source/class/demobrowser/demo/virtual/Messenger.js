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
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.Messenger",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    main : function()
    {
      this.base(arguments);
      
      var doc = this.getRoot();
      
      this.messenger = new demobrowser.demo.virtual.messenger.Messenger();
      messenger = this.messenger;
      
      var btnAdd = new qx.ui.form.Button("Add a contact ...");
      var btnRemove = new qx.ui.form.Button("Remove last contact");

      btnAdd.addListener("execute", this.showAddContactWindow, this);
      btnRemove.addListener("execute", this.removeContact, this);

      doc.add(btnAdd, {left : 20, top : 10});
      doc.add(btnRemove, {left : 20, top : 40});
    },
    
    showAddContactWindow: function()
    {
      //this.messenger.getModel().push(new demobrowser.demo.virtual.messenger.BuddyModel);
    },

    removeContact: function()
    {
      this.messenger.getModel().pop();
    }

  }
});
