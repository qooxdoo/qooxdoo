package net.jsunit.version;

import junit.framework.TestCase;

public class VersionCheckerTest extends TestCase {

    public void testOutOfDate() throws Exception {
        VersionChecker checker = new VersionChecker(1.1, new MockVersionGrabber(1.2));
        assertFalse(checker.isUpToDate());
    }

    public void testUpToDate() throws Exception {
        VersionChecker checker = new VersionChecker(1.1, new MockVersionGrabber(1.1));
        assertTrue(checker.isUpToDate());
    }

    public void testBlowsUp() throws Exception {
        VersionChecker checker = new VersionChecker(1.1, new BlowingUpVersionGrabber());
        assertTrue(checker.isUpToDate());
    }

}
