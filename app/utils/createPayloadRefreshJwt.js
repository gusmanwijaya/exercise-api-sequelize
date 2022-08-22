const createPayloadRefreshJwt = (user) => {
  return {
    email: user?.email,
  };
};

module.exports = createPayloadRefreshJwt;
