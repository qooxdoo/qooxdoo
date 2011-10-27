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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************
#ignore(demobrowser.demo.test.Person)
************************************************************************ */

/**
 * @tag test
 */
qx.Class.define("demobrowser.demo.test.Validation",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create a test model
      var person = new demobrowser.demo.test.Person();

      // create the view to show the results
      var embed = new qx.ui.embed.Html();
      embed.setBackgroundColor("white");
      embed.set({
        padding: 10,
        width: 250,
        height: 360
      });
      this.getRoot().add(embed, {left: 10, top: 10});


      // show the initial porperty values
      embed.setHtml("<b>Initial property values</b><br>");
      embed.setHtml(embed.getHtml() + "name:" + person.getName() + "<br>");
      embed.setHtml(embed.getHtml() + "age:" + person.getAge() + "<br>");
      embed.setHtml(embed.getHtml() + "gender:" + person.getGender() + "<br>");


      // setting the name property
      embed.setHtml(embed.getHtml() + "<br><b>Setting the name to 'Hans'</b><br>");
      // set a working name
      person.setName("Hans");
      embed.setHtml(embed.getHtml() + "new name: " + person.getName() + "<br>");

      embed.setHtml(embed.getHtml() + "<b>Setting the name to ''</b><br>");
      // set a not working name
      try {
        person.setName("");
        // code will never nur
        embed.setHtml(embed.getHtml() + "new name: " +
                      person.getName() + "<br>");
      } catch (ex) {
        embed.setHtml(embed.getHtml() + "<font color='red'>NAME NOT SET</font>"
                      + "<br>old name: " + person.getName() + "<br>");
      }


      // setting the age property
      embed.setHtml(embed.getHtml() + "<br><b>Setting the age " +
                    "property to 27</b><br>");

      // set a working age
      person.setAge(27);
      embed.setHtml(embed.getHtml() + "new age: " + person.getAge() + "<br>");

      embed.setHtml(embed.getHtml() + "<b>Setting the age " +
                    "property to 'true'</b><br>");
      // set a not working age
      try {
          person.setAge(true);
          // code will never run
          embed.setHtml(embed.getHtml() + "new age: " +
                        person.getAge() + "<br>");
      } catch (ex) {
        embed.setHtml(embed.getHtml() + "<font color='red'>AGE NOT SET</font>"
                      + "<br>old age: " + person.getAge() + "<br>");
      }


      // setting the gender property
      embed.setHtml(embed.getHtml() + "<br><b>Setting the gender " +
                    "property to 'female'</b><br>");

      // set a working gender
      person.setGender("female");
      embed.setHtml(embed.getHtml() + "new gender: " + person.getGender() +
                    "<br>");

      embed.setHtml(embed.getHtml() + "<b>Testing the gender " +
        "property to 'fmale'</b><br>");
      // set a not working gender
      try {
          person.setAge("fmale");
          // code will never run
          embed.setHtml(embed.getHtml() + "new gender: " +
                        person.getGender() + "<br>");
      } catch (ex) {
        embed.setHtml(embed.getHtml() + "<font color='red'>GENDER NOT SET</font>"
                      + "<br>old gender: " + person.getGender() + "<br>");
      }



      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      // Event binding description
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(250);
      description.setValue(
        "<b>Description</b><br/>"
        + "The demo creates an internal class containing three properties:<br/>"
        + "- name: Name is validated to a minimum length of two.<br/>"
        + "- age: Age is validated to be a number.<br/>"
        + "- gender: Gender is validated to be either male or female."
      );
      this.getRoot().add(description, {left: 280, top: 10});

    }
  }
});



/*
 * PLEASE NOTE:
 * For demonstration purposes the following class is added to the same file as
 * the application class. For a regular qooxdoo application each class must live
 * in a file of its own. You may neglect any warnings when generating this demo.
 */

/**
 * Create a new inline class with 3 properties
 * 1. a property named 'name' which will be validated with a custom
 *    validation function namend __validateName
 * 2. a property named 'age' which uses a number validator from
 *    qx.util.Validate
 * 3. a property namend gender which uses a inArray validator from
 *    qx.util.Validate
 */
qx.Class.define("demobrowser.demo.test.Person",
{
  extend : qx.core.Object,

  properties :
  {
      name : {
          init:  "My name",
          validate: "__validateName"
      },

      age : {
          init:  18,
          validate: qx.util.Validate.number()
      },

      gender : {
          init: "male",
          validate: qx.util.Validate.inArray(["male", "female"])
      }
  },

  members : {
    __validateName : function(value) {
        // if the length is lower than 2
        if (value.length < 2) {
            throw new qx.core.ValidationError("Validation Error: Name " +
                   "must be longer than one characters. (" + value + ")");
        }
    }
  }

});
