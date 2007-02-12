package net.jsunit;

import junit.framework.TestCase;
import junit.framework.TestSuite;

public class FarmServerFunctionalTestSuite extends TestCase {
    public static TestSuite suite() {
        TestSuite result = new TestSuite();
//        result.addTestSuite(FarmServerFunctionalTest.class);
        result.addTestSuite(FarmServerLandingPageFunctionalTest.class);

        return result;
    }
}
