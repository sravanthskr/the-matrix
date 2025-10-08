import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function DocumentationSection() {
  return (
    <section className="py-12">
      <h3 className="text-2xl font-semibold mb-6">Documentation & support</h3>
      <Card className="p-6 hover-elevate">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">Documentation & support</h4>
            <p className="text-sm text-muted-foreground">
              Learn how to use, connect, and deploy EZ1D by reading our extensive documentation. If you have questions or need assistance, join our community Slack channel to talk to us. We're here to help!
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
