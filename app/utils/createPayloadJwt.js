const createPayloadJwt = (user) => {
  return {
    id: user?.id,
    name: user?.name,
    email: user?.email,
    roles: user?.roles,
    address: user?.address,
    houseNumber: user?.houseNumber,
    phoneNumber: user?.phoneNumber,
    city: user?.city,
    picturePath: user?.picturePath,
  };
};

module.exports = createPayloadJwt;
