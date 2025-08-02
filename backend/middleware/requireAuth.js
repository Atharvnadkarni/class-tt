const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher")
const requireAuth = async (req, res, next) => {
  // verify authentication
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  const token = authorization.split(" ")[1];
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await Teacher.findOne({_id}).select('_id')
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({error: "Token expired"})
    }
    console.error(JSON.stringify(error));
    res.status(401).json({ error: "Request is not authorized" });
  }
};
module.exports = requireAuth
