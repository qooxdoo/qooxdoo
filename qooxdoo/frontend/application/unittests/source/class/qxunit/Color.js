
qx.Clazz.define("qxunit.Color", { statics : {
  testColor: function() {
        assertNotUndefined(qx.renderer.color.Color);
        var Color = qx.renderer.color.Color;

        var c = new Color("red");
        assertEquals("red", c.getStyle());
        assertEquals("red", c.getValue());
        //assertEquals("#ff0000", c.getHex());
        assertEquals(255, c.getRed());
        assertEquals(0, c.getGreen());
        assertEquals(0, c.getBlue());

        var c = new Color("sienna");
        assertEquals("sienna", c.getStyle());
        assertEquals("sienna", c.getValue());
        assertEquals("#a0522d", c.getHex());
        assertEquals(160, c.getRed());
        assertEquals(82, c.getGreen());
        assertEquals(45, c.getBlue());

        var c = new Color("#a0522d");
        assertTrue(
            ("rgb(160,82,45)" == c.getStyle()) ||
            ("#a0522d" == c.getStyle())
        );
        assertEquals("#a0522d", c.getValue());
        assertEquals("#a0522d", c.getHex());
        assertEquals(160, c.getRed());
        assertEquals(82, c.getGreen());
        assertEquals(45, c.getBlue());

        var c = new Color("rgb(160,82,45)");
        assertEquals("rgb(160,82,45)", c.getStyle());
        assertEquals("rgb(160,82,45)", c.getValue());
        assertEquals("#a0522d", c.getHex());
        assertEquals(160, c.getRed());
        assertEquals(82, c.getGreen());
        assertEquals(45, c.getBlue());

        var c = new Color([160, 82, 45]);
        assertEquals("rgb(160,82,45)", c.getStyle());
        //assertEquals(
        //    qx.io.Json.stringify([160, 82, 45]),
        //    qx.io.Json.stringify(c.getValue())
        //);
        assertEquals("#a0522d", c.getHex());
        assertEquals(160, c.getRed());
        assertEquals(82, c.getGreen());
        assertEquals(45, c.getBlue());

        var c = new Color("#FF0101");
        assertTrue(
            ("rgb(255,1,1)" == c.getStyle()) ||
            ("#FF0101" == c.getStyle())
        );
        //assertEquals("#FF0101", c.getValue());
        assertEquals("#ff0101", c.getHex().toLowerCase());
        assertEquals(255, c.getRed());
        assertEquals(1, c.getGreen());
        assertEquals(1, c.getBlue());

        var c = new Color("#FED");
        assertTrue(
            ("rgb(255,238,221)" == c.getStyle()) ||
            ("#FED" == c.getStyle())
        );
        //assertEquals("#FED", c.getValue());
        //assertEquals("#ffeedd", c.getHex());
        assertEquals(255, c.getRed());
        assertEquals(238, c.getGreen());
        assertEquals(221, c.getBlue());

        var error = false;
        try {
            var c = new Color("activeborder");
        } catch (e) {
            error = true;
        }
        assertTrue(error);

        var error = false;
        try {
            var c = new Color("#FFGFF");
        } catch (e) {
            error = true;
        }
        assertTrue(error);

        var error = false;
        try {
            var c = new Color("bla");
        } catch (e) {
            error = true;
        }
        assertTrue(error);

        var error = false;
        try {
            var c = new Color([1,2]);
        } catch (e) {
            error = true;
        }
        assertTrue(error);

        var error = false;
        try {
            var c = new Color([1,2,3,4]);
        } catch (e) {
            error = true;
        }
        assertTrue(error);

        var error = false;
        try {
            var c = new Color([1,2,300]);
        } catch (e) {
            error = true;
        }
        assertTrue(error);

        var c = Color.fromRandom();
        assertTrue(c instanceof Color);

        var c = Color.fromString("#123");
        assertTrue(c instanceof Color);

        assertEquals("rgb(1,2,3)", Color.rgb2style(1,2,3));
    },

    testColorObject: function() {
        var ColorObject = qx.renderer.color.ColorObject;
        var Manager = qx.manager.object.ColorManager.getInstance();

        Manager.setColorTheme(qx.theme.color.WindowsRoyale.getInstance());
        var c1 = new ColorObject("activecaption");
        assertEquals("rgb(51,94,168)", c1.getStyle());
        assertEquals("activecaption", c1.getValue());
        assertEquals("#335ea8", c1.getHex());
        assertEquals(51, c1.getRed());
        assertEquals(94, c1.getGreen());
        assertEquals(168, c1.getBlue());

        var c2 = new ColorObject("sienna");
        assertEquals("sienna", c2.getStyle());
        assertEquals("sienna", c2.getValue());
        assertEquals("#a0522d", c2.getHex());
        assertEquals(160, c2.getRed());
        assertEquals(82, c2.getGreen());
        assertEquals(45, c2.getBlue());

        Manager.setColorTheme(qx.theme.color.WindowsClassic.getInstance());
        assertEquals("rgb(10,36,106)", c1.getStyle());
        assertEquals("activecaption", c1.getValue());
        assertEquals("#0a246a", c1.getHex());
        assertEquals(10, c1.getRed());
        assertEquals(36, c1.getGreen());
        assertEquals(106, c1.getBlue());

        assertEquals("#a0522d", c2.getHex());
    },

    /*
    testSystemColors: function() {
        var ColorObject = qx.renderer.color.ColorObject;
        var Manager = qx.manager.object.ColorManager.getInstance();

        Manager.setColorTheme(qx.theme.color.System.getInstance());
        var c1 = new ColorObject("activecaption");
        assertEquals("activecaption", c1.getStyle());
        assertEquals("activecaption", c1.getValue());
        assertEquals("#0a246a", c1.getHex());
        assertEquals(10, c1.getRed());
        assertEquals(36, c1.getGreen());
        assertEquals(106, c1.getBlue());
    },
    */

    testColorThemeSwitch: function() {
        var ColorObject = qx.renderer.color.ColorObject;
        var Manager = qx.manager.object.ColorManager.getInstance();

        var c1 = new ColorObject("activecaption");
        var c2 = new ColorObject("sienna");

        Manager.setColorTheme(qx.theme.color.WindowsClassic.getInstance());
        var calledStyle = "";
        var dpendendObj = {
            _updateColors: function(color, style) {
                calledStyle = style;
            },
            toHashCode: function() { return 4711; }
        }
        c1.add(dpendendObj);
        Manager.setColorTheme(qx.theme.color.WindowsRoyale.getInstance());
        assertEquals("rgb(51,94,168)", calledStyle);

        Manager.setColorTheme(qx.theme.color.WindowsClassic.getInstance());
        var calledStyle2 = "";
        var dpendendObj = {
            _updateColors: function(color, style) {
                calledStyle2 = style;
            },
            toHashCode: function() { return 4712; }
        }
        c2.add(dpendendObj);
        Manager.setColorTheme(qx.theme.color.WindowsRoyale.getInstance());
        assertEquals("", calledStyle2);
        assertEquals("#a0522d", c2.getHex());
    }

}});