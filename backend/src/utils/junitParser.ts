import { parseStringPromise } from "xml2js";
import { ParsedJUnitResult, TestStatus } from "../types/testResults";

/**
 * Parse a JUnit XML string into an array of ParsedJUnitResult objects.
 *
 * @param xmlString - Raw JUnit XML string
 * @returns Array of parsed test results OR null if invalid
 */
export async function parseJunitXml(
  xmlString: string | null | undefined
): Promise<ParsedJUnitResult[] | null> {
  // 1. Empty/null input
  if (!xmlString || xmlString.trim() === "") {
    return null;
  }

  try {
    // Parse XML string into JS object
    const result = await parseStringPromise(xmlString, {
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    });

    // Flatten testcases from multiple suites
    const testcases: any[] = [];
    if (result.testsuites) {
      const suites = Array.isArray(result.testsuites.testsuite)
        ? result.testsuites.testsuite
        : [result.testsuites.testsuite];

      for (const suite of suites) {
        if (suite.testcase) {
          const cases = Array.isArray(suite.testcase)
            ? suite.testcase
            : [suite.testcase];
          testcases.push(...cases);
        }
      }
    } else if (result.testsuite) {
      const cases = Array.isArray(result.testsuite.testcase)
        ? result.testsuite.testcase
        : [result.testsuite.testcase];
      testcases.push(...cases);
    }

    if (testcases.length === 0) {
      return [];
    }

    const parsedResults: ParsedJUnitResult[] = testcases.map((tc) => {
      // Extract fields safely
      let test_name = tc.name || "Unknown Test";
      let className = tc.classname || "UnknownClass";

      // Determine status
      let status: TestStatus = TestStatus.PASS;
      if (tc.error) {
        status = TestStatus.FAIL;
      } else if (tc.failure) {
        status = TestStatus.FAIL;
      } else if (tc.skipped) {
        status = TestStatus.SKIPPED;
      }

      // Duration handling
      let duration = 0;
      if (tc.time) {
        const parsed = parseFloat(tc.time);
        duration = isNaN(parsed) || parsed < 0 ? 0 : parsed;
      }

      // Module extraction from className
      const parts = className.split(".");
      const module = parts.length > 0 ? parts[parts.length - 1] : "UnknownModule";

      // Sanitize status
      if (
        status !== TestStatus.PASS &&
        status !== TestStatus.FAIL &&
        status !== TestStatus.SKIPPED
      ) {
        status = TestStatus.FAIL;
      }

      return {
        test_name: String(test_name),
        status,
        duration,
        module,
        className: String(className),
      };
    });

    // Remove duplicates by test_name
    const uniqueResults = parsedResults.reduce<ParsedJUnitResult[]>((acc, curr) => {
      if (!acc.find((r) => r.test_name === curr.test_name)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Sort alphabetically by test_name
    uniqueResults.sort((a, b) => a.test_name.localeCompare(b.test_name));

    return uniqueResults;
  } catch (err) {
    console.error("Error parsing JUnit XML:", err);
    return null;
  }
}
