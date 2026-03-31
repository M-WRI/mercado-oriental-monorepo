import { MdClose } from "react-icons/md";
import { Button } from "../../button/Button";
import "../styles/index.css";

export const ModalWrapper = ({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      style={{ animation: "modalBackdropIn 0.2s ease-out" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-xl relative min-w-[480px] max-w-[90vw]"
        style={{ animation: "modalContentIn 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h5 className="text-base font-semibold text-gray-900">{title}</h5>
          <Button onClick={onClose} style="ghost" icon={<MdClose size={20} />} />
        </div>
        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};
