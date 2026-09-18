/**
 * Enum representing possible test statuses.
 */
export enum TestStatus {
  PASS = "PASS",
  FAIL = "FAIL",
  SKIPPED = "SKIPPED",
}

/**
 * Interface representing a single test result.
 */
export interface TestResult {
  /** Name of the test (required, must not be empty). */
  test_name: string;

  /** Status of the test (PASS | FAIL | SKIPPED). */
  status: TestStatus;

  /** Duration of the test in seconds (must be >= 0). */
  duration: number;

  /** Module or component name (optional but recommended). */
  module?: string;

  /** Framework used (JUnit | Postman | Other, required). */
  framework: string;

  /** Timestamp when the test was executed (auto-generated if not provided). */
  timestamp?: Date;
}

/**
 * Interface representing a test run summary.
 */
export interface TestRun {
  /** Auto-generated ID from the database. */
  id?: number;

  /** Project ID (required, must be a positive integer). */
  project_id: number;

  /** Sequential run number (required). */
  run_number: number;

  /** Total number of tests in the run (must be >= 0). */
  total_tests: number;

  /** Number of passed tests (must be >= 0). */
  passed_tests: number;

  /** Number of failed tests (must be >= 0). */
  failed_tests: number;

  /** Number of skipped tests (must be >= 0). */
  skipped_tests: number;

  /** Duration of the run in seconds (must be >= 0). */
  duration: number;

  /** Timestamp when the run was created (auto-generated). */
  created_at?: Date;
}

/**
 * Interface representing a parsed JUnit test result.
 */
export interface ParsedJUnitResult {
  /** Name of the test. */
  test_name: string;

  /** Status of the test (PASS | FAIL | SKIPPED). */
  status: TestStatus;

  /** Duration of the test in seconds. */
  duration: number;

  /** Module extracted from the class name. */
  module: string;

  /** Full class name from JUnit report. */
  className: string;
}

/**
 * Interface representing a parsed Postman test result.
 */
export interface ParsedPostmanResult {
  /** Name of the test. */
  test_name: string;

  /** Status of the test (PASS | FAIL | SKIPPED). */
  status: TestStatus;

  /** Duration of the test in seconds. */
  duration: number;

  /** Module name. */
  module: string;

  /** Response time in milliseconds. */
  responseTime: number;
}

/**
 * Generic API response wrapper.
 */
export interface APIResponse<T> {
  /** Indicates if the request was successful. */
  success: boolean;

  /** Human-readable message about the response. */
  message: string;

  /** Optional data payload. */
  data?: T;

  /** Optional list of error messages. */
  errors?: string[];

  /** Timestamp when the response was generated. */
  timestamp: Date;
}

/**
 * Interface representing a validation error.
 */
export interface ValidationError {
  /** Field that caused the error. */
  field: string;

  /** Error message. */
  message: string;

  /** Invalid value provided. */
  value: any;
}
