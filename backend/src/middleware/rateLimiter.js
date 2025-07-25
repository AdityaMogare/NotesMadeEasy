import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  next();
};

export default rateLimiter;
