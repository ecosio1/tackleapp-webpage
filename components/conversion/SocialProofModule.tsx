/**
 * SocialProofModule - Trust signals and testimonials
 */

interface SocialProofModuleProps {
  className?: string;
}

const TESTIMONIALS = [
  {
    text: 'Tackle helped me catch my first redfish. The conditions forecast was spot on.',
    author: 'Mike T., Tampa',
  },
  {
    text: 'The fish ID feature is incredible. No more guessing what I caught.',
    author: 'Sarah L., Miami',
  },
  {
    text: "Best fishing app I've used. The AI captain answers all my questions.",
    author: 'John D., Key West',
  },
];

const BENEFITS = [
  '99% accurate fish identification',
  'Real-time fishing conditions',
  'Expert AI advice 24/7',
];

export function SocialProofModule({ className = '' }: SocialProofModuleProps) {
  // Rotate testimonials (show one at a time or all)
  const testimonial = TESTIMONIALS[0]; // In production, rotate or show all

  return (
    <div className={`social-proof-module ${className}`}>
      <div className="proof-badge">
        <span className="badge-text">Built for Florida anglers</span>
      </div>

      <div className="proof-testimonial">
        <p className="testimonial-text">"{testimonial.text}"</p>
        <p className="testimonial-author">— {testimonial.author}</p>
      </div>

      <div className="proof-benefits">
        <h4 className="benefits-title">What you get:</h4>
        <ul className="benefits-list">
          {BENEFITS.map((benefit, index) => (
            <li key={index} className="benefit-item">
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

