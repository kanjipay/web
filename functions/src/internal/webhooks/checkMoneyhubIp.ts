export const checkMoneyhubIp = (req, res, next) => {
  const moneyhubIps = [
    "63.35.8.241",
    "52.213.199.246",
    "63.34.208.80",
  ];

  const requestIp = req.headers["x-forwarded-for"]

  if (!moneyhubIps.includes(requestIp)) {
    console.log(`IP address ${requestIp} calling webhook but not a Moneyhub IP`);
    return res.sendStatus(401)
  }

  next()
};
