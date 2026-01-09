import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tool } from "@/lib/tools";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export const ToolCard = ({ tool, index = 0 }: ToolCardProps) => {
  const Icon = tool.icon;
  
  return (
    <Link
      to={tool.path}
      className="tool-card group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
        tool.bgColor
      )}>
        <Icon className={cn("h-7 w-7", tool.color)} />
      </div>
      
      <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-accent transition-colors">
        {tool.name}
      </h3>
      
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {tool.description}
      </p>
      
      <div className="flex items-center text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Use Tool
        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
