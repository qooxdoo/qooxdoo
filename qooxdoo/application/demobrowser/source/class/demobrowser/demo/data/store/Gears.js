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
     
     ======================================================================

     This class contains code based on the following work:

     // Copyright 2007, Google Inc.
     //
     // Redistribution and use in source and binary forms, with or without
     // modification, are permitted provided that the following conditions are met:
     //
     //  1. Redistributions of source code must retain the above copyright notice,
     //     this list of conditions and the following disclaimer.
     //  2. Redistributions in binary form must reproduce the above copyright notice,
     //     this list of conditions and the following disclaimer in the documentation
     //     and/or other materials provided with the distribution.
     //  3. Neither the name of Google Inc. nor the names of its contributors may be
     //     used to endorse or promote products derived from this software without
     //     specific prior written permission.
     //
     // THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
     // WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
     // MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
     // EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     // SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
     // PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
     // OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
     // WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
     // OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
     // ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     //
     // Sets up google.gears.*, which is *the only* supported way to access Gears.
     //
     // Circumvent this file at your own risk!
     //
     // In the future, Gears may automatically define google.gears.* without this
     // file. Gears may use these objects to transparently fix bugs and compatibility
     // issues. Applications that use the code below will continue to work seamlessly
     // when that happens.

************************************************************************ */
qx.Class.define("demobrowser.demo.data.store.Gears", 
{
  extend : qx.data.store.Json,


  construct : function()
  {
    this.base(arguments);
    
    this.initGears();
    
    // Make sure we have Gears. If not, tell the user.
    if (!window.google || !google.gears) {
      if (confirm("This demo requires Gears to be installed. Install now?")) {
        // Use an absolute URL to allow this to work when run from a local file.
        location.href = "http://code.google.com/apis/gears/install.html";
        return;
      }
    }
    
    this.__db = this.initDB();
    
    this.__load();
  },

  members :
  {
    __load: function(url) {
      var data = this.getPerson();
      // create the class
      this._createModelClass(data);
      // set the initial data
      this.setModel(this._setData(data));
      
      this.getModel().addListener("changeFirstname", this.__modelChanged, this);
      this.getModel().addListener("changeLastname", this.__modelChanged, this);
      this.getModel().addListener("changeAge", this.__modelChanged, this);      
              
      // fire complete event
      this.fireDataEvent("loaded", this.getModel());      
    },
    
    
    __modelChanged: function(ev) {
      var model = this.getModel();
      this.update(model.getFirstname(), model.getLastname(), model.getAge());
    },
    
    
    /*
    ---------------------------------------------------------------------------
       GEARS INTEGRATION
    ---------------------------------------------------------------------------
    */
    update: function(firstname, lastname, age) {
      if (!google.gears.factory || !this.__db) {
        return;
      }
      // empty the table
      this.__db.execute("delete from Persons");
      // Insert the new person.
      this.__db.execute('insert into Persons values (?, ?, ?)', [firstname, lastname, age]);
    },
    
    
    getPerson: function() {
      var person = {};

      // Get the person entry
      var rs = this.__db.execute('select * from Persons');
      var index = 0;
      if (rs.isValidRow()) {
        person.firstname = rs.field(0) || "";
        person.lastname = rs.field(1) || "";
        person.age = parseInt(rs.field(2)) || 0;
      }
      rs.close();

      return person;
    },
    
    
    initDB: function() {
      if (window.google && google.gears) {
        try {
          var db = google.gears.factory.create('beta.database');

          if (db) {
            db.open('qooxdoo');
            db.execute('create table if not exists Persons' +
                       ' (Firstname varchar(255), Lastname varchar(255), Age int)');
          }

        } catch (ex) {
          this.error('Could not create database: ' + ex.message);
        }
      }
      
      return db;   
    },
    
    
    initGears: function() {
      // We are already defined. Hooray!
      if (window.google && google.gears) {
        return;
      }

      var factory = null;

      // Firefox
      if (typeof GearsFactory != 'undefined') {
        factory = new GearsFactory();
      } else {
        // IE
        try {
          factory = new ActiveXObject('Gears.Factory');
          // privateSetGlobalObject is only required and supported on IE Mobile on
          // WinCE.
          if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
            factory.privateSetGlobalObject(this);
          }
        } catch (e) {
          // Safari
          if ((typeof navigator.mimeTypes != 'undefined')
               && navigator.mimeTypes["application/x-googlegears"]) {
            factory = document.createElement("object");
            factory.style.display = "none";
            factory.width = 0;
            factory.height = 0;
            factory.type = "application/x-googlegears";
            document.documentElement.appendChild(factory);
          }
        }
      }

      // *Do not* define any objects if Gears is not installed. This mimics the
      // behavior of Gears defining the objects in the future.
      if (!factory) {
        return;
      }

      // Now set up the objects, being careful not to overwrite anything.
      //
      // Note: In Internet Explorer for Windows Mobile, you can't add properties to
      // the window object. However, global objects are automatically added as
      // properties of the window object in all browsers.
      if (!window.google) {
        google = {};
      }

      if (!google.gears) {
        google.gears = {factory: factory};
      }
    }    
    
  }
});
