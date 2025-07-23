'use client';

import { useState, useEffect } from 'react';
import { pageview, event, GA_TRACKING_ID } from '@/lib/analytics';
import { canUseAnalytics, getCurrentConsent } from '@/lib/cookies';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@rubros/ui';
import { DebugWrapper } from '@/components/Debug/DebugWrapper';

// TypeScript types are already declared elsewhere

export default function AnalyticsTestPage() {
  const [gtag, setGtag] = useState<any>(null);
  const [consent, setConsent] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const refreshDebugInfo = () => {
    const hasGtag = typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function';
    const dataLayer = typeof window !== 'undefined' ? (window as any).dataLayer : null;

    const info = {
      gtag: hasGtag ? '✅ Loaded' : '❌ Not loaded',
      gtagType: hasGtag ? 'function' : 'undefined',
      dataLayer: dataLayer && Array.isArray(dataLayer) ? `Array (${dataLayer.length} items)` : 'Not found',
      hasConsent: canUseAnalytics(),
      trackingId: GA_TRACKING_ID,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
      timestamp: new Date().toLocaleTimeString()
    };

    setGtag(hasGtag ? window.gtag : null);
    setConsent(getCurrentConsent());
    setDebugInfo(info);

    console.log('🔍 Debug info refreshed:', info);
  };

  useEffect(() => {
    // Check immediately
    refreshDebugInfo();

    // Check again after a delay (gtag might load asynchronously)
    const timer = setTimeout(refreshDebugInfo, 1000);

    return () => clearTimeout(timer);
  }, []);

  const testPageview = () => {
    console.log('🧪 Testing pageview...');
    pageview('/analytics-test');
  };

  const testEvent = () => {
    console.log('🧪 Testing custom event...');
    event('test_event', 'analytics_test', 'Manual Test', 1);
  };

  const testCustomEvent = () => {
    console.log('🧪 Testing raw gtag event...');
    if (window.gtag) {
      try {
        window.gtag('event', 'custom_test', {
          event_category: 'test',
          event_label: 'Analytics Test Page',
          value: 42,
          send_to: GA_TRACKING_ID
        });
        console.log('✅ Raw gtag event sent');
      } catch (error) {
        console.error('❌ Raw gtag event failed:', error);
      }
    } else {
      console.error('❌ window.gtag not available');
    }
  };

  const runAllTests = () => {
    console.log('🧪 Running all tests...');
    refreshDebugInfo();

    setTimeout(() => testPageview(), 500);
    setTimeout(() => testEvent(), 1000);
    setTimeout(() => testCustomEvent(), 1500);

    console.log('✅ All tests queued - check Network tab for requests');
  };

  return (
    <DebugWrapper title="Google Analytics Test Page">
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>🔬 Google Analytics Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">🔍 Debug Information</h3>
              <Button onClick={refreshDebugInfo} size="sm" variant="outline">
                🔄 Refresh
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Analytics Status</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Tracking ID:</strong> {debugInfo.trackingId || 'Not configured'}
                  </div>
                  <div>
                    <strong>gtag loaded:</strong> {debugInfo.gtag}
                  </div>
                  <div>
                    <strong>gtag type:</strong> {debugInfo.gtagType}
                  </div>
                  <div>
                    <strong>dataLayer:</strong> {debugInfo.dataLayer}
                  </div>
                  <div>
                    <strong>Has Consent:</strong> {debugInfo.hasConsent ? '✅ Yes' : '❌ No'}
                  </div>
                  <div>
                    <strong>Environment:</strong> {process.env.NODE_ENV}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {debugInfo.timestamp}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Consent Details</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Analytics:</strong> {consent?.analytics ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Advertising:</strong> {consent?.advertising ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Necessary:</strong> {consent?.necessary ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {consent?.timestamp ? new Date(consent.timestamp).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Test Analytics Events</h3>
              <div className="space-y-3">
                <div>
                  <Button onClick={testPageview} className="w-full">
                    📊 Test Pageview
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sends a page_view event to GA4
                  </p>
                </div>

                <div>
                  <Button onClick={testEvent} variant="outline" className="w-full">
                    🎯 Test Custom Event
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sends a test_event to GA4
                  </p>
                </div>

                <div>
                  <Button onClick={testCustomEvent} variant="secondary" className="w-full">
                    🔧 Test Raw gtag Event
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct gtag call for testing
                  </p>
                </div>

                <div className="border-t pt-3 mt-3">
                  <Button onClick={runAllTests} variant="primary" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    🚀 Run All Tests
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Runs all tests sequentially (check Network tab)
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Accept analytics cookies if not done already</li>
                <li>Open Browser DevTools → Network tab</li>
                <li>Filter by "google-analytics" or "collect"</li>
                <li>Click test buttons above</li>
                <li>Verify requests are sent to GA4</li>
                <li>Check GA4 Real-time reports (takes 1-2 minutes)</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded text-sm">
                <strong>✅ Expected Behavior:</strong><br />
                • Network requests to www.google-analytics.com/g/collect<br />
                • Response status: <code>204 No Content</code><br />
                • Console logs: "📊 Sending pageview" / "🎯 Sending event"<br />
                • No CSP errors in console<br />
                • Events appear in GA4 Real-time reports (1-2 min delay)
              </div>

              <div className="bg-orange-50 p-3 rounded text-sm">
                <strong>🐛 Troubleshooting:</strong><br />
                • If gtag shows "❌ Not loaded": Click refresh or wait<br />
                • If no consent: Accept analytics cookies first<br />
                • If no requests: Check console for errors<br />
                • Status 204 = Success, Status 400+ = Error<br />
                • Use Network tab filter: "google-analytics" or "collect"
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DebugWrapper>
  );
}