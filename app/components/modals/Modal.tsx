import { LuX } from "react-icons/lu";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <div
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/90 transition-all duration-700"
      ></div>

      {/* modal content */}
      <div
        className={`relative bg-gray-900 shadow-lg max-w-lg w-full mx-4 p-6 py-12 z-10 rounded-2xl border border-gray-600 transition-all duration-300 ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-white focus:outline-none"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <LuX size={22} />
        </button>
        {children}
      </div>
    </div>
  );
}
