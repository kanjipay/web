export const checkPlaidIp = (req, res, next) => {
  const plaidIps = [
    "52.21.26.131",
    "52.21.47.157",
    "52.41.247.19",
    "52.88.82.239",
  ];

  if (!plaidIps.includes(req.ip)) {
    console.log(`IP address ${req.ip} calling webhook but not a Plaid IP`);
  }

  next();
};
