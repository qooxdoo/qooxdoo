package net.jsunit.model;

import junit.framework.TestCase;

public class BrowserTest extends TestCase {

    public void testSimple() throws Exception {
        Browser browser = new Browser("c:\\program files\\internet explorer\\iexplore.exe", 4);
        assertEquals("c:\\program files\\internet explorer\\iexplore.exe", browser.getFileName());
        assertEquals(4, browser.getId());
        assertTrue(browser.hasId(4));
        assertFalse(browser.hasId(2));
    }

    public void testKillCommand() throws Exception {
        Browser browser = new Browser("mybrowser.exe", 0);
        assertEquals("mybrowser.exe", browser.getFileName());
        assertNull(browser.getKillCommand());

        browser = new Browser("mybrowser.exe;", 0);
        assertEquals("mybrowser.exe", browser.getFileName());
        assertNull(browser.getKillCommand());

        browser = new Browser("mybrowser.exe;kill-mybrowser.bat", 0);
        assertEquals("mybrowser.exe", browser.getFileName());
        assertEquals("kill-mybrowser.bat", browser.getKillCommand());
    }

}
