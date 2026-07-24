export type ServiceState = "ok" | "degraded";

export interface ServiceHealth {
  readonly service: string;
  readonly state: ServiceState;
  readonly version: string;
}

export function buildServiceHealth(
  service: string,
  version: string,
  state: ServiceState = "ok",
): ServiceHealth {
  const normalizedService = service.trim();
  const normalizedVersion = version.trim();

  if (normalizedService.length === 0) {
    throw new Error("Service name must not be empty");
  }

  if (normalizedVersion.length === 0) {
    throw new Error("Service version must not be empty");
  }

  return {
    service: normalizedService,
    state,
    version: normalizedVersion,
  };
}
