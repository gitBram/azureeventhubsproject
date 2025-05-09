module.exports = (req, res, next) => {
    const allowedIps = ['127.0.0.1', '::1'];
    if (allowedIps.includes(req.ip)) {
        return next();
    }
    res.status(403).send('Access forbidden');
};