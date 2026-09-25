import { motion } from 'framer-motion';
import { 
  BookOpen, GraduationCap, Home, Calculator, FileText, 
  HelpCircle, ChevronRight, Clock, User, Building2
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const guides = [
  {
    id: 1,
    title: 'NHF Scheme Explained',
    description: 'How to leverage the National Housing Fund (NHF) for low-interest 6% mortgage rates.',
    icon: GraduationCap,
    readTime: '7 min read',
    level: 'Beginner',
  },
  {
    id: 2,
    title: 'Understanding FMBN',
    description: 'The role of the Federal Mortgage Bank of Nigeria in providing affordable housing finance.',
    icon: Building2,
    readTime: '6 min read',
    level: 'Intermediate',
  },
  {
    id: 3,
    title: 'NMRC Refinancing',
    description: 'How the Nigeria Mortgage Refinance Company provides liquidity to make mortgages cheaper.',
    icon: Calculator,
    readTime: '8 min read',
    level: 'Advanced',
  },
  {
    id: 4,
    title: 'MOFI / MREIF Guide',
    description: 'Understanding the Ministry of Finance Incorporated Real Estate Investment Fund.',
    icon: BookOpen,
    readTime: '5 min read',
    level: 'Intermediate',
  },
  {
    id: 5,
    title: 'Document Checklist',
    description: 'Complete list of required documents: Offer letter, Title documents, Pay slips, and more.',
    icon: FileText,
    readTime: '5 min read',
    level: 'Beginner',
  },
  {
    id: 6,
    title: 'The Mortgage Process',
    description: 'Step-by-step guide from pre-approval to final disbursement and property handover.',
    icon: Home,
    readTime: '10 min read',
    level: 'Beginner',
  },
];

const faqs = [
  {
    question: 'What is the minimum down payment required?',
    answer: 'Most Nigerian lenders require a minimum down payment of 15-25% of the property value. Some government-backed schemes may offer options as low as 10%. The exact amount depends on the lender, your income, and the type of property.'
  },
  {
    question: 'How long does mortgage approval take?',
    answer: 'The typical mortgage approval process in Nigeria takes 2-6 weeks, depending on the lender and completeness of your documentation. Pre-approval can be obtained within 48-72 hours for straightforward applications.'
  },
  {
    question: 'What is the maximum loan tenure available?',
    answer: 'Most Nigerian mortgage lenders offer tenures of up to 20-30 years. The actual maximum depends on your age (loans typically must be repaid before age 60-65) and the specific lender\'s policies.'
  },
  {
    question: 'Do I need to be a salary earner to get a mortgage?',
    answer: 'No, self-employed individuals can also obtain mortgages in Nigeria. However, you\'ll need to provide additional documentation such as audited financial statements, tax returns, and business bank statements covering 12-24 months.'
  },
  {
    question: 'What is BVN and why is it required?',
    answer: 'BVN (Bank Verification Number) is a biometric identification system used by Nigerian banks. It\'s required for KYC (Know Your Customer) verification and helps lenders verify your identity and banking history.'
  },
  {
    question: 'Can I pay off my mortgage early?',
    answer: 'Yes, most lenders allow early repayment (prepayment). Some may charge a prepayment penalty (typically 1-2% of the outstanding balance), while others offer penalty-free prepayment. Always check the terms before signing.'
  },
  {
    question: 'What happens if I miss a payment?',
    answer: 'Missing a payment will typically result in late fees and could negatively impact your credit score. If you anticipate payment difficulties, contact your lender immediately to discuss options such as payment restructuring.'
  },
  {
    question: 'Is property insurance mandatory?',
    answer: 'Yes, most lenders require you to maintain property insurance (building insurance) for the duration of the mortgage. This protects both you and the lender against damage or destruction of the property.'
  },
];

const glossary = [
  { term: 'NHF (National Housing Fund)', definition: 'A federal government scheme that mobilizes funds for the provision of affordable residential houses for Nigerians.' },
  { term: 'FMBN (Federal Mortgage Bank of Nigeria)', definition: 'The apex mortgage institution in Nigeria responsible for managing the NHF and providing wholesale funding to Primary Mortgage Banks.' },
  { term: 'NMRC (Nigeria Mortgage Refinance Company)', definition: 'A private sector-driven mortgage refinancing company promoting homeownership by raising long-term funds in the capital market.' },
  { term: 'MOFI (Ministry of Finance Incorporated)', definition: 'The investment vehicle of the Federal Government of Nigeria, overseeing state-owned assets including MREIF.' },
  { term: 'MREIF', definition: 'MOFI Real Estate Investment Fund, aimed at unlocking value in government real estate assets.' },
  { term: 'LTV (Loan-to-Value)', definition: 'The ratio of your loan amount to the property value, expressed as a percentage.' },
  { term: 'DTI (Debt-to-Income)', definition: 'The ratio of your total monthly debt payments to your gross monthly income.' },
  { term: 'Equity', definition: 'The portion of your property that you own outright (property value minus outstanding mortgage).' },
  { term: 'Amortization', definition: 'The process of paying off debt through regular payments that cover both principal and interest.' },
  { term: 'PMB', definition: 'Primary Mortgage Bank - specialized financial institutions licensed to provide mortgage financing in Nigeria.' },
];

export default function Learn() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <GraduationCap className="h-5 w-5" />
            <span className="font-medium">Education Hub</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Learn About Mortgages
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about home financing in Nigeria. From basic concepts to advanced strategies.
          </p>
        </motion.div>

        {/* Guides Grid */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold mb-6">Guides & Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <guide.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {guide.readTime}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {guide.level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Frequently Asked Questions</h2>
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Glossary */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold mb-6">Mortgage Glossary</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {glossary.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-primary mb-1">{item.term}</h3>
                  <p className="text-sm text-muted-foreground">{item.definition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl font-bold mb-4">
                Ready to Start Your Mortgage Journey?
              </h2>
              <p className="mb-6 opacity-90 max-w-xl mx-auto">
                Now that you understand the basics, take the next step. Check your affordability or compare mortgage products from Nigeria's top lenders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="secondary" size="lg">
                  <Link to="/calculator">
                    <Calculator className="h-5 w-5 mr-2" />
                    Check Affordability
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/apply">
                    Start Application
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
