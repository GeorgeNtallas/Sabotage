import { AnimatePresence, motion } from "framer-motion";

const Animation = ({ show, children }) => (
  <AnimatePresence>
    {show && (
      <>
        {/* Static background */}
        <div className="fixed inset-0 bg-black/50 z-40" />

        {/* Animated modal content */}
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="bg-gray-700 rounded-lg w-50 max-w-md">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default Animation;
