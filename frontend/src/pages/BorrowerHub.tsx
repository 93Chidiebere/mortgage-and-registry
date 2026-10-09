import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, UserPlus, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BorrowerHub() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[70vh] flex items-center">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                <span className="text-sm font-medium">Your Pathway to Homeownership</span>
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Secure Financing <span className="text-primary">Made Simple</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Learn about mortgage rates, check your eligibility, and apply directly to Nigeria's top lenders from a single platform.
              </p>
              
              <div className="pt-4">
                <Link to="/apply">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-8">
                    Start Your Application <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Core Hub Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            <Link to="/learn" className="group">
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Knowledge Center</h3>
                  <p className="text-muted-foreground">Learn how mortgages work in Nigeria, understand NHF, and discover tips to improve your approval odds.</p>
                  <div className="text-primary font-medium flex items-center pt-2">
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/calculator" className="group">
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm hover:border-secondary/50 transition-all duration-300">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary-foreground group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Check Affordability</h3>
                  <p className="text-muted-foreground">Use our dynamic calculator to estimate monthly repayments based on your income and interest rates.</p>
                  <div className="text-secondary-foreground font-medium flex items-center pt-2">
                    Open Calculator <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/login" className="group">
              <Card className="h-full border-border/50 bg-background/60 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300">
                <CardContent className="p-6 md:p-8 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <UserPlus size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Register / Sign In</h3>
                  <p className="text-muted-foreground">Create your borrower profile securely and track the status of your active mortgage applications.</p>
                  <div className="text-amber-600 font-medium flex items-center pt-2">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
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
