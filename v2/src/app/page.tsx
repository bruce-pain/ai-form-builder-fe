import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>AI Form Builder</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button>Get started</Button>
          <Button variant="outline">Log in</Button>
        </CardContent>
      </Card>
    </div>
  );
}
