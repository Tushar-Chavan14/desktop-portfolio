export const Modal = ({
  shouldShow,
  onRequestClose,
  children,
}: {
  shouldShow: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}) => {
  return shouldShow ? (
    <div
      className="fixed inset-0 flex items-center justify-center z-[1] h-full w-full bg-gradient-radial from-transparent to-black/65 overflow-auto"
      //   onClick={onRequestClose}
    >
      <div
        className="w-96 p-5 bg-black rounded-lg"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  ) : null;
};
