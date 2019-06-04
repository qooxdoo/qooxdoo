Annotations
===========

Annotations are the ability to add meta data to classes so that the meta data can be accessed at runtime; the meta data can be added to individual members, properties, statics, constructor, destructor, or the whole class.

Properties already include some meta data - the check attribute allows to specify data type or range of values, and Qooxdoo uses this meta data to enforce validation; you can access this meta data too, but it's pretty limited in its usefulness. Annotations allow you to add your own, application specific meta data to describe anything you want (and not just to properties).

Annotations can be anything you want - in Java, they have to be a specific type, but in this implementation they can be any object and (I find at the moment) a string is very handy. Obviously it’s important to be clear about your naming convention (!), and it would be wise to prefix strings with your package name.

One question about Annotations is, why can’t you use interfaces to do the same thing? Interfaces have their (very important) place, but they require that you implement code in every class in order for that class to provide that interface’s given functionality; annotations allow you to separate the code which does the work from the class, but this can only work because the class is able to “annotate” itself with guidelines on how to that separate code should behave.

Example 1
---------

Suppose you create a form that allows the user to edit some object, and that object has lots of properties that can be edited; some of those properties are read only, some can only be edited by people with the correct permission, some are integers, some can only have a specific range of values, etc.

When you hand code your form you embed a lot of that business knowledge (about who can edit what, and what values are allowed) into your form editor, plus there is some basic validation by the property check attribute.

But lets say you edit that object in more than one place - eg a second form editor UI, and maybe there are places where the object is edited by code as a result of server interaction or other event. This means duplicating that validation logic in all form editors and in the code that manipulates and validates those properties.

One possible solution using annotations would be to annotate each property with special information about what is allowed, and then let your form editors use that information to customise the controls; a separate validator could use the same annotations to check the values being set against the properties explicitly.

::  
qx.Class.define("myapp.model.Customer", {  
extend: qx.core.Object,

properties: {  
address: {  
check: "String"

}, zipCode: { check: "String", ["@"](mailto:"@"): [ new myapp.forms.annotations.ZipCode().set({ allowNonUsa: true }) ] }

}

});

qx.Class.define("myapp.forms.annotations.ValidationAnnotation", {  
extend: qx.core.Object, type: "abstract",

members: {  
/*\** Called to check whether a value is valid  
-   @abstract
-   @param value {String} value to be interpretted

\* @return {Boolean} \*/

isValid: function(value) { }

}

}); qx.Class.define("myapp.forms.annotations.ZipCode", { extend: myapp.forms.annotations.ValidationAnnotation,

> properties: {  
> allowNonUsa: {  
> init: false, check: "Boolean"
>
> }
>
> },
>
> members: {  
> /\*  
> \* @Override \*/
>
> isValid: function(value) {  
> var ok = true; /\* ... zip code validation ... \*/ return ok;
>
> }
>
> }

});

Your form validation logic, when asked to bind to a given property could get a list of annotations which derive from myapp.forms.annotations.ValidationAnnotation, and use that to implement it's validation logic, for example:

    var propAnnos = qx.Annotation.getProperty(obj.constructor, propName);
    propAnnos.forEach(function(propAnno) {
        if (propAnno instanceof myapp.forms.annotations.ValidationAnnotation) {
            /* ... Setup the validation rules (eg for a ZipCode) ... */
        }
    });

Example 2
---------

Lets refine our example above and say that the Customer objects are part of an object model which needs to be replicated on to the server; most of the properties are business data and need to be kept synchronised with the server when the user hits save. This data is usually changed by the CustomerEditor widget, but admin users can edit the Customers in a table, and there are a couple of UI wizards for manipulating the data in each Customer object too.

You do not want the UI code to handle copying the data to the server and back because it happens in so many places, it would be much better is Customer just "knew" about the properties.

To automate this, you could start by just synchronising *all* properties in Customer to the server, but the likelyhood is that there are properties which only exist in the UI, and anyway the naming conventions might mean that property names on the server are always 100% the same as that on the server.

By adding annotations to each property that needs to be synchronised, you can describe which need to be transferred, what their name is at the server, whether they are one way, etc. Once piece of generic code can then handle synchronising for Customer or any server object that works in this way.

    qx.Class.define("myapp.model.Customer", {
        extend: qx.core.Object,

        // Annotate the class with the REST endpoint required by serverio library, used to save the
        //  modified Customer objects
        "@": [ new serverio.annotations.RestClass().set({ restEndPoint: "/api/customer" }) ],

        properties: {
            serverId: {
                check: "String",
                "@": [ serverio.annotations.Property.getIdentifierInstance() ]
            },
            name: {
                check: "String",
                "@": [ serverio.annotations.Property.getDefaultInstance() ]
            },
            address: {
                check: "String",
                "@": [ serverio.annotations.Property.getDefaultInstance() ]
            },
            zipCode: {
                check: "String",
                "@": [  new myapp.forms.annotations.ZipCode().set({ allowNonUsa: true }),
                        serverio.annotations.Property.getDefaultInstance() ]
            },
            creditLimit: {
                check :"Number",
                "@": [ new myapp.forms.annotations.PositiveCurrency(),
                        new serverio.annotations.Property().set({ serverName: "maxCreditLimit" ]
            },
            dirty: {
                init: false,
                check: "Boolean"
            }
        },

        members: {
            save: function() {
                if (this.isDirty()) {
                    serverio.Database.save(this);
                    this.setDirty(false);
                }
            }
        }
    });

In the above example, the class is given an annotation which says what the REST endpoint is - there is presumably a server component which provides CRUD database access for the CUSTOMER database table.

Each property which is to be sent to the client is marked with an instance of the serverio.annotations.Property annotation; note that in this design, it can be a static instance (eg from getDefaultInstance()) or a whole new instance where a special customisation is required.

These annotations provide all the information that is required for a static method such as serverio.Database.save() to be able to store the object's properties - it can iterate all the properties, discover which is the unique server ID for updates, apply customised name mapping on a particular property (eg "creditLimit"), and know the endpoint to send the data to.

Note also how there are two different sets of annotations mixed in together, one for form validation in the UI and another for serialising to the server; the class is not required to inherit from a given base class, or even implement interfaces.

Declaration
-----------

Annotations are declared next to the method being annotated but with a leading "@" symbol, or in the case of properties and classes just an "@" within the definition. For example:

    qx.Class.define("qx.test.Cat", {
      "@": [ "class-annotation" ],
      extend: qx.core.Object,

      "@construct": [ "constructor-annotation" ],
      construct : function() { /* ... */ }
    });

In the above examples the two annotations are just strings, which is functional but you have to be careful to avoid name conflicts - if you use strings, make sure that it is prefixed with your library namespace.

Perhaps a better way to annotate would be with an instance of a class that has well defined properties; for example:

    qx.Class.define("qx.test.Pet", {
      extend: qx.core.Object,

      properties: {
        hasFur: {
            "@": [ new qx.serverio.SerialiseColumn("HAS_FUR") ],
            init: true,
            check: "Boolean"
        },

        color: [
            "@": [ new qx.serverio.SerialiseColumn("COLOR") ],
            nullable: false,
            check: [ "black", "brown" ]
        ]
      }
    });

    qx.Class.define("qx.test.Cat", {
      "@": [ new qx.serverio.SerialiseTable(true, "CAT") ],
      extend: qx.test.Pet,

      properties: {
        hasFur: {
            "@": [ "qx.test.otherAnnotation" ],
            refine: true
        }
      }
    });

Reflection
----------

Annotations are only useful if you can inspect them, and the `qx.Annotation` class provides methods for accessing them; for example:

    var pet = this.getPet();
    var annos = qx.Annotation.getProperty(pet.constructor, "color");
    qx.core.Assert.assertEquals(1, annos.length);
    qx.core.Assert.assertEquals("qx.serverio.SerialiseColumn", annos[0].classname);

Note that you can use annotations in super classes and add further annotations in derived classes; in the example above, the "hasFur" property has two annotations in the qx.test.Cat class, but only one for qx.test.Pet.

    var pet = this.getPet();

    // Only Cat's have the second annotation
    qx.core.Assert.assertTrue(pet instanceof qx.test.Cat);
    var annos = qx.Annotation.getProperty(pet.constructor, "hasFur");
    qx.core.Assert.assertEquals(2, annos.length);
    qx.core.Assert.assertEquals("qx.test.otherAnnotation", annos[0]);
    qx.core.Assert.assertEquals("qx.serverio.SerialiseColumn", annos[1].classname);
