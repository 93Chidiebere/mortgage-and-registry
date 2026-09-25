import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Shield, Lock, FileText, UserCheck } from 'lucide-react';

export default function Privacy() {
  const lastUpdated = "July 2026";

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Privacy Policy</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            How We Protect Your Data
          </h1>
          <p className="text-muted-foreground text-lg">
            Last Updated: {lastUpdated}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground"
        >
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              1. Introduction
            </h2>
            <p className="mb-4">
              Welcome to MortgageNG Marketplace, a platform operated by UNICCO ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data in compliance with the Nigerian Data Protection Regulation (NDPR) and other applicable laws.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our mortgage marketplace services.
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              2. Data We Collect
            </h2>
            <p className="mb-4">To provide you with accurate mortgage matching services, we collect:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Personal Identification Information:</strong> Full name, email address, phone number, date of birth, and state of residence.</li>
              <li><strong>Financial Information:</strong> Monthly income, existing loan obligations, employment details, and preferred property value.</li>
              <li><strong>Regulatory Information:</strong> Bank Verification Number (BVN) for mandatory Know Your Customer (KYC) compliance.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and usage data on our platform.</li>
            </ul>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              3. How We Use Your Data
            </h2>
            <p className="mb-4">We use your data strictly for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>To calculate your mortgage affordability and provide accurate estimates.</li>
              <li>To match you with suitable mortgage products from our Partner Banks (Lenders).</li>
              <li>To facilitate the pre-approval and formal mortgage application process.</li>
              <li>To prevent fraud and ensure compliance with CBN and NDPR regulations.</li>
            </ul>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Sharing & Third Parties</h2>
            <p className="mb-4">
              MortgageNG acts as an intermediary. <strong>We do not sell your personal data to third-party advertisers.</strong>
            </p>
            <p className="mb-4">We only share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Partner Banks (Lenders):</strong> Only when you explicitly submit a mortgage application to a specific lender on our platform.</li>
              <li><strong>Regulatory Bodies:</strong> If required by law or for compliance with the Central Bank of Nigeria (CBN).</li>
            </ul>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your NDPR Rights</h2>
            <p className="mb-4">Under the Nigerian Data Protection Regulation (NDPR), you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request correction of any inaccurate or incomplete data.</li>
              <li>Request the deletion of your personal data ("Right to be Forgotten").</li>
              <li>Withdraw your consent at any time.</li>
            </ul>
            <p>To exercise any of these rights, please contact us at <strong>vchidiebere.vc@gmail.com</strong>.</p>
          </div>

        </motion.div>
      </div>
    </MainLayout>
  );
}
