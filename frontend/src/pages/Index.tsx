import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Building2, Calculator, FileCheck, TrendingUp, CheckCircle2, Mail, MessageCircle, ShieldCheck, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';

const stats = [
  { value: '10+', label: 'Partner Lenders' },
  { value: '₦10M+', label: 'Loan Options Available' },
  { value: '100%', label: 'Free to Apply' },
  { value: '24/7', label: 'Application Tracking' },
];

const features = [
  { icon: Map, title: 'For Surveyors & Owners', desc: 'Upload survey plans, lock GPS boundaries on-chain, and eliminate overlapping land disputes forever.' },
  { icon: ShieldCheck, title: 'For Banks & Lenders', desc: 'Originate loans with confidence. Every property on MoRe is mathematically verified for clear title equity.' },
  { icon: Building2, title: 'For Estate Developers', desc: 'Register your estates on the registry to offer buyers instantly-approved, pre-cleared mortgage pathways.' },
  { icon: Calculator, title: 'For Homebuyers', desc: 'Apply once, compare rates from top Nigerian banks, and track your journey to secure homeownership.' },
];

export default function Index() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/20 z-10" />
          <img src="/hero-bg.png" alt="Luxury Home" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-20 mx-auto px-4 pt-10 pb-20 lg:pt-16 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30">
                <span className="text-sm font-medium">MoRe, Powering Nigeria's Real Estate Economy</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight break-words">
                The Operating System for <br />
                <span className="text-primary">Mortgages & Land Registry</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Verify titles, process mortgages, and build absolute trust in property transactions, MoRe bridges the gap between land security and capital.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link to="/apply" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg h-auto py-3 px-4 sm:px-8 whitespace-normal text-center leading-tight">
                    Start Your Application <ArrowRight className="ml-2 h-5 w-5 shrink-0 inline-block" />
                  </Button>
                </Link>
                <Link to="/calculator" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full text-foreground border-border hover:bg-muted text-base sm:text-lg h-auto py-3 px-4 sm:px-8 whitespace-normal text-center leading-tight">
                    Check Affordability
                  </Button>
                </Link>
              </div>
              {/* MoRe: Mortgage and Registry Interface */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/registry/surveyor" className="group bg-background/80 backdrop-blur-md p-4 lg:p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all hover:border-primary flex flex-col items-start text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg group-hover:scale-110 transition-transform">
                      <Map className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base">Surveyor Portal</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">Lock GPS boundaries and cryptographically sign survey plans.</p>
                </Link>

                <Link to="/registry/vault" className="group bg-background/80 backdrop-blur-md p-4 lg:p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all hover:border-primary flex flex-col items-start text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base">Landowner Vault</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">Approve boundary splits and clear titles for mortgage underwriting.</p>
                </Link>
              </div>

              {/* Scrolling Ticker */}
              <div className="mt-8 overflow-hidden relative w-full bg-card/60 backdrop-blur-md border border-border shadow-sm rounded-lg py-3 flex items-center">
                <motion.div
                  className="flex whitespace-nowrap gap-8 px-4 text-sm font-medium text-foreground/80"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
                >
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> MREIF: Unlock government real estate value</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> NHF: Access 6% mortgage rates</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Real Estate: Your pathway to homeownership</span>
                  {/* Duplicated for seamless loop */}
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> MREIF: Unlock government real estate value</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> NHF: Access 6% mortgage rates</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Real Estate: Your pathway to homeownership</span>
                </motion.div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-muted-foreground bg-background/50 p-4 rounded-lg border border-border backdrop-blur-sm">
                <span className="font-semibold text-foreground">For Enquiries:</span>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <a href="mailto:vchidiebere.vc@gmail.com" className="hover:text-primary transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" /> vchidiebere.vc@gmail.com
                  </a>
                  <div className="hidden sm:block w-px h-4 bg-border"></div>
                  <a href="https://wa.me/2347068488419" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> WhatsApp: 07068488419
                  </a>
                </div>
              </div>

          </motion.div>
        </div>
      </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-display font-bold text-secondary">{stat.value}</p>
                <p className="text-sm text-primary-foreground/80 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Choose MoRe?</h2>
            <p className="text-muted-foreground">We're revolutionizing Nigerian real estate by uniting verifiable land registries with accessible mortgage financing.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-card rounded-xl border card-hover"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Own Your Home?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of Nigerians who found their perfect mortgage match.
          </p>
          <Button asChild size="lg" className="h-14 px-8 text-lg">
            <Link to="/apply">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
