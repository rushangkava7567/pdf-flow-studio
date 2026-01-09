import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/lib/tools";

export const ToolsGrid = () => {
  return (
    <section id="tools" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            All the PDF Tools You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From simple conversions to complex workflows, we've got you covered. 
            All tools are 100% free with no limits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
