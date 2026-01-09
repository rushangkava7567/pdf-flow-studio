import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Lock, Eye, Server, Clock, Trash2, Globe, FileCheck } from "lucide-react";

const privacyPoints = [
  {
    icon: Clock,
    title: "Automatic File Deletion",
    description: "All uploaded files are automatically and permanently deleted from our servers after 2 hours. We don't keep any copies of your documents.",
  },
  {
    icon: Lock,
    title: "Encrypted Transfers",
    description: "All file uploads and downloads are protected with TLS 1.3 encryption, ensuring your files are secure during transfer.",
  },
  {
    icon: Eye,
    title: "No Human Access",
    description: "Your files are processed by automated systems only. No employee or third party can access your documents.",
  },
  {
    icon: Server,
    title: "Isolated Processing",
    description: "Each file is processed in an isolated environment, preventing any possibility of cross-contamination between users' files.",
  },
  {
    icon: Globe,
    title: "GDPR Compliant",
    description: "We fully comply with GDPR and other international data protection regulations. Your data rights are our priority.",
  },
  {
    icon: Trash2,
    title: "Manual Delete Option",
    description: "Don't want to wait? You can manually delete your files immediately after downloading using the delete button.",
  },
  {
    icon: FileCheck,
    title: "No Data Collection",
    description: "We don't analyze, read, or collect any information from your uploaded files. Your content remains completely private.",
  },
  {
    icon: Shield,
    title: "No Account Required",
    description: "Use all basic features without creating an account. We don't require personal information for file conversions.",
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-subtle py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Privacy & Security
              </h1>
              <p className="text-lg text-muted-foreground">
                Your privacy is our top priority. Learn how we protect your files and data 
                with enterprise-grade security measures.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Points */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {privacyPoints.map((point) => (
                <div 
                  key={point.title}
                  className="bg-card rounded-2xl p-6 shadow-card hover:shadow-hover transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <point.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-16 lg:py-24 gradient-subtle">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Commitment to You</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="mb-4">
                  At PDFFlow, we believe that privacy is a fundamental right. We've built our 
                  platform from the ground up with security and privacy as core principles, 
                  not afterthoughts.
                </p>
                <p className="mb-4">
                  We will never sell, share, or monetize your data. We don't use tracking 
                  cookies for advertising, and we don't profile our users. Our business model 
                  is simple: provide great tools that people want to use.
                </p>
                <p>
                  If you have any questions about our privacy practices or security measures, 
                  please don't hesitate to contact us. We're always happy to provide more 
                  information about how we protect your data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
