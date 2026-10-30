import fp from "fastify-plugin";
import fastifyStatic from "@fastify/static";
import { join } from "path";

export default fp(async (fastify) => {
  await fastify.register(fastifyStatic, {
    root: join(process.cwd(), "public"),
    prefix: "/public/",
    // @fastify/static 10 passes the Fastify reply (.header); older versions
    // passed the raw response (.setHeader). Calling .setHeader on a reply
    // threw inside the worker and reset every /public/* request.
    setHeaders: (res, pathname) => {
      const set = (name, value) =>
        typeof res.header === "function" ? res.header(name, value) : res.setHeader(name, value);
      set("Access-Control-Allow-Origin", "*");
      set("Cross-Origin-Resource-Policy", "cross-origin");
      set("Accept-Ranges", "bytes");
      set(
        "Access-Control-Expose-Headers",
        "Content-Range, Accept-Ranges"
      );
    },
  });
});
