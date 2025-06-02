require("dotenv").config();
const axios = require("axios");
const {
  getFbUser,
  getFbPages,
  getAllFbPages,
  getIgId,
} = require("../services/facebookLeadService");

const loginSuccess = async function (req, res) {
  if (!req.user || !req.user.accessToken) {
    return res.status(401).send("User is not authenticated.");
  }
  console.log(req);
  const userAccessToken = req.user.accessToken;
  const userName = req.user.displayName;
  const userId = req.user.id;
  const saveUser = await getFbUser(userAccessToken, userName, userId);
  const pages = await getAllFbPages(userAccessToken);
  const savePage = await getFbPages(pages, saveUser);
  const getIgIds = await getIgId(pages);
  if (!pages || pages.length === 0) {
    return res
      .status(200)
      .send("Login successful, but no pages were found for this user.");
  }
  if (saveUser) {
    return res.status(200).json({
      message: `Welcome, ${userName}`,
    });
  }
};
const refreshPageList = async function (req, res) {
  const getUser = await getUserAccessToken();
  const pagesResponse = await axios.get(
    "https://graph.facebook.com/v22.0/me/accounts",
    {
      params: {
        access_token: getUser,
      },
    }
  );
  const pages = pagesResponse.data.data;
  const savePage = getFbPages(pages, saveUser);
};
const loginFailure = function (req, res) {
  res.send("Facebook login failed.");
};

module.exports = {
  loginSuccess,
  loginFailure,
  refreshPageList,
};
