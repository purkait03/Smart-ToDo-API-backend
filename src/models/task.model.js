import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
    type: String,
    default: ""
  },

    status: {
      type: Boolean,
      default: false
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);




export const Task = mongoose.model("Task", taskSchema)