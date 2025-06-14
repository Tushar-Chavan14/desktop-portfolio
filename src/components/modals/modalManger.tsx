import useModalStore from "@src/store/zustore/UseModalStore";
import { FC } from "react";



// Explicitly type the MODAL_COMPONENTS object
const MODAL_COMPONENTS: Record<string, FC<any>> = {

};

const ModalManager = () => {
  const { modalType, modalProps, closeModal } = useModalStore();

  if (!modalType) return null;

  const SpecificModal = MODAL_COMPONENTS[modalType];

  if (!SpecificModal) return null;

  return <SpecificModal isOpen onClose={closeModal} {...modalProps} />;
};

export default ModalManager;
