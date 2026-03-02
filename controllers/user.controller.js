const md5 = require("md5");
const User = require("../models/user.model");
const generateHelper = require("../helper/generate");
const sendMailHelper = require("../helper/sendMail");
const ForgotPassword = require("../models/forgot-password.model");

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

// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email, deleted: false });
    if (!user) {
      res.json({
        code: 400,
        message: "Email không tồn tại",
      });
      return;
    }
    const otp = generateHelper.generateRandomNumber(8);
    const timeExpire = 5;
    const objectForgotPassword = {
      email: email,
      otp: otp,
      expireAt: Date.now() + timeExpire * 60,
    };
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    //Gửi OTP qua email
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
    <h2>Mã OTP xác minh lấy lại mật khẩu</h2>
    <p>Mã OTP của bạn là: <b>${objectForgotPassword.otp}</b></p>
    <p>Mã OTP sẽ hết hạn sau ${timeExpire} phút</p>
    <p>Nếu bạn không yêu cầu mã OTP, vui lòng bỏ qua email này</p>
    <p>Lưu ý: Không chia sẻ mã OTP với bất kỳ ai</p>
  `;
    sendMailHelper.sendMail(email, subject, html);
    res.json({
      code: 200,
      message: "Đã gửi mã OTP qua email",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Quên mật khẩu thất bại",
    });
  }
};
