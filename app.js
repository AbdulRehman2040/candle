/* Startup file for cPanel "Setup Node.js App" (Phusion Passenger).
 *
 * Passenger runs this file directly, so it uses plain CommonJS and is not
 * compiled by Next.js. Run `npm run build` before (re)starting the app —
 * this file serves the built .next folder.
 *
 * Runs in production unless NODE_ENV is explicitly "development", because
 * Passenger does not always set NODE_ENV. */

const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV === "development";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(
        `> Fondue Flame ready on port ${port} (${dev ? "development" : "production"})`
      );
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });
