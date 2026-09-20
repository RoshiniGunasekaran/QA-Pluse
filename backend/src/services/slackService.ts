import axios from "axios";

export async function sendSlackMessage(
  webhookUrl: string,
  message: string
): Promise<boolean> {
  try {
    await axios.post(
      webhookUrl,
      {
        text: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Slack message sent successfully");

    return true;
  } catch (error: any) {
    console.error(
      "Failed to send Slack message:",
      error?.response?.data || error?.message || error
    );

    return false;
  }
}

export function formatTestFailureMessage(
  testName: string,
  message: string,
  projectId: number
): string {
  return [
    "🚨 *QA Pulse - Test Failure*",
    "",
    `*Test:* ${testName}`,
    `*Project ID:* ${projectId}`,
    `*Message:* ${message}`,
  ].join("\n");
}

export function formatRiskAlertMessage(
  riskLevel: string,
  commitHash: string,
  projectId: number
): string {
  return [
    "⚠️ *QA Pulse - Risk Alert*",
    "",
    `*Risk Level:* ${riskLevel}`,
    `*Commit:* ${commitHash}`,
    `*Project ID:* ${projectId}`,
  ].join("\n");
}