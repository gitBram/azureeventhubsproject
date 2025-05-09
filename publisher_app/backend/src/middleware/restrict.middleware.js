/**
 * Middleware to restrict access based on the client's IP address.
 * 
 * This middleware checks if the incoming request's IP address is in the list
 * of allowed IPs. If the IP address is allowed, the request proceeds to the
 * next middleware or route handler. Otherwise, it responds with a 403 status
 * code and an "Access forbidden" message.
 * 
 * @param {Object} req - The Express request object.
 * @param {string} req.ip - The IP address of the client making the request.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 */
module.exports = (req, res, next) => {
    const allowedIps = ['127.0.0.1', '::1'];
    if (allowedIps.includes(req.ip)) {
        return next();
    }
    res.status(403).send('Access forbidden');
};