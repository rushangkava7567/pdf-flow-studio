import { Shield, Lock, Eye, Server, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All file transfers are encrypted using TLS 1.3",
  },
  {
    icon: Server,
    title: "Secure Processing",
    description: "Files are processed on isolated servers",
  },
  {
    icon: Clock,
    title: "Auto-Delete",
    description: "Files are automatically deleted after 2 hours",
  },
  {
    icon: Eye,
    title: "No Access",
    description: "We never read or access your file contents",
  },
  {
    icon: Trash2,
    title: "Manual Delete",
    description: "Delete your files anytime with one click",
  },
  {
    icon: Shield,
    title: "GDPR Compliant",
    description: "Full compliance with data protection regulations",
  },
];

export const SecuritySection = () => {
  return (
    <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Your Privacy Matters</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Enterprise-Grade Security
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            Your files are protected with the same security standards used by 
            Fortune 500 companies. We never store or access your documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "bg-primary-foreground/5 rounded-2xl p-6 border border-primary-foreground/10",
                "hover:bg-primary-foreground/10 transition-colors duration-300"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-primary-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
