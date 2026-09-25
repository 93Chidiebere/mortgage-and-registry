import { Link } from 'react-router-dom';
import { Home, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Home className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <span className="font-display text-lg font-bold text-background">MortgageNG</span>
                <span className="ml-1 text-xs text-muted">Marketplace</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Nigeria's premier mortgage marketplace. Compare, apply, and track your mortgage journey with transparency.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com/NigeriaMortgage" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-background transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/naija-mortgage/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-background transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Homebuyers */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-background">For Homebuyers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/apply" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  Apply for Mortgage
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  Compare Products
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  Affordability Calculator
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  First-Time Buyer Guide
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  Track Application
                </Link>
              </li>
            </ul>
          </div>

          {/* For Lenders */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-background">For Lenders</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/for-lenders" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/lender/login" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  Lender Login
                </Link>
              </li>
              <li>
                <Link to="/for-lenders#pricing" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/for-lenders#faq" className="text-sm text-muted-foreground hover:text-background transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-background">Contact Us</h3>
            <a href="mailto:vchidiebere.vc@gmail.com" className="text-sm text-muted-foreground hover:text-background transition-colors flex items-center gap-2">
              <Mail className="h-4 w-4" /> vchidiebere.vc@gmail.com
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-muted-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MortgageNG. All rights reserved.
            </p>
            <p className="text-sm font-medium text-muted-foreground md:absolute md:left-1/2 md:-translate-x-1/2">
              By UNICCO
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-background transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-background transition-colors">
                Terms of Service
              </Link>
              <Link to="/compliance" className="text-sm text-muted-foreground hover:text-background transition-colors">
                CBN Compliance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
