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
      message: "Tạo tài khoản thành công",
      token: token,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Tạo tài khoản thất bại",
    });
  }
};

// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      email: req.body.email,
      deleted: false,
    });
    if (!existingUser) {
      res.json({
        code: 400,
        message: "Email không tồn tại",
      });
      return;
    }
    req.body.password = md5(req.body.password);
    if (existingUser.password !== req.body.password) {
      res.json({
        code: 400,
        message: "Sai mật khẩu",
      });
      return;
    }
    const token = existingUser.token;
    res.cookie("token", token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.json({
      code: 200,
      message: "Đăng nhập thành công",
      token: token,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Đăng nhập thất bại",
    });
  }
};
