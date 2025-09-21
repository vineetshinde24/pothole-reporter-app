import { motion } from "framer-motion";

export default function Status() {
  return (
    <motion.div
      className="p-6"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <h2 className="text-2xl font-bold mb-4">Status Check</h2>
      <p className="text-gray-700">Track the current status of your complaints.</p>
    </motion.div>
  );
}
