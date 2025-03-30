import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ReactNode, MouseEvent } from "react";
import { motion } from "framer-motion";

export interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  linkText: string;
  iconBgClass?: string;
  onLinkClick?: () => void;
}

export function ActionCard({
  title,
  description,
  icon,
  link,
  linkText,
  iconBgClass = "bg-primary-100",
  onLinkClick
}: ActionCardProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onLinkClick) {
      e.preventDefault();
      onLinkClick();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-5">
          <div className="flex items-center">
            <motion.div 
              className={`flex-shrink-0 ${iconBgClass} rounded-md p-3`}
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd>
                  <div className="text-sm text-gray-900">{description}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link
              href={link}
              onClick={handleClick}
              className="font-medium text-primary hover:text-primary/90"
            >
              {linkText}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
