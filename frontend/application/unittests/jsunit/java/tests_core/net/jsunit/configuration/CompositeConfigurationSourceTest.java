package net.jsunit.configuration;

import junit.framework.TestCase;
import net.jsunit.StubConfigurationSource;

import java.io.FileNotFoundException;

public class CompositeConfigurationSourceTest extends TestCase {

    public void testSingleSource() throws FileNotFoundException {
        CompositeConfigurationSource compositeSource = new CompositeConfigurationSource(new Source1());
        assertEquals("foo", compositeSource.url());
    }

    public void testPrecedence() {
        CompositeConfigurationSource compositeSource = new CompositeConfigurationSource(
            new Source1(),
            new Source2());
        assertEquals("foo", compositeSource.url());
        assertEquals("1234", compositeSource.port());
    }
    
    public static class Source1 extends StubConfigurationSource {
        public String url() {
            return "foo";
        }
    }

    public static class Source2 extends StubConfigurationSource {
        public String url() {
            return "bar";
        }

        public String port() {
            return "1234";
        }
    }
}
