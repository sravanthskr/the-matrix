import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/login">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Terms and Conditions</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: October 8, 2025</p>

          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using The Matrix API service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
              <p className="text-muted-foreground mb-3">
                The Matrix API provides access to movie data for authorized users. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Use the API only for lawful purposes</li>
                <li>Not exceed the rate limits specified in your plan (100 requests/day, 3,000 requests/month for free tier)</li>
                <li>Not share your API key with unauthorized parties</li>
                <li>Not attempt to circumvent any security measures</li>
                <li>Not use the service to distribute malicious content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. API Key and Account Security</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your API key and account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Rate Limits and Usage</h2>
              <p className="text-muted-foreground">
                Free tier accounts are limited to 100 requests per day and 3,000 requests per month. Exceeding these limits may result in temporary suspension of service. We reserve the right to modify these limits with notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Accuracy</h2>
              <p className="text-muted-foreground">
                While we strive to provide accurate movie data, we do not guarantee the accuracy, completeness, or reliability of any information provided through the API. The service is provided "as is" without warranties of any kind.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content and data provided through The Matrix API, including but not limited to movie information, remains the property of their respective owners. You may not claim ownership of this data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-3">
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Reverse engineer, decompile, or disassemble the API</li>
                <li>Use the API to build a competing service</li>
                <li>Scrape or harvest data beyond API limits</li>
                <li>Sell, lease, or sublicense your API access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Service Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify, suspend, or discontinue any part of the service at any time with or without notice. We will not be liable for any modification, suspension, or discontinuation of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, including breach of these terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall The Matrix API, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms and Conditions, please contact us through the dashboard support section.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              By using The Matrix API, you acknowledge that you have read and understood these terms and agree to be bound by them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
