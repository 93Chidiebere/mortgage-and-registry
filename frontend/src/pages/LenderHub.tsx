import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck, Map, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';

export default function LenderHub() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/20 z-10" />
          {/* Reusing the beautiful background image */}
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
                <span className="text-sm font-medium">For Institutions & Professionals</span>
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                The Capital & <span className="text-primary">Security Layer</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Access mathematically verified land titles, originate zero-dispute mortgages, and coordinate directly with licensed surveyors.
              </p>
            </motion.div>
          </div>

          {/* Core Hub Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <Link to="/onboard-bank" className="group">
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Onboard Your Bank</h3>
                  <p className="text-muted-foreground">Join the MoRe network to access pre-cleared real estate and originate secure mortgages.</p>
                  <div className="text-primary font-medium flex items-center pt-2">
                    Start Onboarding <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/surveyor-portal" className="group">
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm hover:border-secondary/50 transition-all duration-300">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary-foreground group-hover:scale-110 transition-transform">
                    <Map size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Surveyor Portal</h3>
                  <p className="text-muted-foreground">Upload spatial data, run exact-geometry overlap checks, and cryptographically sign survey plans.</p>
                  <div className="text-secondary-foreground font-medium flex items-center pt-2">
                    Access Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/vault" className="group">
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Landowner Vault</h3>
                  <p className="text-muted-foreground">Approve boundary proposals, manage encumbrances, and clear titles for mortgage underwriting.</p>
                  <div className="text-emerald-600 font-medium flex items-center pt-2">
                    Open Vault <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
