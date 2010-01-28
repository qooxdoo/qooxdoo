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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.Element_1",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var doc = new qx.html.Root(document.getElementById("test"));
      doc.setAttribute("id", "doc");



      // Basics

      this.info("Basics");

      var el1 = new qx.html.Element;
      var el2a = new qx.html.Element;
      var el2b = new qx.html.Element;
      var el3a = new qx.html.Element;
      var el3b = new qx.html.Element;

      el1.setAttribute("id", "el1");
      el2a.setAttribute("id", "el2a");
      el2b.setAttribute("id", "el2b");
      el3a.setAttribute("id", "el3a");
      el3b.setAttribute("id", "el3b");

      el1.add(el2a, el2b);
      el2a.add(el3a, el3b);
      doc.add(el1);

      el3a.setAttribute("html", "<b>hello</b>");
      el3b.setAttribute("text", "hello");
      el3b.setStyles({
        fontWeight : "bold",
        fontSize : "18px",
        fontFamily : "sans-serif"
      });

      el1.setStyle("color", "blue");
      el1.setStyle("width", "100px").setStyle("height", "100px");


      qx.html.Element.flush();


      /*
        Current:

        doc
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
      */






      // Positioned Insert #1

      this.info("Positioned Insert #1");

      var before1 = new qx.html.Element;
      before1.setAttribute("id", "before1");
      before1.insertBefore(el1);

      var after1 = new qx.html.Element;
      after1.setAttribute("id", "after1");
      after1.insertAfter(el1);

      qx.html.Element.flush();



      /*
        Current:

        doc
        - before1
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after1
      */






      // Positioned Insert #2

      this.info("Positioned Insert #2");

      var before2 = new qx.html.Element;
      before2.setAttribute("id", "before2");
      doc.addAt(before2, 0);

      var after2 = new qx.html.Element;
      after2.setAttribute("id", "after2");
      doc.addAt(after2, 10);

      qx.html.Element.flush();

      /*
        Current:

        doc
        - before2
        - before1
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after1
        - after2
      */



      // Move

      this.info("Move");

      before2.moveAfter(before1);
      qx.html.Element.flush();

      after2.moveBefore(after1);
      qx.html.Element.flush();


      /*
        Current:

        doc
        - before1
        - before2
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after2
        - after1
      */



      // Switch

      this.info("Switch");

      var in1 = doc.indexOf(before2);
      var in2 = doc.indexOf(after2);

      before2.moveTo(in2);
      after2.moveTo(in1);

      qx.html.Element.flush();


      /*
        Current:

        doc
        - before1
        - before2
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after2
        - after1
      */



      // Remove

      this.info("Remove");

      doc.remove(before2);
      doc.remove(after2);

      qx.html.Element.flush();

      /*
        Current:

        doc
        - before1
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after1
      */



      // Re-add

      this.info("Re-add");

      doc.add(before2, after2);

      qx.html.Element.flush();


      /*
        Current:

        doc
        - before1
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after1
        - before2
        - after2
      */



      // Remove and Add and Remove and Add

      this.info("Remove and Add and Remove and Add");

      doc.remove(before2, after2);
      doc.add(before2, after2);
      doc.remove(before2, after2);
      doc.add(before2, after2);

      qx.html.Element.flush();

      /*
        Current:

        doc
        - before1
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after1
        - before2
        - after2
      */





      // Move, remove & add

      this.info("Move, remove & add");

      doc.remove(before2);
      before1.moveAfter(after1);
      before2.insertBefore(before1);

      qx.html.Element.flush();

      /*
      BEFORE:        AFTER1:        AFTER2:        AFTER3:

      before1        before1        el1            el1
      el1            el1            after1         after1
      after1         after1         before1        before2
      before2        after2         after2         before1
      after2                                       after2
      */

      /*
        Current:

        doc
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
        - after1
        - before2
        - before1
        - after2
      */







      // Sort completely

      this.info("Sort completely");

      var a = doc.getChildren();
      for (var i=1, l=a.length; i<l; i++) {
        a[i].moveTo(0);
      }

      qx.html.Element.flush();

      /*
        Current:

        doc
        - after2
        - before1
        - before2
        - after1
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
      */





      // Rotation

      this.info("Rotation");

      before1.moveAfter(before2);

      qx.html.Element.flush();

      /*
        Current:

        doc
        - after2
        - before2
        - before1
        - after1
        - el1
          - el2a
            - el3a
            - el3b
          - el2b
      */
    }
  }
});
