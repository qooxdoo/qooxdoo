package net.jsunit;

import junit.framework.TestResult;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.ResultType;

public class FailedToLaunchBrowserStandaloneTestTest extends EndToEndTestCase {

    protected ConfigurationSource configurationSource() {
        return new StubConfigurationSource() {
            public String browserFileNames() {
                return "no_such_browser.exe";
            }

            public String url() {
                return "http://localhost:"+port+"/jsunit/testRunner.html?" +
                        "testPage=http://localhost:"+port+"/jsunit/tests/jsUnitUtilityTests.html" +
                        "&autoRun=true&submitresults=true&resultId=foobar";
            }
            
            public String port() {
            	return String.valueOf(port);
            }
        };
    }

    public void testFailToLaunchBrowsers() throws Exception {
        StandaloneTest test = new StandaloneTest(configurationSource());
        TestResult result = test.run();
        assertFalse(result.wasSuccessful());
        assertEquals(ResultType.FAILED_TO_LAUNCH, test.getServer().lastResult().getResultType());
    }

}
