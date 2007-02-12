package net.jsunit;

import junit.framework.TestResult;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.Browser;
import net.jsunit.model.ResultType;

public class OverrideURLDistributedTestTest extends EndToEndTestCase {

    protected ConfigurationSource farmSource() {
        return new StubConfigurationSource() {
            public String remoteMachineURLs() {
                return "http://localhost:" + port;
            }
        };
    }

    protected ConfigurationSource serverSourceWithBadTestURL() {
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

    public void testOverrideURL() throws Throwable {
        DistributedTest test = new DistributedTest(serverSourceWithBadTestURL(), farmSource());
        test.getDistributedTestRunManager().setOverrideURL(
                "http://localhost:" + port + "/jsunit/testRunner.html?" +
                        "testPage=http://localhost:" + port + "/jsunit/tests/jsUnitUtilityTests.html&autoRun=true&submitresults=true"
        );
        TestResult result = test.run();

        assertEquals(
                ResultType.SUCCESS,
                test.getDistributedTestRunManager().getDistributedTestRunResult().getResultType()
        );
        assertTrue(result.wasSuccessful());
    }

}
