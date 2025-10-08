import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { day: "0", users: 100 },
  { day: "1", users: 120 },
  { day: "2", users: 150 },
  { day: "3", users: 180 },
  { day: "4", users: 220 },
  { day: "5", users: 280 },
  { day: "6", users: 320 },
  { day: "7", users: 380 },
  { day: "8", users: 420 },
  { day: "9", users: 480 },
  { day: "10", users: 540 },
  { day: "11", users: 600 },
  { day: "12", users: 650 },
  { day: "13", users: 680 },
  { day: "14", users: 720 },
  { day: "15", users: 750 },
  { day: "16", users: 780 },
  { day: "17", users: 810 },
  { day: "18", users: 840 },
  { day: "19", users: 870 },
  { day: "20", users: 890 },
  { day: "21", users: 910 },
  { day: "22", users: 930 },
];

export default function ActiveUsersChart() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Active Users</h3>
        <div className="flex gap-4">
          <button className="text-sm text-foreground font-medium border-b-2 border-primary pb-1" data-testid="tab-active-users">
            Active Users
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground pb-1" data-testid="tab-magic-links">
            Magic Links
          </button>
          <button className="text-sm text-muted-foreground hover:text-foreground pb-1" data-testid="tab-sms-otp">
            SMS OTP
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${value / 100}00M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#colorUsers)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
