# MortgageNG Marketplace

MortgageNG is Nigeria's premier digital mortgage aggregator and marketplace. It connects prospective homebuyers with Primary Mortgage Banks (PMBs), Commercial Banks, and government housing schemes (like the National Housing Fund - NHF and MREIF) to simplify and democratize access to home financing in Nigeria.

---

## 🇳🇬 Why MortgageNG is Necessary for Nigerians

Nigeria faces a staggering housing deficit estimated at over 28 million units. Despite this, mortgage penetration remains below 1% of the GDP (compared to over 50% in the US and UK). The problems are clear:

1. **Information Asymmetry:** Most Nigerians do not know they qualify for single-digit interest rate mortgages through the NHF (National Housing Fund) or the newly introduced MREIF (Ministry of Finance Incorporated Real Estate Investment Fund).
2. **High Friction:** Applying for a mortgage in Nigeria typically involves visiting multiple bank branches, filling out redundant paperwork, and waiting months without transparency. 
3. **Lender Bottlenecks:** Primary Mortgage Banks struggle with lead generation, customer acquisition costs, and filtering through unqualified applicants who don't meet basic affordability criteria.
4. **Regulatory Hurdles:** Navigating CBN compliance, KYC (BVN/NIN), and title verification is a massive hurdle for both consumers and banks.

**MortgageNG solves this by acting as a central, transparent, and frictionless intermediary.** We educate consumers, pre-qualify their affordability, and match them instantly with lenders who actually want to fund their specific property profile.

---

## 👥 Frontend Flow: The Consumer Experience

The consumer journey is designed to be highly educational and aggressively reduce friction. We operate a **6-Step Smart Onboarding Flow**:

1. **Discovery & Education:** Consumers land on the platform and can use the interactive **Affordability Calculator** to instantly see how much they can borrow based on their income and age. The **Learn Hub** educates them on NHF, NMRC, and MOFI.
2. **Personal & Employment Info:** We collect basic contact details, employment status, and income data. This is crucial for our matching algorithm to determine Affordability and Debt-to-Income (DTI) ratios.
3. **Smart Property Step:** 
   - *If they have a property:* We collect the exact address and asking price.
   - *If they don't:* We collect their "Target Budget" and preferred city, allowing lenders to issue a "Pre-Approval" shopping limit.
4. **Document Upload (Lightweight):** Since the property acts as collateral, we keep initial friction low. We only ask for basic Government ID and Bank Statements. Heavy KYC (BVN/NIN) is intentionally left for the Partner Banks to handle during final underwriting to comply with CBN mandates.
5. **Lender Matching & Selection:** The platform displays a curated list of matching lenders (e.g., Federal Mortgage Bank of Nigeria, Stanbic IBTC, Infinity Trust) showing their respective interest rates and maximum loan tenures. The user selects their preferred lenders.
6. **Review & Submit:** The user reviews their data, consents to data sharing, and submits the application. They are then redirected to a real-time **Consumer Dashboard** to track the status of their application.

---

## 🏦 Frontend Flow: The Lender Experience

The lender portal is an enterprise-grade CRM designed to streamline loan origination and underwriting.

1. **Lead Dashboard:** Lenders log into a secure dashboard showing a pipeline of pre-qualified applicants. 
2. **Pre-Screened Data:** Lenders see applicants' verified income, requested loan amounts, and calculated Loan-to-Value (LTV) ratios before committing resources.
3. **Application Management:** Lenders can move applications through custom statuses (e.g., *Under Review*, *Conditionally Approved*, *Funded*, *Rejected*).
4. **Direct Communication & Document Access:** Lenders can securely view the initial uploaded documents (ID, Bank Statements) and trigger requests for the consumer to provide further legal property documents (Survey plans, C of O) directly through the platform.
5. **Compliance & Analytics:** Lenders have access to analytics showing their approval rates, average time-to-fund, and compliance logs.

---

## ⚙️ Backend Logic & Architecture (How it Works)

While the current repository focuses heavily on the React frontend, the architecture requires a robust backend logic to facilitate the marketplace:

### 1. Affordability & Matching Engine
- **Logic:** The engine takes the user's Monthly Income and Existing Obligations to calculate the maximum permissible monthly repayment (usually capped at 33.3% of net income).
- **Matching:** It filters the database of Lender Products based on the user's age (to determine max loan tenure), property value (to check LTV limits), and employment type. 

### 2. Secure Document Vault & Data Pipeline
- All consumer data and uploaded documents are encrypted at rest.
- When a consumer selects a lender, the backend grants temporary, secure read-access tokens to that specific lender to view the consumer's vault.

### 3. Webhooks & Status Syncing
- The backend maintains an event-driven architecture. When a lender updates an application status (e.g., from *Reviewing* to *Approved*), a webhook fires to update the consumer's dashboard and triggers an email/SMS notification to the consumer.

### 4. Regulatory Compliance Layer (Intermediary Role)
- MortgageNG strictly operates as a marketplace intermediary. We do not underwrite loans or hold funds. 
- Because CBN mandates banks to handle strict KYC (BVN/NIN checks) and AML/CFT, our backend acts as a pass-through. We securely hand over the lead to the bank, and the bank initiates their own final regulatory checks via their internal core banking systems.

---

## 💻 Tech Stack

- **Frontend Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion (for dynamic UI animations)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Routing:** React Router DOM
- **Forms & Validation:** React Hook Form + Zod
