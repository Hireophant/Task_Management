const Task = require("../models/task.model");
const paginationHelper = require("../helper/pagination");
const searchHelper = require("../helper/search");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  const find = { deleted: false };
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
