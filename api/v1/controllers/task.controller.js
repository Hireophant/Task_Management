const Task = require("../models/task.model");
const paginationHelper = require("../../../helper/pagination");
const searchHelper = require("../../../helper/search");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  const find = {
    $or: [{ createdBy: req.user._id }, { listUser: req.user._id }],
    deleted: false,
  };
  if (req.query.status) {
    find.status = req.query.status;
  }
  //pagination
  const countTask = await Task.countDocuments(find);
  let initPagination = {
    currentPage: 1,
    limitItems: 2,
  };
  const objectPagination = paginationHelper(
    initPagination,
    req.query,
    countTask,
  );
  //End pagination

  //search
  const objectSearch = searchHelper(req.query);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  //End search
  //Sort
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }
  //End sort
  const tasks = await Task.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
  res.json(tasks);
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const tasks = await Task.find({
      _id: id,
      deleted: false,
    });
    res.json(tasks);
  } catch (error) {
    res.json({ error: "Error" });
  }
};

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;
    await Task.updateOne({ _id: id }, { status: status });
    res.json({
      code: 200,
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật trạng thái thất bại",
    });
  }
};

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;
    switch (key) {
      case "status":
        await Task.updateMany({ _id: { $in: ids } }, { status: value });
        res.json({
          code: 200,
          message: "Cập nhật trạng thái thành công",
        });
        break;
      case "delete":
        await Task.updateMany(
          { _id: { $in: ids } },
          { deleted: true, deletedAt: new Date() },
        );
        res.json({
          code: 200,
          message: "Xóa công việc thành công",
        });
        break;
      default:
        res.json({
          code: 400,
          message: "Không tồn tại",
        });
        break;
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật trạng thái thất bại",
    });
  }
};

// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    const task = new Task(req.body);
    const data = await task.save();
    res.json({
      code: 200,
      message: "Thêm mới công việc thành công",
      data: data,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Thêm mới công việc thất bại",
    });
  }
};

// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.updateOne({ _id: id }, req.body);
    res.json({
      code: 200,
      message: "Cập nhật công việc thành công",
      data: task,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Cập nhật công việc thất bại",
    });
  }
};

// [DELETE] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    await Task.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
    res.json({
      code: 200,
      message: "Xóa công việc thành công",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Xóa công việc thất bại",
    });
  }
};
