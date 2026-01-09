import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { tools, Tool } from "@/lib/tools";
import { 
  Plus, 
  X, 
  GripVertical, 
  Play, 
  Save, 
  Trash2,
  ArrowRight,
  ChevronDown,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface WorkflowStep {
  id: string;
  tool: Tool;
  config: Record<string, string>;
}

const availableTools = tools.filter(t => t.id !== "workflow");

const WorkflowBuilder = () => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [showToolPicker, setShowToolPicker] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const addStep = (tool: Tool) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      tool,
      config: {},
    };
    setSteps([...steps, newStep]);
    setShowToolPicker(false);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...steps];
    const [removed] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, removed);
    setSteps(newSteps);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Header */}
        <section className="gradient-subtle py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Workflow Builder
              </h1>
              <p className="text-lg text-muted-foreground">
                Chain multiple PDF operations together. Create your custom automation flow.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Workflow Steps */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-sm text-primary-foreground font-bold">
                      1
                    </span>
                    Upload Your Files
                  </h2>
                  <FileUploader 
                    onFilesChange={setFiles}
                    maxFiles={10}
                  />
                </div>

                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-sm text-primary-foreground font-bold">
                      2
                    </span>
                    Build Your Workflow
                  </h2>

                  {steps.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground mb-4">
                        No steps added yet. Add your first step to get started.
                      </p>
                      <Button 
                        variant="accent"
                        onClick={() => setShowToolPicker(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add First Step
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {steps.map((step, index) => {
                        const Icon = step.tool.icon;
                        return (
                          <div key={step.id}>
                            <Collapsible
                              open={expandedStep === step.id}
                              onOpenChange={(open) => setExpandedStep(open ? step.id : null)}
                            >
                              <div className="workflow-step">
                                <div className="flex items-center gap-3">
                                  <button className="cursor-grab text-muted-foreground hover:text-foreground">
                                    <GripVertical className="h-5 w-5" />
                                  </button>
                                  
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    step.tool.bgColor
                                  )}>
                                    <Icon className={cn("h-5 w-5", step.tool.color)} />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <p className="font-medium">{step.tool.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Step {index + 1}
                                    </p>
                                  </div>
                                  
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </CollapsibleTrigger>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeStep(step.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <CollapsibleContent className="mt-4 pt-4 border-t border-border">
                                  <p className="text-sm text-muted-foreground">
                                    Configuration options for {step.tool.name} will appear here.
                                  </p>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                            
                            {index < steps.length - 1 && (
                              <div className="flex justify-center py-2">
                                <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowToolPicker(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Step
                      </Button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {steps.length > 0 && (
                  <div className="flex gap-4">
                    <Button variant="hero" size="lg" className="flex-1" disabled={files.length === 0}>
                      <Play className="h-5 w-5" />
                      Run Workflow
                    </Button>
                    <Button variant="outline" size="lg">
                      <Save className="h-5 w-5" />
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      onClick={() => setSteps([])}
                      className="text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Tool Picker Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
                  <h3 className="font-semibold text-lg mb-4">Available Tools</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Click a tool to add it to your workflow
                  </p>
                  
                  <div className="space-y-3">
                    {availableTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => addStep(tool)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border border-border",
                            "hover:border-accent hover:bg-accent/5 transition-all duration-200",
                            "text-left"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            tool.bgColor
                          )}>
                            <Icon className={cn("h-5 w-5", tool.color)} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tool.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {tool.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WorkflowBuilder;
