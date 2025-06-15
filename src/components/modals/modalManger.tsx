"use client";
import useModalStore from "@src/store/zustore/UseModalStore";
import React, { FC, useState } from "react";
import ChangeBackgroundModal from "./changeBackgroundModal";

// Explicitly type the MODAL_COMPONENTS object
const MODAL_COMPONENTS: Record<string, FC<any>> = {
  CHANGE_BACKGROUND: ChangeBackgroundModal,
};

const ModalManager = () => {
  const { modalType, modalProps, closeModal } = useModalStore();
  if (!modalType) return null;

  const SpecificModal = MODAL_COMPONENTS[modalType];

  if (!SpecificModal) return null;

  return (
    <SpecificModal
      isOpen
      onClose={closeModal}
      {...modalProps}
    />
  );
};

export default ModalManager;
