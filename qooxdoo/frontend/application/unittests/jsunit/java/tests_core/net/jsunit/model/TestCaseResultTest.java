package net.jsunit.model;

import junit.framework.TestCase;

public class TestCaseResultTest extends TestCase {
    public TestCaseResultTest(String name) {
        super(name);
    }

    public void testBuildSuccessfulResultFromString() {
        TestCaseResult result = TestCaseResult.fromString("file:///dummy%20path/dummyPage.html:testFoo|1.3|S||");
        assertEquals("file:///dummy path/dummyPage.html", result.getTestPageName());
        assertEquals("testFoo", result.getName());
        assertEquals("file:///dummy path/dummyPage.html:testFoo", result.getFullyQualifiedName());
        assertEquals(1.3d, result.getTime(), 0.1d);
        assertFalse(result.hadError());
        assertFalse(result.hadFailure());
        assertTrue(result.wasSuccessful());
        assertNull(result.getError());
        assertNull(result.getFailure());
        assertEquals(ResultType.SUCCESS, result.getResultType());
        assertEquals("<testCase name=\"file:///dummy path/dummyPage.html:testFoo\" time=\"1.3\" />", result.getXmlFragment());
    }

    public void testProblemSummary() {
        TestCaseResult result = TestCaseResult.fromString("file:///dummy/path/dummyPage.html:testFoo|1.3|E|Test Error Message|");
        assertEquals("file:///dummy/path/dummyPage.html:testFoo had an error:\nTest Error Message", result.getProblemSummary());
    }

    public void testBuildErrorResultFromString() {
        TestCaseResult result = TestCaseResult.fromString("file:///dummy/path/dummyPage.html:testFoo|1.3|E|Test Error Message|");
        assertEquals("file:///dummy/path/dummyPage.html:testFoo", result.getFullyQualifiedName());
        assertEquals(1.3d, result.getTime());
        assertTrue(result.hadError());
        assertFalse(result.hadFailure());
        assertFalse(result.wasSuccessful());
        assertEquals("Test Error Message", result.getError());
        assertNull(result.getFailure());
        assertEquals(ResultType.ERROR, result.getResultType());
        assertEquals("<testCase name=\"file:///dummy/path/dummyPage.html:testFoo\" time=\"1.3\"><error>Test Error Message</error></testCase>", result.getXmlFragment());
    }

    public void testBuildFailureResultFromString() {
        TestCaseResult result = TestCaseResult.fromString("file:///dummy/path/dummyPage.html:testFoo|1.3|F|Test Failure Message|");
        assertEquals("file:///dummy/path/dummyPage.html:testFoo", result.getFullyQualifiedName());
        assertEquals(1.3d, result.getTime());
        assertFalse(result.hadError());
        assertTrue(result.hadFailure());
        assertFalse(result.wasSuccessful());
        assertNull(result.getError());
        assertEquals("Test Failure Message", result.getFailure());
        assertEquals(ResultType.FAILURE, result.getResultType());
        assertEquals("<testCase name=\"file:///dummy/path/dummyPage.html:testFoo\" time=\"1.3\"><failure>Test Failure Message</failure></testCase>", result.getXmlFragment());
    }

}
