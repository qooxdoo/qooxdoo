package net.jsunit.model;

import junit.framework.TestCase;

public class TimedOutBrowerResultTest extends TestCase {

    private String xml =
            "<browserResult timedOut=\"true\">" +
                    "<properties>" +
                    "<property name=\"browserFileName\" value=\"c:\\Program Files\\Internet Explorer\\iexplore.exe\" />" +
                    "<property name=\"browserId\" value=\"3\" />" +
                    "</properties>" +
                    "</browserResult>";

    private BrowserResult browserResult;

    public void setUp() throws Exception {
        super.setUp();
        browserResult = new BrowserResult();
        browserResult.setTimedOut();
        browserResult.setBrowser(new Browser("c:\\Program Files\\Internet Explorer\\iexplore.exe", 3));
    }

    public void testSimple() {
        assertEquals("c:\\Program Files\\Internet Explorer\\iexplore.exe", browserResult.getBrowser().getFileName());
        assertEquals(ResultType.TIMED_OUT, browserResult.getResultType());
    }

    public void testCompleted() {
        assertFalse(browserResult.completedTestRun());
        assertTrue(browserResult.timedOut());
        assertFalse(browserResult.failedToLaunch());
        assertFalse(browserResult.externallyShutDown());
    }

    public void testAsXml() {
        assertEquals(xml, browserResult.asXmlFragment());
    }

    public void testReconstituteFromXml() {
        BrowserResultBuilder builder = new BrowserResultBuilder(new DummyBrowserSource("c:\\Program Files\\Internet Explorer\\iexplore.exe", 3));
        BrowserResult reconstitutedResult = builder.build(xml);
        assertEquals("c:\\Program Files\\Internet Explorer\\iexplore.exe", reconstitutedResult.getBrowser().getFileName());
        assertTrue(reconstitutedResult.timedOut());
        assertEquals(ResultType.TIMED_OUT, reconstitutedResult.getResultType());

    }

}
