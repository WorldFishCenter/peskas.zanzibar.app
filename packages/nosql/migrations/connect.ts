import mongoose from "mongoose";

import {
  GroupModel,
  PermissionModel,
  UserModel,
} from "@repo/nosql/schema/auth";

const getModels = async () => {
  await mongoose.connect(
    process.env.MIGRATE_MONGO_URI ?? "mongodb://localhost/my-db",
  );
  return {
    mongoose,
    UserModel,
    PermissionModel,
    GroupModel,
  };
};

export default getModels;
