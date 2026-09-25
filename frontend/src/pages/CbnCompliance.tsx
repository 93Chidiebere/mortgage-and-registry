import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { ShieldCheck, Landmark, FileCheck, Search } from 'lucide-react';

export default function CbnCompliance() {
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
            <ShieldCheck className="h-5 w-5" />
            <span className="font-medium">Regulatory Compliance</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            CBN Compliance Statement
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
              <Landmark className="h-6 w-6 text-primary" />
              1. Our Regulatory Status
            </h2>
            <p className="mb-4">
              MortgageNG Marketplace (operated by UNICCO) acts as a financial technology aggregator and intermediary platform. We are <strong>not</strong> a bank, nor do we hold a banking license from the Central Bank of Nigeria (CBN). 
            </p>
            <p>
              We do not accept deposits, nor do we underwrite or disburse loans directly. All mortgage products, approvals, and funds are provided exclusively by our Partner Banks.
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              2. Partner Bank Licensing
            </h2>
            <p className="mb-4">
              To ensure the absolute safety and legality of your mortgage, MortgageNG strictly partners with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Primary Mortgage Banks (PMBs):</strong> Fully licensed and regulated by the CBN to provide mortgage financing.</li>
              <li><strong>Commercial Banks:</strong> Fully licensed by the CBN with authorized mortgage/real estate desks.</li>
            </ul>
            <p>
              All our Partner Banks are subject to CBN prudential guidelines and are members of the Nigeria Deposit Insurance Corporation (NDIC).
            </p>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              3. AML & CFT Compliance (KYC)
            </h2>
            <p className="mb-4">
              In strict adherence to the CBN's Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT) guidelines, MortgageNG mandates a robust Know Your Customer (KYC) process for all applicants:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>BVN Verification:</strong> All applicants must provide a valid Bank Verification Number (BVN) to verify their identity and financial history.</li>
              <li><strong>Identity Verification:</strong> We collect and verify valid government-issued IDs (NIN, Driver's License, International Passport).</li>
              <li><strong>Income Verification:</strong> Legitimate proof of income (pay slips, audited accounts) must be provided to prevent the facilitation of illicit funds into the real estate sector.</li>
            </ul>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-primary" />
              4. Consumer Protection Framework
            </h2>
            <p className="mb-4">
              We align our operations with the CBN Consumer Protection Framework to ensure that homebuyers are treated fairly:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Transparency:</strong> All interest rates, processing fees, and hidden charges associated with a mortgage product are displayed clearly before an application is submitted.</li>
              <li><strong>Data Privacy:</strong> We employ bank-grade encryption to protect your sensitive financial data, strictly complying with the Nigerian Data Protection Regulation (NDPR).</li>
            </ul>
          </div>

        </motion.div>
      </div>
    </MainLayout>
  );
}
