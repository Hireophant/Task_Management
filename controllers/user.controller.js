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
      expireAt: Date.now() + timeExpire * 60 * 1000,
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

// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;
    const forgotPassword = await ForgotPassword.findOne({
      email: email,
      otp: otp,
    });
    if (!forgotPassword) {
      res.json({
        code: 400,
        message: "Mã OTP không hợp lệ",
      });
      return;
    }
    const user = await User.findOne({ email: email, deleted: false });
    const token = user.token;
    res.cookie("token", token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.json({
      code: 200,
      message: "Xác thực OTP thành công",
      token: token,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xác thực OTP thất bại",
    });
  }
};

// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  try {
    const token = req.body.token;
    const password = req.body.password;
    const user = await User.findOne({ token: token });
    if (md5(password) === user.password) {
      res.json({
        code: 400,
        message: "Vui lòng nhập mật khẩu mới khác mật khẩu cũ",
      });
      return;
    }
    await User.updateOne({ token: token }, { password: md5(password) });
    res.json({
      code: 200,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Đặt lại mật khẩu thất bại",
    });
  }
};

// [GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {
  try {
    const token = req.cookies.token;
    const user = await User.findOne({ token: token, deleted: false }).select(
      "-password",
    );
    res.json({
      code: 200,
      message: "Lấy thông tin tài khoản thành công",
      user: user,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lấy thông tin tài khoản thất bại",
    });
  }
};
