package net.jsunit;

import junit.framework.TestCase;
import junit.framework.TestResult;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.model.Browser;
import net.jsunit.model.ResultType;

public class ExternallyShutDownStandaloneTestTest extends TestCase {

    public ExternallyShutDownStandaloneTestTest(String name) {
        super(name);
    }

    protected ConfigurationSource configurationSource() {
        return new StubConfigurationSource() {
            public String browserFileNames() {
                return Browser.DEFAULT_SYSTEM_BROWSER;
            }

            public String url() {
                return "http://localhost:8080/jsunit/testRunner.html?" +
                        "testPage=http://localhost:8080/jsunit/tests/jsUnitTestSuite.html" +
                        "&autoRun=true&submitresults=true&resultId=foobar";
            }
        };
    }

    public void testBrowsersExternallyShutDown() throws Exception {
        final StandaloneTest test = new StandaloneTest(configurationSource());
        new Thread() {
            public void run() {
                try {
                    while (test.getServer() == null)
                        Thread.sleep(100);
                    while (test.getServer().getBrowserProcess() == null)
                        Thread.sleep(100);
                } catch (InterruptedException e) {
                    fail();
                }
                Process process = test.getServer().getBrowserProcess();
                process.destroy();
                try {
                    process.waitFor();
                } catch (InterruptedException e) {
                    fail();
                }
            }
        }.start();

        TestResult result = test.run();
        assertFalse(result.wasSuccessful());
        assertEquals(
                ResultType.EXTERNALLY_SHUT_DOWN,
                test.getServer().lastResult().getResultType());
    }

}
