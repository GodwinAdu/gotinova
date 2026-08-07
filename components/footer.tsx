import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { NewsletterInline } from './newsletter-popup'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold">
                GN
              </div>
              GotiNova
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your one-stop online store for premium products. From hair & beauty to fashion, electronics, and more. Based in Ghana, delivering nationwide.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-3 sm:mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=hair" className="text-muted-foreground hover:text-primary transition-colors">Hair & Beauty</Link></li>
              <li><Link href="/products?category=fashion" className="text-muted-foreground hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=electronics" className="text-muted-foreground hover:text-primary transition-colors">Electronics</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-sm mb-3 sm:mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors">Shipping</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">gotinova@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                +233 24 959 5624
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Kumasi, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t pt-6 sm:pt-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">Stay in the loop</h4>
              <p className="text-xs text-muted-foreground">Get exclusive deals and updates on new arrivals.</p>
            </div>
            <NewsletterInline />
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t pt-6 sm:pt-8">
          {/* Payment methods */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
            <span className="text-[10px] text-muted-foreground mr-1">We accept:</span>
            {/* MTN MoMo */}
            <div className="h-7 px-2.5 bg-[#ffcc00] rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-black">MTN MoMo</span>
            </div>
            {/* Vodafone Cash */}
            <div className="h-7 px-2.5 bg-[#e60000] rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">Vodafone</span>
            </div>
            {/* AirtelTigo */}
            <div className="h-7 px-2.5 bg-[#0033a0] rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">AirtelTigo</span>
            </div>
            {/* Visa */}
            <div className="h-7 px-2.5 bg-[#1a1f71] rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="h-7 px-2.5 bg-[#f79e1b]/10 border border-[#f79e1b]/30 rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#f79e1b]">Mastercard</span>
            </div>
            {/* COD */}
            <div className="h-7 px-2.5 bg-muted rounded-md flex items-center justify-center">
              <span className="text-[10px] font-medium text-muted-foreground">Cash on Delivery</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {currentYear} GotiNova. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/shipping" className="hover:text-primary transition-colors">Shipping</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
