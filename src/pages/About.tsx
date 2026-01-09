import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  Users, 
  Zap, 
  Heart, 
  Mail, 
  MessageCircle,
  ArrowRight
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Simplicity First",
    description: "We believe powerful tools should be easy to use. No complicated interfaces, no learning curves.",
  },
  {
    icon: Users,
    title: "Free for Everyone",
    description: "PDF tools should be accessible to all. That's why we offer all our core features completely free.",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    description: "Time is valuable. Our tools are optimized for speed, processing your files in seconds.",
  },
  {
    icon: Heart,
    title: "Privacy Focused",
    description: "Your files are yours. We never access, analyze, or store your documents longer than needed.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-subtle py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About PDFFlow
              </h1>
              <p className="text-lg text-muted-foreground">
                We're on a mission to make PDF tools accessible to everyone. 
                No complexity, no cost barriers – just simple, powerful tools that work.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p>
                  PDFFlow was born out of frustration. We were tired of PDF tools that 
                  required expensive subscriptions, complex software installations, or 
                  that compromised our privacy by uploading files to unknown servers.
                </p>
                <p>
                  We decided to build something different – a collection of PDF tools that 
                  are completely free, incredibly fast, and respect your privacy. No signup 
                  required for basic conversions, no hidden fees, no catches.
                </p>
                <p>
                  Today, thousands of people use PDFFlow every day to convert, merge, split, 
                  compress, and secure their PDF documents. And we're just getting started.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 lg:py-24 gradient-subtle">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {values.map((value) => (
                <div 
                  key={value.title}
                  className="bg-card rounded-2xl p-6 shadow-card text-center"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Have questions, feedback, or just want to say hello? 
                We'd love to hear from you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="hero" size="lg">
                  <Mail className="h-5 w-5" />
                  Contact Us
                </Button>
                <Button variant="outline" size="lg">
                  <MessageCircle className="h-5 w-5" />
                  Join Community
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-primary-foreground/70 mb-8">
                Join thousands of users who trust PDFFlow for their PDF needs.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                asChild
              >
                <Link to="/">
                  Start Converting
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
