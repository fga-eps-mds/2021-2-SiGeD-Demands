const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
  let token = req.headers['x-access-token'];
  // eslint-disable-next-line dot-notation
  const tokenQuery = req.query['token'];

  if (tokenQuery) {
    token = tokenQuery;
  }

  if (!token) {
    return res.status(401).json({ auth: false, message: 'No token was provided', errorCode: 401 });
  }

  return jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ auth: false, message: 'It was not possible to authenticate the token.' });
    }
    req.userId = decoded.id;
    next();
    return undefined;
  });
}

module.exports = { verifyJWT };
