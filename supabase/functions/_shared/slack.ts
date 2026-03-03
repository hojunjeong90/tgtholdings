/**
 * Slack 웹훅 알림 모듈
 * 자동화된 스케줄러에서 Slack으로 알림을 보내는 유틸리티
 */

export interface SlackNotification {
  /** 프로젝트 이름 (예: "TGT Quant") */
  project: string;
  /** 주제 - 처리한 기능 (예: "환율 업데이트") */
  subject: string;
  /** 내용 - 최대 5줄 */
  content: string[];
  /** 링크 - 전체 URL (선택) */
  link?: string;
}

/**
 * Slack 웹훅으로 알림 전송
 * @param notification 알림 내용
 * @returns 성공 여부
 */
export async function sendSlackNotification(
  notification: SlackNotification
): Promise<boolean> {
  const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL이 설정되지 않았습니다. 알림을 건너뜁니다.");
    return false;
  }

  try {
    // 내용을 최대 5줄로 제한
    const contentLines = notification.content
      .slice(0, 5)
      .map(line => `• ${line}`)
      .join("\n");

    // 메시지 조합
    const message = [
      `*발송* : ${notification.project}`,
      `*주제* : ${notification.subject}`,
      `*내용* :`,
      contentLines,
      notification.link ? `*링크* : ${notification.link}` : null,
    ].filter(Boolean).join("\n");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Slack 웹훅 실패: ${response.status} - ${errorText}`);
      return false;
    }

    console.log("Slack 알림 전송 성공:", notification.subject);
    return true;
  } catch (error) {
    console.error("Slack 알림 전송 실패:", error);
    return false;
  }
}

/**
 * 에러 알림 전송 (간편 함수)
 */
export async function sendSlackError(
  functionName: string,
  error: Error | string
): Promise<boolean> {
  return sendSlackNotification({
    project: "TGT Quant",
    subject: "에러 발생",
    content: [
      `함수: ${functionName}`,
      `에러: ${typeof error === "string" ? error : error.message}`,
      `시간: ${new Date().toISOString()}`,
    ],
  });
}

/**
 * 성공 알림 전송 (간편 함수)
 */
export async function sendSlackSuccess(
  subject: string,
  content: string[],
  link?: string
): Promise<boolean> {
  return sendSlackNotification({
    project: "TGT Quant",
    subject,
    content,
    link,
  });
}
