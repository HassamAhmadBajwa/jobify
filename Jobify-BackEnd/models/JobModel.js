import mongoose from "mongoose";
import { JOB_SORT_BY, JOB_STATUS, JOB_TYPE } from "../utils/constants.js";

//enum - data type represents a field with a predefined set of values
const JobSchema = new mongoose.Schema(
  {
    company: String,
    position: String,
    jobStatus: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.PENDING,
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPE),
      default: JOB_TYPE.FULL_TIME,
    },
    jobLocation: {
      type: "string",
      default: "city",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },

  { timestamps: true }
);

export default mongoose.model("job", JobSchema);
