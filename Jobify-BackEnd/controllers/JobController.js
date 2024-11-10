import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../error/customError.js";
import mongoose from "mongoose";
import day from "dayjs";
// get all jobs
export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query;

  const queryObj = {
    createdBy: req.user.userId,
  };
  if (search) {
    queryObj.$or = [
      { position: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }
  if (jobStatus && jobStatus !== "all") {
    queryObj.jobStatus = jobStatus;
  }
  if (jobType && jobType !== "all") {
    queryObj.jobType = jobType;
  }
  const sortOption = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "position",
    "z-a": "-position",
  };
  const sortKey = sortOption[sort] || sortOption.newest;

  //pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalJobs = await Job.countDocuments(queryObj);
  const numberOfPages = Math.ceil(totalJobs / limit);
  const job = await Job.find(queryObj).sort(sortKey).skip(skip).limit(limit);
  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numberOfPages, currentPage: page, job });
};
// create job
export const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};
// get single job
export const getSingleJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.status(StatusCodes.OK).json({ job });
};
// update job
export const updateJob = async (req, res) => {
  const updateJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    // by default it is not going to send you to the updated job, it can send the old job
    // before updated so we dont want the old job that why we use the new equal to true
    new: true,
  });
  res.status(StatusCodes.OK).json({ msg: "job modified", job: updateJob });
};
// delete job
export const deleteJob = async (req, res) => {
  const removeJob = await Job.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ msg: "job deleted", job: removeJob });
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
  ]);
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };
  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format("MMM YY");
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
