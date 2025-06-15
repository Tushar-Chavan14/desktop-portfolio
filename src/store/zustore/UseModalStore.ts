import { CommonModalProps } from "@src/components/modals/commanModal";
import { create } from "zustand";

type ModalManagerProps = Omit<CommonModalProps, "children"> & {
  modalData?: any;
};

interface ModalStoreState {
  modalType: string;
  modalProps: ModalManagerProps;
  openModal: (type: string, props?: ModalManagerProps) => void;
  closeModal: () => void;
}

const useModalStore = create<ModalStoreState>((set) => ({
  modalType: "",
  modalProps: {} as ModalManagerProps,
  openModal: (type, props) => {
    set({ modalType: type, modalProps: props });
  },
  closeModal: () => set({ modalType: "", modalProps: {} }),
}));

export default useModalStore;
