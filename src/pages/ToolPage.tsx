import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { getToolById, tools } from "@/lib/tools";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCard } from "@/components/ToolCard";

const ToolPage = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = getToolById(toolId || "");

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = tool.icon;
  const relatedTools = tools.filter(t => t.id !== tool.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Tool Header */}
        <section className="gradient-subtle py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Tools
            </Link>
            
            <div className="max-w-3xl mx-auto text-center">
              <div className={cn(
                "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6",
                tool.bgColor
              )}>
                <Icon className={cn("h-10 w-10", tool.color)} />
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {tool.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                {tool.description}
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-tool-secure">
                <CheckCircle className="h-4 w-4" />
                100% Free • No Signup Required
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <FileUploader acceptedFiles={tool.acceptedFiles} />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 lg:py-16 gradient-subtle">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: 1, title: "Upload", desc: "Drag & drop or select your file" },
                  { step: 2, title: "Process", desc: "We convert your file instantly" },
                  { step: 3, title: "Download", desc: "Get your converted file" },
                ].map((item, index) => (
                  <div key={item.step} className="text-center">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                      <span className="text-lg font-bold text-primary-foreground">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    {index < 2 && (
                      <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-12 lg:py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-10">Related Tools</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {relatedTools.map((relatedTool, index) => (
                <ToolCard key={relatedTool.id} tool={relatedTool} index={index} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ToolPage;
