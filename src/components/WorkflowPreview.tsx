import { ArrowRight, Workflow as WorkflowIcon, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const workflowSteps = [
  { name: "Compress", color: "bg-tool-compress" },
  { name: "Watermark", color: "bg-tool-secure" },
  { name: "Convert", color: "bg-tool-pdf-word" },
];

export const WorkflowPreview = () => {
  return (
    <section className="py-16 lg:py-24 gradient-subtle">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-tool-workflow/10 text-tool-workflow rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Custom Workflows</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Automate Your PDF Tasks with Custom Workflows
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Chain multiple PDF operations together. Compress, watermark, convert, 
              and secure – all in one automated flow. Save your workflows and reuse 
              them anytime.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">1</span>
                </div>
                <span className="text-foreground">Drag & drop to add steps</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">2</span>
                </div>
                <span className="text-foreground">Configure each step</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">3</span>
                </div>
                <span className="text-foreground">Run & download result</span>
              </div>
            </div>
            
            <Button variant="hero" size="lg" asChild>
              <Link to="/workflow">
                <WorkflowIcon className="h-5 w-5" />
                Create Your Workflow
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <div className="bg-card rounded-3xl p-8 shadow-hover">
              <div className="flex items-center gap-3 mb-6">
                <WorkflowIcon className="h-6 w-6 text-tool-workflow" />
                <h3 className="font-semibold text-lg">Example Workflow</h3>
              </div>
              
              <div className="space-y-4">
                {workflowSteps.map((step, index) => (
                  <div key={step.name} className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-semibold",
                      step.color
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 workflow-step">
                      <span className="font-medium">{step.name} PDF</span>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
                
                <button className="w-full border-2 border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors">
                  <Plus className="h-5 w-5" />
                  Add Step
                </button>
              </div>
            </div>
            
            {/* Floating decoration */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/10 rounded-2xl -rotate-12 animate-float" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/10 rounded-2xl rotate-12 animate-float" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </div>
    </section>
  );
};
