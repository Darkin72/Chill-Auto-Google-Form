import { Card } from "antd";
import { motion } from "framer-motion";

const Feature = ({ Icon, title, desc }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Card
      variant="borderless"
      className="h-full rounded-[2rem] shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white/90 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md">
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{desc}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default Feature;
