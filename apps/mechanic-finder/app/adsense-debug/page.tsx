'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@rubros/ui';
import { AdComponent } from '@/components/ads/ads';
import { canUseAdvertising, getCurrentConsent } from '@/lib/cookies';
import { DebugWrapper } from '@/components/Debug/DebugWrapper';
import { ADSENSE_SLOTS } from '@rubros/ui/constants';

export default function AdSenseDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showAds, setShowAds] = useState(true);

  const refreshDebugInfo = () => {
    const adElements = typeof window !== 'undefined' ? document.querySelectorAll('.adsbygoogle') : [];

    const info = {
      adsenseScript: typeof window !== 'undefined' && window.adsbygoogle ? '✅ Loaded' : '❌ Not loaded',
      adsbyGoogleArray: typeof window !== 'undefined' && window.adsbygoogle ? window.adsbygoogle.length : 'N/A',
      adElementsCount: adElements.length,
      hasAdvertisingConsent: canUseAdvertising(),
      consentDetails: getCurrentConsent(),
      environment: process.env.NODE_ENV,
      clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
      screenSize: typeof window !== 'undefined' ? `${screen.width}x${screen.height}` : 'N/A',
      viewportSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      timestamp: new Date().toLocaleTimeString(),
    };

    setDebugInfo(info);
    console.log('🔍 AdSense Debug Info:', info);
  };

  useEffect(() => {
    refreshDebugInfo();
    const interval = setInterval(refreshDebugInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const clearAdsenseQueue = () => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      window.adsbygoogle.length = 0;
      console.log('🧹 Cleared AdSense queue');
      refreshDebugInfo();
    }
  };

  const reloadAds = () => {
    setShowAds(false);
    setTimeout(() => setShowAds(true), 100);
  };

  const inspectAdElements = () => {
    const adElements = document.querySelectorAll('.adsbygoogle');
    console.log(`🔍 Found ${adElements.length} AdSense elements:`);

    adElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const htmlElement = element as HTMLElement;
      const isVisible = htmlElement.offsetParent !== null;
      const slot = element.getAttribute('data-ad-slot');

      console.log(`Ad ${index + 1}:`, {
        slot: slot,
        visible: isVisible,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        element: element
      });
    });

    refreshDebugInfo();
  };

  return (
    <DebugWrapper title="AdSense Debug Console">
      <div className="container py-8 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔬 AdSense Debug Console</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">System Status</h3>
              <div className="space-x-2">
                <Button onClick={refreshDebugInfo} size="sm" variant="outline">
                  🔄 Refresh
                </Button>
                <Button onClick={clearAdsenseQueue} size="sm" variant="secondary">
                  🧹 Clear Queue
                </Button>
                <Button onClick={reloadAds} size="sm" variant="primary">
                  🔁 Reload Ads
                </Button>
                <Button onClick={inspectAdElements} size="sm" variant="outline">
                  🔍 Inspect Elements
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">📊 AdSense Status</h4>
                <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                  <div><strong>Script Loaded:</strong> {debugInfo.adsenseScript}</div>
                  <div><strong>Queue Length:</strong> {debugInfo.adsbyGoogleArray}</div>
                  <div><strong>Ad Elements:</strong> {debugInfo.adElementsCount || 0}</div>
                  <div><strong>Client ID:</strong> {debugInfo.clientId}</div>
                  <div><strong>Has Consent:</strong> {debugInfo.hasAdvertisingConsent ? '✅ Yes' : '❌ No'}</div>
                  <div><strong>Environment:</strong> {debugInfo.environment}</div>
                  <div className="text-xs text-gray-500">Updated: {debugInfo.timestamp}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">🍪 Consent Details</h4>
                <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                  <div><strong>Analytics:</strong> {debugInfo.consentDetails?.analytics ? '✅' : '❌'}</div>
                  <div><strong>Advertising:</strong> {debugInfo.consentDetails?.advertising ? '✅' : '❌'}</div>
                  <div><strong>Necessary:</strong> {debugInfo.consentDetails?.necessary ? '✅' : '❌'}</div>
                  <div><strong>Consent Date:</strong> {
                    debugInfo.consentDetails?.timestamp
                      ? new Date(debugInfo.consentDetails.timestamp).toLocaleDateString()
                      : 'N/A'
                  }</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">🌐 Browser Info</h4>
                <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
                  <div><strong>Screen:</strong> {debugInfo.screenSize}</div>
                  <div><strong>Viewport:</strong> {debugInfo.viewportSize}</div>
                  <div><strong>URL:</strong> <span className="break-all">{debugInfo.url}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">📋 Instructions</h4>
                <div className="text-sm space-y-1 bg-blue-50 p-3 rounded">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Accept advertising cookies if banner appears</li>
                    <li>Check that script is loaded and consent is granted</li>
                    <li>Open DevTools → Network → filter "google"</li>
                    <li>Look for requests to googlesyndication.com</li>
                    <li>Check Console for AdSense errors</li>
                    <li>Reload ads if they don't appear</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!debugInfo.hasAdvertisingConsent && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-orange-800">
                <span>⚠️</span>
                <span><strong>No Advertising Consent:</strong> Accept advertising cookies to see real ads.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {debugInfo.adsenseScript === '❌ Not loaded' && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <span>🚨</span>
                <span><strong>AdSense Script Not Loaded:</strong> Check if the script is properly included in the layout.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {showAds && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Test Ad Slots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Top Banner Ad</h4>
                  <div className="border p-2 rounded">
                    <AdComponent type={ADSENSE_SLOTS.TOP} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">In-Feed Ad</h4>
                  <div className="border p-2 rounded">
                    <AdComponent type={ADSENSE_SLOTS.IN_FEED} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">List Ad</h4>
                  <div className="border p-2 rounded">
                    <AdComponent type={ADSENSE_SLOTS.LIST} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Square Ad</h4>
                  <div className="border p-2 rounded">
                    <AdComponent type={ADSENSE_SLOTS.SQUARE} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Landing Ad</h4>
                  <div className="border p-2 rounded">
                    <AdComponent type={ADSENSE_SLOTS.LANDING} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Footer Ad</h4>
                  <div className="border p-2 rounded">
                    <AdComponent type={ADSENSE_SLOTS.FOOTER} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DebugWrapper>
  );
}