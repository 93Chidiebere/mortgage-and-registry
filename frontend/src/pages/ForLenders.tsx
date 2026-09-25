import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building2, Users, TrendingUp, Shield, BarChart3, Zap,
  CheckCircle2, ArrowRight, Star, Phone, Mail
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Users,
    title: 'Qualified Leads',
    description: 'Access pre-screened mortgage applicants with verified income and KYC documentation.',
  },
  {
    icon: TrendingUp,
    title: 'Increased Visibility',
    description: 'Showcase your products to thousands of active homebuyers across Nigeria.',
  },
  {
    icon: Shield,
    title: 'Reduced Risk',
    description: 'AI-powered matching delivers leads with higher approval probability.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance, conversion rates, and market trends in real-time.',
  },
  {
    icon: Zap,
    title: 'Fast Integration',
    description: 'Simple onboarding process. Start receiving leads within 24 hours.',
  },
  {
    icon: CheckCircle2,
    title: 'Compliance Ready',
    description: 'All applications meet CBN requirements with standardized documentation.',
  },
];

const plans = [
  {
    name: 'Basic',
    price: '₦150,000',
    period: 'per closed lead',
    description: 'For smaller PMBs getting started',
    features: [
      'Access to qualified leads',
      'Basic product listing',
      'Standard lead notifications',
      'Monthly performance reports',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    price: '₦200,000',
    period: 'per closed lead',
    description: 'For established lenders seeking growth',
    features: [
      'Everything in Basic',
      'Priority lead routing',
      'Featured product placement',
      'Real-time analytics dashboard',
      'Geographic demand heatmaps',
      'Competitive benchmarking',
      'Dedicated account manager',
      'API access',
    ],
    cta: 'Contact Sales',
    popular: true,
  },
];

const stats = [
  { value: '15,000+', label: 'Active Homebuyers' },
  { value: '₦500B+', label: 'Loans Facilitated' },
  { value: '85%', label: 'Lead Acceptance Rate' },
  { value: '48hrs', label: 'Avg. Response Time' },
];

const testimonials = [
  {
    quote: "MortgageNG has transformed how we acquire customers. The quality of leads is exceptional.",
    author: "Chukwu Okonkwo",
    role: "Head of Mortgages, First PMB",
  },
  {
    quote: "The analytics dashboard gives us insights we've never had before. We can now make data-driven decisions.",
    author: "Amina Ibrahim",
    role: "CEO, Housing Finance Corp",
  },
];

export default function ForLenders() {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Building2 className="h-3 w-3 mr-1" /> For Lenders
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Grow Your Mortgage Portfolio with{' '}
              <span className="text-primary">Qualified Leads</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join Nigeria's leading mortgage marketplace. Connect with pre-verified homebuyers actively seeking mortgage products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg h-14 px-8">
                <Link to="/lender-onboarding">
                  Become a Partner
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg h-14 px-8">
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Why Partner With Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the infrastructure to help Nigerian lenders grow their mortgage business efficiently.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pay only for successful mortgage closures. No upfront fees, no monthly subscriptions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg relative' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary">
                        <Star className="h-3 w-3 mr-1" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Trusted by Leading Lenders</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {testimonial.author.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Mortgage Business?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join 25+ lenders already benefiting from Nigeria's largest mortgage marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild variant="secondary" size="lg" className="text-lg h-14 px-8">
              <Link to="/lender-onboarding">Apply to Partner</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg h-14 px-8 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10">
              <Phone className="h-5 w-5 mr-2" />
              +234 1 234 5678
            </Button>
          </div>
          <p className="text-sm opacity-80">
            <Mail className="h-4 w-4 inline mr-1" />
            partners@mortgageng.com
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
