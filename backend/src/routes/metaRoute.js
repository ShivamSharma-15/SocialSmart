const express = require("express");
const router = express.Router();
const passport = require("../middleware/passportFacebook");
const controller = require("../controllers/metaController");
const path = require("path");
const { limiter } = require("../middleware/limiter");
router.use(passport.initialize());
router.use(passport.session());
router.get("/oauth", passport.authenticate("facebook"));
router.get(
  "/oauth/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/meta/social-smart/oauth/failure",
    successRedirect: "/meta/social-smart/oauth/success",
  })
);

// Handlers
router.get("/oauth/success", controller.loginSuccess);
router.get("/oauth/failure", controller.loginFailure);
module.exports = router;
