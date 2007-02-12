package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.logging.StubBrowserResultRepository;

public class BrowserResultLogWriterTest extends TestCase {

    public void testSimple() {
        assertTrue(new BrowserResultLogWriter(new StubBrowserResultRepository()).isReady());
    }

}
