import { motion } from "framer-motion";

const Step = ({ index, title, desc, Icon }) => (
  <motion.div
    className="relative"
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
  >
    <div className="flex items-start gap-4 p-5 rounded-3xl bg-white/90 shadow-md hover:shadow-xl transition-shadow">
      <div className="flex-none p-3 rounded-2xl bg-blue-600 text-white">
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-purple-600 rounded-full">
            {index}
          </span>
          <h4 className="text-base font-semibold text-gray-800">{title}</h4>
        </div>
        <p className="mt-1 text-gray-600 text-sm">{desc}</p>
      </div>
    </div>
  </motion.div>
);

export default Step;
