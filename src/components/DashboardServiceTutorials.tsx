
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MessageSquare, Scissors } from "lucide-react";

const DashboardServiceTutorials = () => {
  const services = [
    {
      title: "Video Dubbing",
      description: "Transform your videos with AI-powered dubbing in multiple languages",
      icon: Video,
      color: "text-red-600",
      videoId: "194769JxDzE", // YouTube video ID - will be updated when you provide the actual tutorial videos
      bgColor: "bg-red-50"
    },
    {
      title: "Subtitle Generator", 
      description: "Generate accurate subtitles automatically with advanced AI",
      icon: MessageSquare,
      color: "text-purple-600",
      videoId: "194769JxDzE", // YouTube video ID - will be updated when you provide the actual tutorial videos
      bgColor: "bg-purple-50"
    },
    {
      title: "Clips Generator",
      description: "Create viral clips from your long-form content automatically",
      icon: Scissors,
      color: "text-orange-600", 
      videoId: "194769JxDzE", // YouTube video ID - will be updated when you provide the actual tutorial videos
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {services.map((service, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className={`${service.bgColor} rounded-t-lg`}>
            <CardTitle className="flex items-center gap-2">
              <service.icon className={`h-5 w-5 ${service.color}`} />
              <span>{service.title}</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              {service.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${service.videoId}`}
                title={`${service.title} Tutorial`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-b-lg"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardServiceTutorials;
