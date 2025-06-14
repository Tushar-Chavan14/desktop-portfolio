import { create } from "zustand";

interface ModalStoreState {
  modalType: string;
  modalProps: Record<string, any>;
  openModal: (type: string, props?: Record<string, any>) => void;
  closeModal: () => void;
}

const useModalStore = create<ModalStoreState>((set) => ({
  modalType: "",
  modalProps: {},
  openModal: (type, props = {}) => {
    set({ modalType: type, modalProps: props });
  },
  closeModal: () => set({ modalType: "", modalProps: {} }),
}));

export default useModalStore;
