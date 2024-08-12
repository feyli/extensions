import fetch from "cross-fetch";

export interface ServerStatus {
  online: boolean;
  ip: string;
  port: number;
  motd?: {
    clean: string[];
  };
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  hostname?: string;
  icon?: string;
}

export function getStatus(address: string, bedrock: boolean, port?: number): Promise<Response> {
  return fetch(`https://api.mcsrvstat.us${bedrock ? "/bedrock" : ""}/3/${address}${port ? ":" + port : ""}`);
}
