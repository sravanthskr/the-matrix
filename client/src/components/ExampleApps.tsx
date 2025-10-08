import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiReact, SiNodedotjs, SiGithub, SiMongodb } from "react-icons/si";

const apps = [
  {
    title: "Magic link",
    tech: [
      { name: "React + JS", icon: SiReact, color: "text-[#61DAFB]" },
      { name: "Node", icon: SiNodedotjs, color: "text-[#339933]" },
      { name: "GitHub", icon: SiGithub, color: "text-foreground" },
    ],
  },
  {
    title: "SMS OTP",
    tech: [
      { name: "React + JS", icon: SiReact, color: "text-[#61DAFB]" },
      { name: "Node", icon: SiNodedotjs, color: "text-[#339933]" },
      { name: "GitHub", icon: SiGithub, color: "text-foreground" },
      { name: "Mongo DB", icon: SiMongodb, color: "text-[#47A248]" },
    ],
  },
];

export default function ExampleApps() {
  return (
    <section className="py-12">
      <h3 className="text-2xl font-semibold mb-6">Explore example apps</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {apps.map((app, index) => (
          <Card key={index} className="p-6 space-y-4 hover-elevate" data-testid={`card-${app.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">{app.title}</h4>
              <div className="flex flex-wrap gap-2">
                {app.tech.map((tech, techIndex) => {
                  const Icon = tech.icon;
                  return (
                    <Badge key={techIndex} variant="secondary" className="gap-1.5">
                      <Icon className={`w-3 h-3 ${tech.color}`} />
                      <span className="text-xs">{tech.name}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
