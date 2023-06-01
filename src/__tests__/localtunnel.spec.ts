import crypto from "crypto";
import http from "http";
import https from "https";
import url from "url";
import assert from "assert";
import { AddressInfo } from "net";
import { localtunnel } from "../localtunnel";

let fakePort: number;

describe("builderhub localtunnel", () => {
  const server = http.createServer();
  beforeAll((done) => {
    server.on("request", (req, res) => {
      res.write(req.headers.host);
      res.end();
    });
    server.listen(() => {
      const { port } = server.address() as AddressInfo;
      fakePort = port;
      done();
    });
  });
  afterAll((done) => {
    server.close(done);
  });

  it("query localtunnel server w/ ident", (done) => {
    localtunnel({ port: fakePort }).then((tunnel) => {
      assert.ok(
        new RegExp("^https://.*tunnel.builderhub.io$").test(tunnel.url),
      );

      const parsed = url.parse(tunnel.url);
      const opt = {
        host: parsed.host,
        port: 443,
        headers: { host: parsed.hostname || "localhost" },
        path: "/",
      };

      const req = https.request(opt, (res) => {
        res.setEncoding("utf8");
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          assert(/.*[.]tunnel[.]builderhub[.]io/.test(body), body);
          tunnel.close();
          done();
        });
      });

      req.end();
    });
  });

  it("request specific domain", async () => {
    const subdomain = Math.random().toString(36).substr(2);
    const tunnel = await localtunnel({ port: fakePort, subdomain });
    assert.ok(
      new RegExp(`^https://${subdomain}.tunnel.builderhub.io$`).test(
        tunnel.url,
      ),
    );
    tunnel.close();
  });
});

describe("--local-host localhost", () => {
  const server = http.createServer();
  beforeAll((done) => {
    server.on("request", (req, res) => {
      res.write(req.headers.host);
      res.end();
    });
    server.listen(() => {
      const { port } = server.address() as AddressInfo;
      fakePort = port;
      done();
    });
  });
  afterAll((done) => {
    server.close(done);
  });
  it("override Host header with local-host", (done) => {
    localtunnel({
      port: fakePort,
      local_host: "localhost",
    }).then((tunnel) => {
      assert.ok(
        new RegExp("^https://.*tunnel.builderhub.io$").test(tunnel.url),
      );

      const parsed = url.parse(tunnel.url);
      const opt = {
        host: parsed.host,
        port: 443,
        headers: { host: parsed.hostname || "localhost" },
        path: "/",
      };

      const req = https.request(opt, (res) => {
        res.setEncoding("utf8");
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          assert.strictEqual(body, "localhost");
          tunnel.close();
          done();
        });
      });

      req.end();
    });
  });
});

// describe("--local-host 127.0.0.1", () => {
//   const server = http.createServer();
//   beforeAll((done) => {
//     server.on("request", (req, res) => {
//       res.write(req.headers.host);
//       res.end();
//     });
//     server.listen(() => {
//       const { port } = server.address() as AddressInfo;
//       fakePort = port;
//       done();
//     });
//   });
//   afterAll((done) => {
//     server.close(done);
//   });
//   it("override Host header with local-host", (done) => {
//     localtunnel({
//       port: fakePort,
//       local_host: "127.0.0.1",
//     }).then((tunnel) => {
//       assert.ok(new RegExp("^https://.*localtunnel.me$").test(tunnel.url));

//       const parsed = url.parse(tunnel.url);
//       const opt = {
//         host: parsed.host,
//         port: 443,
//         headers: {
//           host: parsed.hostname || "localhost",
//         },
//         path: "/",
//       };

//       const req = https.request(opt, (res) => {
//         res.setEncoding("utf8");
//         let body = "";

//         res.on("data", (chunk) => {
//           body += chunk;
//         });

//         res.on("end", () => {
//           assert.strictEqual(body, "127.0.0.1");
//           tunnel.close();
//           done();
//         });
//       });

//       req.end();
//     });
//   });

//   it("send chunked request", (done) => {
//     localtunnel({
//       port: fakePort,
//       local_host: "127.0.0.1",
//     }).then((tunnel) => {
//       assert.ok(
//         new RegExp("^https://.*tunnel.builderhub.io$").test(tunnel.url),
//       );

//       const parsed = url.parse(tunnel.url);
//       const opt = {
//         host: parsed.host,
//         port: 443,
//         headers: {
//           host: parsed.hostname || "localhost",
//           "Transfer-Encoding": "chunked",
//         },
//         path: "/",
//       };

//       const req = https.request(opt, (res) => {
//         res.setEncoding("utf8");
//         let body = "";

//         res.on("data", (chunk) => {
//           body += chunk;
//         });

//         res.on("end", () => {
//           assert.strictEqual(body, "127.0.0.1");
//           tunnel.close();
//           done();
//         });
//       });

//       req.end(crypto.randomBytes(1024 * 8).toString("base64"));
//     });
//   });
// });
