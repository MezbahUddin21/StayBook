import { Link } from 'react-router-dom';
import { Hotel } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Hotel className="w-5 h-5" />
              StayBook
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Find and book hotels worldwide. Your perfect stay is just a click away.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Discover</p>
            <ul className="space-y-2 text-sm">
              {['Hotels', 'Resorts', 'Apartments', 'Villas'].map(l => (
                <li key={l}><Link to="/search" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Support</p>
            <ul className="space-y-2 text-sm">
              {['Help Center', 'Contact Us', 'Cancellation Policy', 'Privacy Policy'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              {['About Us', 'Careers', 'Press', 'Investors'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">© 2024 StayBook. All rights reserved.</p>
          <p className="text-sm text-gray-500">Built with Laravel, React & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
