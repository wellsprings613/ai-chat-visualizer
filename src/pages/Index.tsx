import { useState } from "react";
import { Plus, FileText, MessageSquare, Users, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UniversalUploadZone } from "@/components/upload/UniversalUploadZone";

const Index = () => {
  const [showUpload, setShowUpload] = useState(false);

  // Sample data - in a real app, this would come from your backend
  const projects = [
    {
      id: 1,
      title: "AI Research Discussion",
      type: "ChatGPT",
      messages: 45,
      lastUpdated: "2 hours ago",
      topics: ["Machine Learning", "Ethics", "Future Tech"]
    },
    {
      id: 2,
      title: "Product Strategy Session",
      type: "Claude",
      messages: 23,
      lastUpdated: "1 day ago",
      topics: ["Product Management", "Strategy", "Roadmap"]
    },
    {
      id: 3,
      title: "Code Review Chat",
      type: "Generic",
      messages: 67,
      lastUpdated: "3 days ago",
      topics: ["Programming", "Code Review", "Best Practices"]
    }
  ];

  if (showUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Import AI Conversations
                </h1>
                <p className="text-lg text-muted-foreground">
                  Upload your conversation files to create an interactive whiteboard
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowUpload(false)}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Upload Interface */}
          <div className="max-w-4xl mx-auto">
            <UniversalUploadZone />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            AI Conversation Whiteboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Transform your AI conversations into interactive visual experiences
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer border-2 border-dashed border-primary/20 hover:border-primary/40 hover:scale-105"
            onClick={() => setShowUpload(true)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Upload New Conversation</CardTitle>
              <CardDescription>
                Import ChatGPT, Claude, or other AI conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Choose Files
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
            onClick={() => setShowUpload(true)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-lg">Paste Conversation</CardTitle>
              <CardDescription>
                Directly paste your conversation text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Paste Text
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Browse Gallery</CardTitle>
              <CardDescription>
                Explore public conversation whiteboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Recent Projects</h2>
            <Button variant="ghost">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{project.type}</Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-1" />
                      {project.messages}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>
                    Last updated {project.lastUpdated}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Topics:</div>
                    <div className="flex flex-wrap gap-1">
                      {project.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">Ready to visualize your conversations?</h3>
              <p className="text-primary-foreground/80 mb-4">
                Upload your first AI conversation and see it come to life on an interactive whiteboard
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setShowUpload(true)}
              >
                Get Started Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
