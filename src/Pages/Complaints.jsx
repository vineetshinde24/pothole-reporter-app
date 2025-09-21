import { motion } from "framer-motion";

export default function Complaints() {
  return (
    <motion.div
      className="p-6"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <h2 className="text-2xl font-bold mb-4">Additional Complaints</h2>
      <form className="flex flex-col space-y-4">
        <textarea
          placeholder="Describe your issue..."
          className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </motion.div>
  );
}
