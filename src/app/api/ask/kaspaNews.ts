import { request as requestHttp } from "node:http";
import { request as requestHttps } from "node:https";

type AskPayload = {
  mode: string;
  op: "query";
  question: string;
  stream: false;
};

type AskApiResult = {
  contentType: string | undefined;
  ok: boolean;
  status: number;
  text: string;
};

export function postKaspaNewsAsk(
  apiUrl: string,
  apiKey: string,
  payload: AskPayload,
  signal: AbortSignal,
): Promise<AskApiResult> {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    const url = new URL(apiUrl);
    const body = JSON.stringify(payload);
    const request =
      url.protocol === "https:"
        ? requestHttps
        : url.protocol === "http:"
          ? requestHttp
          : null;

    if (!request) {
      reject(new Error(`Unsupported ASK API protocol: ${url.protocol}`));
      return;
    }

    const resolveOnce = (result: AskApiResult) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      resolve(result);
    };

    const rejectOnce = (error: Error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      reject(error);
    };

    const upstream = request(
      url,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(body).toString(),
          "Content-Type": "application/json",
          "User-Agent": "kaspa-org-ask-proxy/1.0",
        },
        method: "POST",
        signal,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("aborted", () => {
          rejectOnce(new Error("ASK API response aborted"));
        });

        response.on("error", rejectOnce);

        response.on("end", () => {
          const status = response.statusCode ?? 502;
          const contentType = response.headers["content-type"];

          resolveOnce({
            contentType: Array.isArray(contentType)
              ? contentType[0]
              : contentType,
            ok: status >= 200 && status < 300,
            status,
            text: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    upstream.on("error", rejectOnce);
    upstream.end(body);
  });
}
