package net.jsunit;

public class ConfigurationFunctionalTest extends FunctionalTestCase {

    public void testSimple() throws Exception {
        webTester.beginAt("config");
        assertConfigXml();
    }

}
