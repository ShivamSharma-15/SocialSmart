// app.js
const express = require("express");
const cors = require("cors");
const sessionMiddleware = require("./middleware/session");
const { enforceHttps } = require("./middleware/httpsMandate.js");
const { limiter } = require("./middleware/limiter");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  })
);
app.set("trust proxy", 1);
// app.use(enforceHttps);
app.use(sessionMiddleware);

const metaWebhookRoute = require("./routes/metaRoute.js");
// const leadViewRoute = require("./routes/leadViewRoute.js");
const normalRoutes = require("./routes/normalRoutes.js");
// const onboardingRoutes = require("./routes/onboardingRoutes.js");
// const redirectRoute = require("./routes/redirectRoute.js");
// const externalLeadRoute = require("./routes/externalLeadRoute.js");
app.use("/meta/social-smart", metaWebhookRoute);
app.use("/apps/social-smart", normalRoutes);
// app.use("/apps/leadsmart/leads-view", leadViewRoute);
// app.use("/apps/leadsmart/onboarding", onboardingRoutes);
// app.use("/app/leadsmart/redirect", redirectRoute);
// app.use("/app/leadsmart/website-form", externalLeadRoute);
const path = require("path");
app.use(
  express.static(path.join(__dirname, "..", "..", "frontend", "landing"))
);
app.use(express.static(path.join(__dirname, "..", "..", "frontend", "leads")));
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on 0.0.0.0:3000");
});
