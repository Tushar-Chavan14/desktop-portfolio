import { FC } from "react";
import { CommonModal, CommonModalProps } from "./commanModal";
import useBackgroundStore from "@src/store/zustore/useBackgroundStore";
import BackgroundGrid from "../backgroundGrid/bgGrid";

const ChangeBackgroundModal: FC<
  Omit<CommonModalProps, "children"> & {
    modalData?: any;
  }
> = ({ isOpen = false, onClose = () => {}, ...props }) => {
  const { selectedBackground, currentBackground, applySelectedBackground } =
    useBackgroundStore();

  const handleApplyChanges = () => {
    applySelectedBackground();
    onClose();
  };

  const isChangesPending = selectedBackground !== currentBackground;

  return (
    <CommonModal
      isOpen={isOpen}
      variant="normal"
      title="Change background"
      onClose={onClose}
      onMinimize={() => console.log("Normal modal minimized")}
      showFooter
      footerButtons={[
        {
          label: "Cancel",
          onPress: onClose,
          variant: "outline",
        },
        {
          label: "Apply Changes",
          onPress: handleApplyChanges,
          variant: "primary",
          isDisabled: !isChangesPending,
        },
      ]}
      {...props}
    >
      <BackgroundGrid />
    </CommonModal>
  );
};

export default ChangeBackgroundModal;
