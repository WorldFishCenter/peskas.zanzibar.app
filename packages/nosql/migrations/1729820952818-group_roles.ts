import find from "lodash/find";
import mongoose from "mongoose";

import getModels from "./connect";

export async function up (): Promise<void> {
  const { UserModel, PermissionModel, GroupModel } = await getModels();

  const users = await UserModel.create([
    {
      name: "test+control",
      email: "test+control@mountaindev.com",
      password: "$2a$10$KSPht5iRaWqfWrdwQGQeBeGs9/qk2v0XBjqvldWGP7bKYE8TWPmAu",
    },
    {
      name: "test+iia",
      email: "test+iia@mountaindev.com",
      password: "$2a$10$KSPht5iRaWqfWrdwQGQeBeGs9/qk2v0XBjqvldWGP7bKYE8TWPmAu",
    },
    {
      name: "test+cia",
      email: "test+cia@mountaindev.com",
      password: "$2a$10$KSPht5iRaWqfWrdwQGQeBeGs9/qk2v0XBjqvldWGP7bKYE8TWPmAu",
    },
    {
      name: "test+wbcia",
      email: "test+wbcia@mountaindev.com",
      password: "$2a$10$KSPht5iRaWqfWrdwQGQeBeGs9/qk2v0XBjqvldWGP7bKYE8TWPmAu",
    },
    {
      name: "test+aia",
      email: "test+aia@mountaindev.com",
      password: "$2a$10$KSPht5iRaWqfWrdwQGQeBeGs9/qk2v0XBjqvldWGP7bKYE8TWPmAu",
    },
  ]);

  const groups = GroupModel.find()
  const perms = PermissionModel.find()
  
  users.map((user: typeof UserModel) => {

    console.log('TONTEST', user)
    // await PermissionModel.findByIdAndUpdate(user?._id, {
    //   group_id: user?._id,
    // });  

  })

  console.log('TONTEST', users)

}

export async function down (): Promise<void> {
  const { UserModel, PermissionModel, GroupModel } = await getModels();
  await UserModel.deleteMany({email: { $in: [
    'test+control@mountaindev.com',
    'test+iia@mountaindev.com',
    'test+cia@mountaindev.com',
    'test+wbcia@mountaindev.com',
    'test+aia@mountaindev.com',
  ]}});
}
