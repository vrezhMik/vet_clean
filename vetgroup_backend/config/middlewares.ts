export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "connect-src": ["'self'", "https:", "http:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "https://market-assets.strapi.io",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
          "manifest-src": [
            "'self'",
            "https://apollo-server-landing-page.cdn.apollographql.com",
          ],
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: ["http://142.93.135.122:3000"], // Add your frontend's URL here
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, // Allow cookies (if needed)
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
