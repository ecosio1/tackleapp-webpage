/**
 * AppStorePreviewModule - App screenshots and features preview
 */

interface AppStorePreviewModuleProps {
  className?: string;
}

const SCREENSHOTS = [
  {
    src: '/images/app-screenshots/fish-id.jpg',
    alt: 'Fish identification feature',
    title: 'Identify Any Fish',
  },
  {
    src: '/images/app-screenshots/conditions.jpg',
    alt: 'Fishing conditions forecast',
    title: 'Daily Conditions',
  },
  {
    src: '/images/app-screenshots/ai-captain.jpg',
    alt: 'AI Captain chat',
    title: 'AI Captain',
  },
  {
    src: '/images/app-screenshots/catch-log.jpg',
    alt: 'Catch logging',
    title: 'Track Your Catches',
  },
  {
    src: '/images/app-screenshots/forecast.jpg',
    alt: '7-day forecast',
    title: '7-Day Forecast',
  },
];

const FEATURES = [
  'AI-powered fish identification (99% accurate)',
  'Daily fishing score (0-100%) based on conditions',
  '7-day fishing forecasts',
  'AI Captain chat for expert advice',
  'GPS catch logging and mapping',
  'Works offline and syncs everywhere',
];

export function AppStorePreviewModule({ className = '' }: AppStorePreviewModuleProps) {
  return (
    <div className={`app-store-preview-module ${className}`}>
      <h3 className="preview-title">See Tackle in Action</h3>
      
      <div className="preview-screenshots">
        {SCREENSHOTS.map((screenshot, index) => (
          <div key={index} className="screenshot-item">
            <img
              src={screenshot.src}
              alt={screenshot.alt}
              className="screenshot-image"
              loading="lazy"
            />
            <p className="screenshot-title">{screenshot.title}</p>
          </div>
        ))}
      </div>

      <div className="preview-features">
        <h4 className="features-title">What you get:</h4>
        <ul className="features-list">
          {FEATURES.map((feature, index) => (
            <li key={index} className="feature-item">
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


