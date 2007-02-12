package net.jsunit;

import junit.framework.TestResult;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.Browser;
import net.jsunit.model.ResultType;

public class TimedOutBrowserStandaloneTestTest extends EndToEndTestCase {

    protected ConfigurationSource configurationSource() {
        return new StubConfigurationSource() {
            public String browserFileNames() {
                return Browser.DEFAULT_SYSTEM_BROWSER;
            }

            public String url() {
                return "http://localhost:" + port + "/jsunit/testRunner.html?" +
                        "testPage=http://localhost:" + port + "/jsunit/tests/jsUnitTestSuite.html" +
                        "&autoRun=true&submitresults=true&resultId=foobar";
            }

            public String timeoutSeconds() {
                return "0";
            }

            public String port() {
                return String.valueOf(port);
            }

        };
    }

    public void testBrowserTimesOut() throws Exception {
        StandaloneTest test = new StandaloneTest(configurationSource());
        TestResult result = test.run();
        assertEquals(ResultType.TIMED_OUT, test.getServer().lastResult().getResultType());
        assertFalse(result.wasSuccessful());
    }

}
