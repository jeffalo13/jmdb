type LogType = 'log' | 'warn' | 'error' | 'info';

export interface LogEntry {
  type: LogType;
  message: any[];
  timestamp: string;
}

const logs: LogEntry[] = [];

(['log', 'warn', 'error', 'info'] as LogType[]).forEach((type) => {
  const original = console[type];
  console[type] = (...args: any[]) => {
    logs.push({
      type,
      message: args,
      timestamp: new Date().toISOString(),
    });

    if (logs.length > 100) logs.shift();
    original(...args);
  };
});

export class CapturedLogs {
  private readonly entries: LogEntry[];

  constructor(entries: LogEntry[]) {
    this.entries = entries;
  }

  prettyPrintString(): string {
    return this.entries
      .map((log) => {
        const prefix = {
          log: '⬜ LOG',
          info: '🟦 INFO',
          warn: '🟨 WARN',
          error: '🟥 ERROR',
        }[log.type];

        const formattedMessage = log.message
        .map((m) =>
            m instanceof Error
            ? `${m.name}: ${m.message}\n${m.stack}`
            : typeof m === 'string'
                ? m
                : JSON.stringify(m, null, 2)
        )
        .join('\n    ');

        const entryText = `[${log.timestamp}] ${prefix} ${formattedMessage}`;
        return entryText;
      })
      .join('\n\n');
  }

  toArray(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export const getCapturedLogs = (): CapturedLogs => new CapturedLogs([...logs]);

export const clearCapturedLogs = () => {
  logs.length = 0;
};

export function parseLogMessage(input: any): string {
  if (input instanceof Error) {
    return `${input.stack}`;
  }

  if (typeof input === 'string') {
    return input;
  }

  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return String(input);
  }
}

window.onerror = (msg, url, lineNo, columnNo, error) => {
  const safeError =
    error instanceof Error
      ? error
      : new Error(
          typeof msg === 'string'
            ? `${msg} @ ${url}:${lineNo}:${columnNo}`
            : 'Unknown runtime error'
        );

  console.error(safeError);
};

window.onunhandledrejection = (event: { reason: any; }) => {
  console.error(event.reason); 
};

function getTeamsChatURL(email: string, autoMessage?: string): string | undefined {

  if (!email)
  {
    return undefined;
  }

  const baseUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`;
  if (autoMessage) {
    return `${baseUrl}&message=${encodeURIComponent(autoMessage)}`;
  }
  return baseUrl;
}

export function prettyPrintLogsForEmail(logs?: LogEntry[]): any[] | undefined {

  if (!logs || logs.length === 0)
    return;
  
    const prefixMap = {
    error: '🟥 ERROR',
    warn: '🟨 WARN',
    info: '🟦 INFO',
    log: '⬜ LOG'
    };

    return logs.map((log) => {
    const text =
      `[${log.timestamp}] ${prefixMap[log.type]}\n` +
        log.message.map((m) => {
            return parseLogMessage(m);

        })
        .join('\n')

        // console.log(text);
        return text;
      }
    )
}

export  function formatBugReport_AdaptiveCardJSON(
    message: string,
    screenshotURL: string | undefined,
    userInfo: any,
    consoleLogs: LogEntry[]
  ): string {
    const chatUrl = getTeamsChatURL(userInfo?.email);

    const containerKeyStringFormat = 'StackTraceContainer';

    // console.log(consoleLogs)

  const adaptiveCard = {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body: [
      {
        type: "TextBlock",
        text: message,
        weight: "Bolder",
        size: "Large",
        wrap: true
      },
      screenshotURL
        ? {
            type: "ActionSet",
            actions: [
              {
                type: "Action.OpenUrl",
                title: "🖼️ View screenshot",
                url: screenshotURL
              }
            ]
          }
        : {
            type: "TextBlock",
            text: "No screenshot provided.",
            wrap: true
          },
      chatUrl
        ? {
            type: "ActionSet",
            actions: [
              {
                type: "Action.OpenUrl",
                title: `💬 Chat with ${userInfo.fullName}`,
                url: chatUrl
              }
            ]
          }
        : {
            type: "TextBlock",
            text: userInfo ? `User Info: ${userInfo}` : "No user info provided.",
            wrap: true
          },
      // 👇 Spread this to inline multiple or fallback to one
      ...(consoleLogs?.length > 0
        ? prettyPrintLogsContainersMSTeams(consoleLogs, containerKeyStringFormat)
        : [{
            type: "TextBlock",
            text: "No stack trace provided.",
            wrap: true
          }])
    ],
    actions: consoleLogs.length
      ? [
          {
            type: "Action.ToggleVisibility",
            title: "📜 Toggle Stack Trace",
            targetElements: consoleLogs.map(
              (_entry, i) => `${containerKeyStringFormat}${i}`
            )
          }
        ]
      : [],
    msteams: {
      width: "Full"
    }
  };
    return JSON.stringify(adaptiveCard, null, 2);
  }

export function prettyPrintLogsContainersMSTeams(logs: LogEntry[], containerKeyFormat: string): any[] {
  const styleMap: Record<LogType, "attention" | "warning" | "accent" | "emphasis"> = {
    error: "attention", // red
    warn: "warning",    // orange
    info: "accent",     // blue
    log: "emphasis"      // light gray
  };

    const prefixMap = {
    error: '🟥 ERROR',
    warn: '🟨 WARN',
    info: '🟦 INFO',
    log: '⬜ LOG'
    };
  return logs.map((log, i) => {
    const text =
      `[${log.timestamp}] ${prefixMap[log.type]}\n` +
        log.message.map((m) => {
            return parseLogMessage(m);

        })
        .join('\n')

        // console.log(text);
    return {
      type: "Container",
      id: `${containerKeyFormat}${i}`,
      style: styleMap[log.type],
      bleed: true,
      items: [
        {
          type: "TextBlock",
          text: text || ' ',
          wrap: true,
          fontType: "Monospace",
          spacing: "None",
          horizontalAlignment: "Left",
          color: "light" 
        }
      ]
    };
  });
}

