/**
 * DownloadButton - Smart download button with iOS detection
 */

'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { isIOSUserAgent, generateQRCodeUrl, generateSMSLink } from '@/lib/conversion/utils';
import Image from 'next/image';

interface DownloadButtonProps {
  appStoreUrl: string;
}

export function DownloadButton({ appStoreUrl }: DownloadButtonProps) {
  const [isIOS, setIsIOS] = useState(false);
  const qrCodeUrl = generateQRCodeUrl(appStoreUrl);

  useEffect(() => {
    setIsIOS(isIOSUserAgent());
    
    // Track page view
    trackEvent('download_page_view', {
      pageType: 'download',
      slug: 'download',
      isIOS: isIOSUserAgent(),
    });
  }, []);

  const handleClick = () => {
    trackEvent('appstore_outbound_click', {
      pageType: 'download',
      slug: 'download',
      isIOS,
      buttonLocation: 'hero',
    });
  };

  if (isIOS) {
    return (
      <a
        href={appStoreUrl}
        onClick={handleClick}
        className="download-button ios-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open in App Store
      </a>
    );
  }

  return (
    <div className="download-button-non-ios">
      <p className="non-ios-message">This app is for iPhone</p>
      <div className="qr-code-section">
        <Image
          src={qrCodeUrl}
          alt="App Store QR Code"
          width={200}
          height={200}
          className="qr-code-image"
        />
        <p className="qr-code-instructions">
          Scan with your iPhone camera to download
        </p>
      </div>
      <a
        href={appStoreUrl}
        onClick={handleClick}
        className="download-button link-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        View in App Store
      </a>
      {/* Optional: SMS link */}
      {/* <a href={generateSMSLink(appStoreUrl)} className="sms-link">
        Send link to my phone
      </a> */}
    </div>
  );
}


