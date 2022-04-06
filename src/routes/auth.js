const authControllers = require("../controllers/auth");
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/login", authControllers.loginUser);
router.post("/register", authControllers.registerUser);

router.get("/refresh-token", authorizedLoggedInUser, authControllers.keepLogin);
router.get("/verify/:token", authControllers.verifyUser);
router.get("/verify", authorizedLoggedInUser, authControllers.resendVerify);

module.exports = router;
