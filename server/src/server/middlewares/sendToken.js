const sendEmail = require('../../utils/transport');

const sendMail = async (req, res, next) => {
  console.log(req.user);
  console.log(req.pass);
  const user = req.user;
  try {
    const message = `Your login details are username: ${user}, Temporary Password: ${req.pass}`;
    await sendEmail(user.Email, 'welcome on Board', message);
    return res
      .status(201)
      .json({ message: 'please check your mail for your login details' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = sendMail;