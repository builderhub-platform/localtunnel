/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tunnel } from "libs";

export async function localtunnel(...args: any[]): Promise<Tunnel> {
  const options =
    typeof args[0] === "object" ? args[0] : { ...args[1], port: args[0] };
  const callback = typeof args[0] === "object" ? args[1] : args[2];
  const client = new Tunnel(options);
  if (callback) {
    client.open((err) => (err ? callback(err) : callback(null, client)));
    return client;
  }
  return new Promise((resolve, reject) =>
    client.open((err) => (err ? reject(err) : resolve(client))),
  );
}
