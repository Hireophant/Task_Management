const md5 = require("md5");
const User = require("../models/user.model");

// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      res.json({
        code: 400,
        message: "Email đã tồn tại",
      });
      return;
    }
    req.body.password = md5(req.body.password);
    const user = new User(req.body);
    await user.save();
    const token = user.token;
    res.cookie("token", token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.json({
      code: 200,
      message: "Thêm mới công việc thành công",
      token: token,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thêm mới công việc thất bại",
    });
  }
};
