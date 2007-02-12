package net.jsunit.model;

import junit.framework.TestCase;

public class ExternallyShutDownBrowserResultTest extends TestCase {

    private String xml =
            "<browserResult externallyShutDown=\"true\">" +
                    "<properties>" +
                    "<property name=\"browserFileName\" value=\"c:\\Program Files\\Internet Explorer\\iexplore.exe\" />" +
                    "<property name=\"browserId\" value=\"17\" />" +
                    "</properties>" +
                    "</browserResult>";

    private BrowserResult result;

    public void setUp() throws Exception {
        super.setUp();
        result = new BrowserResult();
        result.setExternallyShutDown();
        result.setBrowser(new Browser("c:\\Program Files\\Internet Explorer\\iexplore.exe", 17));
    }

    public void testSimple() {
        assertEquals("c:\\Program Files\\Internet Explorer\\iexplore.exe", result.getBrowser().getFileName());
        assertEquals(0d, result.getTime());
        assertEquals(ResultType.EXTERNALLY_SHUT_DOWN.getDisplayString(), result.getDisplayString());
        assertEquals(0, result.getTestCount());
        assertEquals(ResultType.EXTERNALLY_SHUT_DOWN, result.getResultType());
        assertEquals(0, result.getTestPageResults().size());
    }

    public void testCompleted() {
        assertFalse(result.completedTestRun());
        assertFalse(result.timedOut());
        assertFalse(result.failedToLaunch());
        assertTrue(result.externallyShutDown());
    }

    public void testXml() {
        assertEquals(xml, result.asXmlFragment());
    }

    public void testReconstituteFromXml() {
        BrowserResultBuilder builder = new BrowserResultBuilder(new DummyBrowserSource("c:\\Program Files\\Internet Explorer\\iexplore.exe", 17));
        BrowserResult reconstitutedResult = builder.build(xml);
        assertEquals("c:\\Program Files\\Internet Explorer\\iexplore.exe", reconstitutedResult.getBrowser().getFileName());
        assertTrue(reconstitutedResult.externallyShutDown());
        assertEquals(ResultType.EXTERNALLY_SHUT_DOWN, reconstitutedResult.getResultType());
    }

}
