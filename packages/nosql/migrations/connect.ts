import mongoose from "mongoose";

import {
  GroupModel,
  PermissionModel,
  UserModel,
} from "@repo/nosql/schema/auth";
import { BmuModel } from "@repo/nosql/schema/bmu";

const getModels = async () => {
  await mongoose.connect(
    process.env.MIGRATE_MONGO_URI ?? "mongodb://localhost/my-db",
  );
  return {
    mongoose,
    UserModel,
    PermissionModel,
    GroupModel,
    BmuModel,
  };
};

export default getModels;
