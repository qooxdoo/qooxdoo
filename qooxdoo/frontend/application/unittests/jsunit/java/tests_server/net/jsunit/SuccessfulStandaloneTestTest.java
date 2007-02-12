package net.jsunit;

import junit.framework.TestResult;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.Browser;

public class SuccessfulStandaloneTestTest extends EndToEndTestCase {

    protected ConfigurationSource configurationSource() {
        return new StubConfigurationSource() {
            public String browserFileNames() {
                return Browser.DEFAULT_SYSTEM_BROWSER + "," + Browser.DEFAULT_SYSTEM_BROWSER;
            }

            public String url() {
                return "http://localhost:" + port + "/jsunit/testRunner.html?" +
                        "testPage=http://localhost:" + port + "/jsunit/tests/jsUnitTestSuite.html" +
                        "&autoRun=true&submitresults=true&resultId=foobar";
            }

            public String port() {
                return String.valueOf(port);
            }

        };
    }

    public void testSuccessfulRun() throws Exception {
        StandaloneTest test = new StandaloneTest(configurationSource());
        TestResult result = test.run();
        assertTrue(result.wasSuccessful());
        assertTrue(test.getServer().lastResult().wasSuccessful());
    }

}
