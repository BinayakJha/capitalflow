import { Database, MessageSquare, BarChart3 } from "lucide-react";

export default function FeaturesOverview() {
  const features = [
    {
      icon: <Database className="h-6 w-6" />,
      title: "Instant Data Structuring",
      description: "AI instantly transforms messy data into clean, structured tables without manual effort.",
      bgColor: "bg-blue-500"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Chat-Driven Editing",
      description: "Edit data through natural language. Just ask, and AI updates your table in real-time.",
      bgColor: "bg-violet-500"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Smart Visualizations",
      description: "Generate beautiful charts and graphs with a simple prompt. Let AI suggest the best visualizations.",
      bgColor: "bg-emerald-500"
    }
  ];

  return (
    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className={`flex items-center justify-center h-12 w-12 rounded-md ${feature.bgColor} text-white mb-5`}>
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
