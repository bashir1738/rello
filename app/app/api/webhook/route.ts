export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const { symbol, action, driftPct, referencePrice, wrappedPrice, timestamp } =
    body;

  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  const slackUrl = process.env.SLACK_WEBHOOK_URL;

  const embed = {
    title: `Rello Alert: ${symbol}`,
    description: action,
    color:
      Math.abs(driftPct) > 1.5
        ? 0xff5c5c
        : Math.abs(driftPct) > 0.5
          ? 0xffb020
          : 0x00d084,
    fields: [
      { name: "Drift", value: `${driftPct.toFixed(3)}%`, inline: true },
      {
        name: "Reference",
        value: `$${referencePrice.toFixed(2)}`,
        inline: true,
      },
      {
        name: "Wrapped",
        value: `$${wrappedPrice.toFixed(2)}`,
        inline: true,
      },
    ],
    timestamp: timestamp || new Date().toISOString(),
  };

  const results: { channel: string; ok: boolean; error?: string }[] = [];

  if (discordUrl) {
    try {
      const res = await fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });
      results.push({ channel: "discord", ok: res.ok });
    } catch (e) {
      results.push({
        channel: "discord",
        ok: false,
        error: e instanceof Error ? e.message : "Unknown",
      });
    }
  }

  if (slackUrl) {
    try {
      const res = await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: [
            {
              type: "header",
              text: { type: "plain_text", text: `Rello Alert: ${symbol}` },
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Action:* ${action}` },
                { type: "mrkdwn", text: `*Drift:* ${driftPct.toFixed(3)}%` },
                {
                  type: "mrkdwn",
                  text: `*Reference:* $${referencePrice.toFixed(2)}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Wrapped:* $${wrappedPrice.toFixed(2)}`,
                },
              ],
            },
          ],
        }),
      });
      results.push({ channel: "slack", ok: res.ok });
    } catch (e) {
      results.push({
        channel: "slack",
        ok: false,
        error: e instanceof Error ? e.message : "Unknown",
      });
    }
  }

  return Response.json({
    sent: results.length > 0,
    results,
    payload: { symbol, action, driftPct, referencePrice, wrappedPrice },
  });
}
