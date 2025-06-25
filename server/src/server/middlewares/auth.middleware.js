const User = require("../../models/user");
const jwt = require("jsonwebtoken");

class AuthMiddleware {
  static async authenticateUser(req, res, next) {
    try {
      // const token = req.header("Authorization");
      console.log("Cookies:", req.cookies);
      
      const token = req.cookies.userToken;
      console.log("Token:", token);
      if (!token) {
        return res
          .status(401)
          .json({ msg: "No Token, authorization denied, Login again" });
      }
      console.log("user");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = await User.findById(decoded.user.id);

      if (!user) {
        return res.status(401).json({ msg: "Token is not valid" });
      }
      req.user = user;
      next();
    } catch (err) {
      console.error(err.message);
      return res.status(401).json({ msg: "Token is not valid" });
    }
  }
}

module.exports = AuthMiddleware;
