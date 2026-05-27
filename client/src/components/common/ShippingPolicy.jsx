import React from "react";
import {
  Truck,
  PackageCheck,
  ShieldCheck,
  Clock3,
  MapPinned,
} from "lucide-react";

const ShippingPolicy = () => {
  const policies = [
    {
      icon: <Truck size={26} />,
      title: "Fast Delivery",
      description:
        "Orders are processed within 1–3 business days and delivered safely across India.",
    },
    {
      icon: <Clock3 size={26} />,
      title: "Estimated Shipping Time",
      description:
        "Metro cities: 2–5 days | Other locations: 4–8 business days.",
    },
    {
      icon: <PackageCheck size={26} />,
      title: "Order Tracking",
      description:
        "Track your order easily with the tracking ID shared after shipment.",
    },
    {
      icon: <ShieldCheck size={26} />,
      title: "Safe Packaging",
      description:
        "Every product is packed securely to prevent damage during transit.",
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 px-4 md:px-10 bg-[rgb(var(--background))] text-[rgb(var(--text-primary))]">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full glass-panel text-sm font-medium tracking-wide">
            Shipping Information
          </span>

          <h2 className="mt-5 text-4xl md:text-5xl font-bold leading-tight">
            Our <span className="gradient-text">Shipping Policy</span>
          </h2>

          <p className="mt-5 max-w-2xl mx-auto text-[rgb(var(--text-secondary))] text-lg leading-relaxed">
            We ensure secure packaging, faster delivery, and real-time order
            tracking for all customer purchases.
          </p>
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {policies.map((item, index) => (
            <div
              key={index}
              className="glass-panel glass-panel-hover rounded-3xl p-6 relative overflow-hidden group"
            >
              {/* Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-violet-500/10"></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shadow-lg mb-5">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-3">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

     
      </div>
    </section>
  );
};

export default ShippingPolicy;