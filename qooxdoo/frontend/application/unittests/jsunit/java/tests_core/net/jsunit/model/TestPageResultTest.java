package net.jsunit.model;

import junit.framework.TestCase;

import java.util.ArrayList;
import java.util.List;

public class TestPageResultTest extends TestCase {

    public void testSimple() {
        TestPageResult result = new TestPageResult("mypage.html");
        assertEquals("mypage.html", result.getTestPageName());
        TestCaseResult testCase1 = new TestCaseResult();
        TestCaseResult testCase2 = new TestCaseResult();
        result.addTestCaseResult(testCase1);
        result.addTestCaseResult(testCase2);
        List<TestCaseResult> expected = new ArrayList<TestCaseResult>();
        expected.add(testCase1);
        expected.add(testCase2);
        assertEquals(expected, result.getTestCaseResults());
    }

    public void testResultType() {
        TestPageResult result = new TestPageResult("mypage.html");
        TestCaseResult success = new TestCaseResult();
        result.addTestCaseResult(success);
        assertEquals(ResultType.SUCCESS, result.getResultType());
        TestCaseResult failure = new TestCaseResult();
        failure.setFailure("not right");
        result.addTestCaseResult(failure);
        assertEquals(ResultType.FAILURE, result.getResultType());
        TestCaseResult error = new TestCaseResult();
        error.setError("disaster");
        result.addTestCaseResult(error);
        assertEquals(ResultType.ERROR, result.getResultType());
    }

}
