import Link from "next/link";

const footerLinks = {
  Products: [
    { label: "Business Cards", href: "/categories/business-cards" },
    { label: "Flyers & Leaflets", href: "/categories/flyers-leaflets" },
    { label: "Banners", href: "/categories/banners" },
    { label: "Posters", href: "/categories/posters" },
    { label: "Stickers", href: "/categories/stickers-labels" },
    { label: "All Categories", href: "/categories" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
  Support: [
    { label: "Artwork Guide", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Delivery Info", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">NewMerch</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Professional print services for businesses. From business cards to
              large format banners, we deliver quality printing with fast
              turnaround.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} NewMerch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
