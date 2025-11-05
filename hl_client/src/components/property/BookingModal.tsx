import { motion } from "framer-motion";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  bookingForm: any;
  handleInputChange: any;
  handleSubmit: any;
  buttonText: string;
}

export default function BookingModal({ show, onClose, bookingForm, handleInputChange, handleSubmit, buttonText }: ModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-lg max-w-md w-full p-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold mb-4">Book a Visit</h3>
        <form onSubmit={handleSubmit}>
          {/* Form fields here - reuse your original */}
          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded mt-4">
            {buttonText}
          </button>
        </form>
      </motion.div>
    </div>
  );
}