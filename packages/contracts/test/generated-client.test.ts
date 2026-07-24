import {
  Configuration,
  type FetchAPI,
  ServiceHealthFromJSON,
  ServiceHealthStateEnum,
  SystemApi,
} from "@argent/api-client";
import { describe, expect, it } from "vitest";

describe("generated TypeScript client", () => {
  it("maps a liveness response without losing enum semantics", () => {
    expect(
      ServiceHealthFromJSON({
        service: "argent-api",
        state: "ok",
        version: "contract-test",
      }),
    ).toEqual({
      service: "argent-api",
      state: ServiceHealthStateEnum.Ok,
      version: "contract-test",
    });
  });

  it("exposes the versioned system operation", () => {
    expect(typeof new SystemApi().getLiveness).toBe("function");
  });

  it("calls the documented route and decodes its response", async () => {
    const requests: string[] = [];
    const fetchApi: FetchAPI = async (input) => {
      requests.push(input.toString());

      return new Response(
        JSON.stringify({
          service: "argent-api",
          state: "ok",
          version: "contract-test",
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      );
    };
    const client = new SystemApi(
      new Configuration({
        basePath: "https://api.argent.test",
        fetchApi,
      }),
    );

    await expect(client.getLiveness()).resolves.toEqual({
      service: "argent-api",
      state: ServiceHealthStateEnum.Ok,
      version: "contract-test",
    });
    expect(requests).toEqual(["https://api.argent.test/health/live"]);
  });
});
