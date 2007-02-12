package net.jsunit.action;

import junit.framework.TestCase;
import net.jsunit.version.MockVersionGrabber;
import net.jsunit.version.BlowingUpVersionGrabber;

public class LatestVersionActionTest extends TestCase {
    private LatestVersionAction action;

    protected void setUp() throws Exception {
        super.setUp();
        action = new LatestVersionAction();
    }

    public void testGetLatestVersion() throws Exception {
        action.setVersionGrabber(new MockVersionGrabber(43.21));
        assertEquals(LatestVersionAction.SUCCESS, action.execute());
        assertEquals(43.21, action.getLatestVersion());
    }

    public void testBlowUp() throws Exception {
        action.setVersionGrabber(new BlowingUpVersionGrabber());
        assertEquals(LatestVersionAction.ERROR, action.execute());
    }

}
