package net.jsunit;

import junit.framework.TestResult;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.Browser;

public class UrlOverrideStandaloneTestTest extends EndToEndTestCase {

    protected ConfigurationSource configurationSource() {
        return new StubConfigurationSource() {
            public String browserFileNames() {
                return Browser.DEFAULT_SYSTEM_BROWSER;
            }

            public String url() {
                return "http://www.example.com";
            }

            public String port() {
                return String.valueOf(port);
            }

        };
    }

    public void testOverridenURL() throws Exception {
        StandaloneTest test = new StandaloneTest(configurationSource());
        test.setOverrideURL(
                "http://localhost:" + port + "/jsunit/testRunner.html?testPage=http://localhost:" + port + "/jsunit/tests/jsUnitUtilityTests.html&autoRun=true&submitresults=true&resultId=foobar");
        TestResult testResult = test.run();
        assertTrue(testResult.wasSuccessful());
        assertTrue(test.getServer().lastResult().wasSuccessful());
    }

}
