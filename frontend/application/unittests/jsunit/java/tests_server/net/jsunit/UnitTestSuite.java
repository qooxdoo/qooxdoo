package net.jsunit;

import junit.framework.TestSuite;

public class UnitTestSuite {

    public static TestSuite suite() {
        TestSuite result = new TestSuite();
        result.addTest(PureUnitTestSuite.suite());
        result.addTest(ImpureUnitTestSuite.suite());
        return result;
    }

}