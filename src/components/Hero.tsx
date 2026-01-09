import { FileUploader } from "@/components/FileUploader";
import { Shield, Zap, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Files auto-deleted after 2 hours",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Convert files in seconds",
  },
  {
    icon: Clock,
    title: "No Signup Required",
    description: "Start converting instantly",
  },
];

export const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-subtle">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 relative">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="text-sm font-medium">100% Free • No Signup Required</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight animate-fade-in">
            Convert, Secure & Automate
            <br />
            <span className="text-gradient">PDFs with Ease</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in">
            The most powerful free PDF toolkit. Convert, merge, split, compress, and secure your documents in seconds.
          </p>
        </div>

        {/* File Uploader */}
        <div className="max-w-2xl mx-auto mb-16 animate-fade-in">
          <FileUploader />
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 bg-card rounded-2xl px-6 py-4 shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
