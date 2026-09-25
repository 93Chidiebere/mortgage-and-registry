import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Scale, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export default function Terms() {
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
            <Scale className="h-5 w-5" />
            <span className="font-medium">Terms of Service</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            User Agreement
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
              Welcome to MortgageNG Marketplace, a digital platform owned and operated by UNICCO. By accessing or using our website and services, you agree to comply with and be bound by these Terms of Service.
            </p>
            <p>
              Please read these terms carefully before using our platform. If you do not agree with any part of these terms, you must not use our services.
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              2. Our Role as an Intermediary
            </h2>
            <p className="mb-4">
              MortgageNG operates strictly as a <strong>marketplace and intermediary</strong>. We are not a bank, a direct lender, or a financial institution. 
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>We facilitate connections between homebuyers and licensed Primary Mortgage Banks (PMBs) and Commercial Banks in Nigeria.</li>
              <li>We do not fund loans, underwrite mortgages, or make final credit decisions.</li>
              <li>All mortgage offers, interest rates, and loan terms are provided directly by the Partner Banks.</li>
            </ul>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              3. No Guarantee of Approval
            </h2>
            <p className="mb-4">
              Receiving a "Pre-Approval Certificate" or a positive affordability check on MortgageNG does <strong>not</strong> constitute a binding offer of credit or a guarantee of final loan disbursement.
            </p>
            <p>
              Final mortgage approval is entirely at the discretion of the selected Partner Bank and is subject to their internal underwriting processes, property valuation, legal search, and verification of all submitted documents.
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
            <p className="mb-4">By using our platform, you agree that:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>All information you provide (including income, debt obligations, and identity details) is 100% accurate and truthful.</li>
              <li>Providing false, forged, or misleading financial documents may result in immediate application rejection and could be reported to relevant legal authorities.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            </ul>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Fees and Charges</h2>
            <p className="mb-4">
              MortgageNG provides its comparison and initial application services to homebuyers completely <strong>free of charge</strong>. 
            </p>
            <p>
              However, if your mortgage is approved by a Partner Bank, you will be responsible for standard banking fees (such as processing fees, legal fees, valuation fees, and insurance) as dictated by the lender. These fees are paid directly to the lender or their appointed agents, not to MortgageNG.
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by Nigerian law, UNICCO and MortgageNG shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform, the failure of a lender to approve your loan, or any disputes arising between you and a Partner Bank.
            </p>
          </div>

        </motion.div>
      </div>
    </MainLayout>
  );
}
