import { ParsedPostmanResult, TestStatus } from "../types/testResults";

/**
 * Parse a Postman/Newman JSON string into an array of ParsedPostmanResult objects.
 *
 * Handles edge cases:
 * - Empty/null input
 * - Invalid JSON
 * - Missing/invalid fields
 * - Special characters
 * - Large files
 * - Multiple requests/folders
 * - Assertion status determination
 * - Response time conversion
 *
 * @param jsonString Raw Postman/Newman JSON export string
 * @returns Array of parsed test results OR null if invalid
 */
export function parsePostmanJson(
  jsonString: string | null | undefined
): ParsedPostmanResult[] | null {
  // 1. Empty/null input
  if (!jsonString || jsonString.trim() === "") {
    return null;
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("Error parsing Postman JSON:", err);
    return null;
  }

  const results: ParsedPostmanResult[] = [];

  // Helper to normalize duration (ms → seconds)
  const normalizeDuration = (ms: any): number => {
    const val = parseFloat(ms);
    if (isNaN(val) || val < 0) return 0;
    return val / 1000;
  };

  // Helper to determine status
  const determineStatus = (execution: any): TestStatus => {
    if (execution.skipped) return TestStatus.SKIPPED;
    if (execution.assertions) {
      const hasFail = execution.assertions.some(
        (a: any) => a.error || a.passed === false
      );
      return hasFail ? TestStatus.FAIL : TestStatus.PASS;
    }
    return TestStatus.FAIL; // conservative default
  };

  // Extract from Newman run.executions
  if (parsed.run && parsed.run.executions) {
    for (const exec of parsed.run.executions) {
      const test_name =
        exec.item?.name || exec.request?.name || exec.id || "Unnamed Test";
      const className = exec.item?.name || "UnknownModule";
      const module = className.split(".").pop() || "API";

      const status = determineStatus(exec);
      const duration = normalizeDuration(
        exec.response?.responseTime || exec.times?.responseTime || 0
      );

      results.push({
        test_name,
        status,
        duration,
        module,
        responseTime: duration,
      });
    }
  }

  // Extract from Postman collection items
  if (parsed.collection && parsed.collection.item) {
    const traverseItems = (items: any[], parentModule: string) => {
      for (const item of items) {
        if (item.item) {
          traverseItems(item.item, item.name || parentModule);
        } else {
          const test_name = item.name || item.request?.url || "Unnamed Test";
          const className = item.name || "UnknownModule";
          const module = parentModule || "API";

          // Default status (no assertions → FAIL)
          let status: TestStatus = TestStatus.FAIL;
          if (item.event) {
            const hasTests = item.event.some((e: any) => e.listen === "test");
            status = hasTests ? TestStatus.PASS : TestStatus.FAIL;
          }

          const duration = normalizeDuration(
            item.response?.[0]?.responseTime || 0
          );

          results.push({
            test_name,
            status,
            duration,
            module,
            responseTime: duration,
          });
        }
      }
    };

    traverseItems(parsed.collection.item, parsed.collection.name || "API");
  }

  if (results.length === 0) {
    return [];
  }

  // Deduplicate by test_name
  const uniqueResults = results.reduce<ParsedPostmanResult[]>((acc, curr) => {
    if (!acc.find((r) => r.test_name === curr.test_name)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Sort alphabetically by test_name
  uniqueResults.sort((a, b) => a.test_name.localeCompare(b.test_name));

  return uniqueResults;
}
