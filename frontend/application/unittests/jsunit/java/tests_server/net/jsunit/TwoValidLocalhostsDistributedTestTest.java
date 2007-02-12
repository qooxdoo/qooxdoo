package net.jsunit;

import junit.framework.TestResult;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.Browser;
import net.jsunit.model.DistributedTestRunResult;
import net.jsunit.model.ResultType;

public class TwoValidLocalhostsDistributedTestTest extends EndToEndTestCase {
    private JsUnitStandardServer secondServer;
    private int otherPort;

    public void setUp() throws Exception {
        super.setUp();
        otherPort = new TestPortManager().newPort();
        secondServer = new JsUnitStandardServer(new Configuration(secondServerSource()), false);
        secondServer.start();
    }

    protected void tearDown() throws Exception {
        if (secondServer != null)
            secondServer.dispose();
        super.tearDown();
    }

    protected ConfigurationSource farmSource() {
        return new StubConfigurationSource() {
            public String remoteMachineURLs() {
                return "http://localhost:" + port + ", http://localhost:" + otherPort;
            }

            public String port() {
                return String.valueOf(port);
            }

        };
    }

    protected StubConfigurationSource serverSource() {
        return new StubConfigurationSource() {

            public String browserFileNames() {
                return Browser.DEFAULT_SYSTEM_BROWSER;
            }

            public String url() {
                return "http://localhost:" + port + "/jsunit/testRunner.html?"
                        + "testPage=http://localhost:" + port + "/jsunit/tests/jsUnitUtilityTests.html&autoRun=true&submitresults=true";
            }

            public String port() {
                return String.valueOf(port);
            }
        };
    }

    protected StubConfigurationSource secondServerSource() {
        return new StubConfigurationSource() {

            public String browserFileNames() {
                return Browser.DEFAULT_SYSTEM_BROWSER;
            }

            public String url() {
                return "http://localhost:" + port + "/jsunit/testRunner.html?"
                        + "testPage=http://localhost:" + port + "/jsunit/tests/jsUnitUtilityTests.html&autoRun=true&submitresults=true";
            }

            public String port() {
                return String.valueOf(otherPort);
            }
        };
    }

    public void testSuccessfulRun() {
        DistributedTest test = new DistributedTest(serverSource(), farmSource());
        TestResult testResult = test.run();
        assertTrue(testResult.wasSuccessful());
        DistributedTestRunResult distributedTestRunResult = test.getDistributedTestRunManager().getDistributedTestRunResult();
        assertEquals(ResultType.SUCCESS, distributedTestRunResult.getResultType());
        assertEquals(2, distributedTestRunResult.getTestRunResults().size());

        assertNull(test.getTemporaryStandardServer());
    }

}