import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
          <h1 className="text-3xl font-bold text-primary mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: October 8, 2025</p>

          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">
                We collect information that you provide directly to us when using The Matrix API:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Account Information:</strong> Email address and password (encrypted)</li>
                <li><strong>API Usage Data:</strong> API requests, endpoints accessed, and usage statistics</li>
                <li><strong>Authentication Data:</strong> Firebase authentication tokens and session data</li>
                <li><strong>Device Information:</strong> Browser type, IP address, and access times</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>To provide, maintain, and improve our API service</li>
                <li>To manage your account and authenticate your identity</li>
                <li>To monitor API usage and enforce rate limits</li>
                <li>To send you technical notices and security alerts</li>
                <li>To respond to your requests and provide customer support</li>
                <li>To detect, prevent, and address technical issues or fraudulent activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                Your data is securely stored using industry-standard encryption methods. We use Firebase Authentication for secure user authentication and Cloudflare Workers for API key management. All API requests are made over HTTPS to ensure data transmission security. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Email Domain Validation</h2>
              <p className="text-muted-foreground">
                To maintain service quality and prevent abuse, we only accept email addresses from verified domains (Gmail, Yahoo, Outlook, etc.). Temporary or disposable email addresses are not permitted for registration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. API Key Privacy</h2>
              <p className="text-muted-foreground">
                Your API key is unique to your account and should be kept confidential. We store API keys securely and never share them with third parties. You are responsible for maintaining the security of your API key. If you believe your key has been compromised, please regenerate it immediately through your dashboard.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We use local storage to maintain your session and remember your preferences (such as "Remember Me" functionality). We do not use third-party tracking cookies or analytics that identify you personally.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>With your consent</li>
                <li>To comply with legal obligations or court orders</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your account information and usage data for as long as your account is active. If you delete your account, we will remove your personal information within 30 days, except where we are required to retain it for legal or security purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Your Rights</h2>
              <p className="text-muted-foreground mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your usage data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our service uses Firebase (Google) for authentication. Please review Firebase's privacy policy to understand how they handle your authentication data. We are not responsible for the privacy practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. We ensure that appropriate safeguards are in place to protect your data in accordance with this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any material changes by email or through a notice on our service. Your continued use of the service after such modifications constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions or concerns about this privacy policy or our data practices, please contact us through the dashboard support section.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              By using The Matrix API, you acknowledge that you have read and understood this privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
