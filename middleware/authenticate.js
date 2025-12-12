// Minimal: checks for accessToken in cookie or authorization header
module.exports = async (req, res, next) => {

    const token = req.cookies?.accessToken || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    req.accessToken = token;
    next();

};
