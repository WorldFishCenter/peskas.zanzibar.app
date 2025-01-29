"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from 'jotai';

import { Z_INDEX } from "@utils/common/constants";
import cn from "@utils/class-names";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@ui/form2";
import { Input } from "@ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { toast } from "@ui/toast";
import { UpsertUserSchema } from "@/validators/user.schema";

import type { DataType } from "@/store/modal";

import { api } from "@/trpc/react";
import { modalStoreAtom, ModalEnum } from "@/store/modal";

export default function UserModal({
  data,
}: {
  data?: DataType[ModalEnum.USER];
}) {
  const utils = api.useUtils();
  const { data: user } = data?.id 
    ? api.user.byId.useQuery({ id: data.id })
    : { data: null }
  const router = useRouter();
  const [ , setModal ] = useAtom(modalStoreAtom)

  const form = useForm({
    schema: UpsertUserSchema,
    defaultValues: {
      _id: user?._id?.toString() ?? undefined,
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "",
      status: user?.status ?? "active",
    },
  });

  useEffect(() => {
    form.reset({
      _id: user?._id?.toString() ?? undefined,
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "",
      status: user?.status ?? "active",
    });
  }, [form, user]);

  const upsertUser = api.user.upsert.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      setModal({
        open: false,
        type: '',
      })
      toast.success("Successfully updated user");
      router.refresh();
    },
    onError: (err) => {
      toast.error(
        err?.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to update users"
          : "Failed to update user",
      );
    },
  });

  return (
    <Dialog open={true} onOpenChange={() => setModal({
      open: false,
      type: '',
    })}>
      <DialogContent
        style={{ zIndex: Z_INDEX.HOW_TO_JOIN_MODAL }}
        className={cn(`max-w-[90%] rounded-lg bg-muted lg:max-w-[400px]`)}
      >
        <DialogHeader>
          <DialogTitle className="text-center">{user ? 'Edit User' : 'Add User'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              (data) => {
                upsertUser.mutate(data);
              },
              (error) => {
                toast.error("Failed to update user");
                console.log(error);
              },
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID</FormLabel>
                  <FormControl>
                    <Input placeholder="ID" disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Control">Control</SelectItem>
                      <SelectItem value="IIA">IIA</SelectItem>
                      <SelectItem value="CIA">CIA</SelectItem>
                      <SelectItem value="WBCIA">WBCIA</SelectItem>
                      <SelectItem value="AIA">AIA</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModal({
                  open: false,
                  type: '',
                })}
                className="w-full"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
