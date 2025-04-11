import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.192.0/http/file_server.ts";

const handler = async (request: Request): Promise<Response> => {
  // Create a URL object from the request so you can work with the pathname.
  const url = new URL(request.url);
  
  // Note: If you need client-side routing (e.g. with React Router),
  // you may have to add some fallback logic. For simple static serving,
  // serveDir will try to locate the file.
  return serveDir(request, {
    fsRoot: "./front-end/dist", // Folder that contains your static assets.
    urlRoot: "",      // Base URL path (empty means root).
    index: "index.html", // Serve index.html for root or missing paths.
  });
};

console.log("Server running on http://localhost:8000");
serve(handler, { port: 8000 });
