"use client";

import { useAtom } from 'jotai';

import type { DataType, Modal } from "@/store/modal";
import { modalStoreAtom, ModalEnum } from "@/store/modal";
import UserModal from "./user-modal";

export default function ModalSwitcher() {
  const [ modal ] = useAtom(modalStoreAtom)

  const type = (modal as Modal<ModalEnum>).type
  const data = (modal as Modal<ModalEnum>).data

  switch (type) {
    case ModalEnum.USER:
      return <UserModal data={data as DataType[ModalEnum.USER]} />;
    default:
      return null;
  }
}
