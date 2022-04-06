const authControllers = require("../controllers/auth");
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/login", authControllers.loginUser);
router.post("/register", authControllers.registerUser);

router.get("/refresh-token", authorizedLoggedInUser, authControllers.keepLogin);
router.get("/verify/:token", authControllers.verifyUser);
router.get("/verify", authorizedLoggedInUser, authControllers.resendVerify);

router.post("/v2/register", authControllers.registerUserV2);
router.get("/v2/verify/:token", authControllers.verifyUserV2);
router.get("/verify", authorizedLoggedInUser, authControllers.resendVerifyV2);

module.exports = router;
