package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.Browser;

public class BrowserLaunchSpecificationTest extends TestCase {

    public void testNoOverride() {
        BrowserLaunchSpecification spec = new BrowserLaunchSpecification(new Browser("mybrowser.exe", 0));
        assertFalse(spec.hasOverrideUrl());
        assertNull(spec.getOverrideUrl());

        spec = new BrowserLaunchSpecification(new Browser("mybrowser.exe", 0), " ");
        assertFalse(spec.hasOverrideUrl());
    }

    public void testOverride() {
        BrowserLaunchSpecification spec = new BrowserLaunchSpecification(
                new Browser("mybrowser.exe", 0),
                "http://www.example.com"
        );
        assertTrue(spec.hasOverrideUrl());
        assertEquals("http://www.example.com", spec.getOverrideUrl());
    }

}
