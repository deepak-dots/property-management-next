export default function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-10 mt-0">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-sm leading-relaxed">
              Dotsquares Property is your trusted partner in finding the perfect home.
              We specialize in offering premium real estate solutions tailored to your needs.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/properties" className="hover:text-white transition-colors">Properties</a></li>
              <li><a href="/page/about-us" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/page/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/page/terms-and-conditions" className="hover:text-white transition-colors">Terms and Conditions</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Social</h3>
            <ul className="space-y-2 text-sm text-center md:text-left">
              <li className="hover:text-white transition-colors cursor-default">Facebook</li>
              <li className="hover:text-white transition-colors cursor-default">Twitter</li>
              <li className="hover:text-white transition-colors cursor-default">Instagram</li>
            </ul>
          </div>

        </div>

        {/* Bottom text */}
        <div className="text-center mt-8 border-t border-gray-700 pt-4 text-sm">
          <p>© {new Date().getFullYear()} Dotsquares Property. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
