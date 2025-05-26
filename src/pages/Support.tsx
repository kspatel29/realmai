
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MessageSquare,
  Video,
  Scissors,
} from "lucide-react";
import { useState } from "react";

const Support = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Create mailto link to realmaidevs@gmail.com
    const subject = encodeURIComponent(`[AI Services Support] ${contactSubject}`);
    const body = encodeURIComponent(contactMessage);
    const mailtoLink = `mailto:realmaidevs@gmail.com?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
    
    toast({
      title: "Email client opened",
      description: "Your default email client has been opened with your message pre-filled.",
    });
    
    setContactSubject("");
    setContactMessage("");
  };

  const faqs = [
    {
      question: "How do I upload a video for dubbing?",
      answer:
        "Go to the Video Dubbing section, click on the Upload tab, and follow the instructions to upload your video. We support MP4, MOV, and AVI formats up to 500MB.",
    },
    {
      question: "What languages are available for dubbing?",
      answer:
        "We support over 50 languages for dubbing, including Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, and many more.",
    },
    {
      question: "How accurate are the subtitles?",
      answer:
        "Our AI-powered subtitle generation provides high accuracy for most common languages. You can always edit the generated subtitles for any corrections or adjustments.",
    },
    {
      question: "How does the clips generator work?",
      answer:
        "Our clips generator uses AI to analyze your video and identify the most engaging moments. It then creates short clips that are perfect for social media platforms like TikTok, Instagram, and YouTube Shorts.",
    },
    {
      question: "How many credits do I need for each service?",
      answer:
        "Video dubbing typically uses 10 credits per minute of video per language. Subtitle generation uses 5 credits per minute per language. Clips generation uses 15 credits per video regardless of length.",
    },
    {
      question: "Can I use my own voice for dubbing?",
      answer:
        "Yes! We offer voice cloning technology that allows you to use your own voice for dubbing in different languages. Simply provide a 3-5 minute sample of your voice.",
    },
    {
      question: "How do I change my subscription plan?",
      answer:
        "Go to Settings > Billing to view and change your current subscription plan. You can upgrade at any time, and downgrades will take effect at the end of your current billing cycle.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel your subscription at any time from the Billing section in Settings. Your subscription will remain active until the end of your current billing period.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes! All new users get 75 free credits to try our services. No credit card required for the free tier.",
    }
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Help & Support
        </h1>
        <p className="text-muted-foreground">
          Find answers to common questions or get in touch with our support team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
              <CardDescription>
                Search for answers to common questions about our services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Input
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No results found for "{searchTerm}"
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setSearchTerm("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </Accordion>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4">
                <Video className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle className="text-base">Video Dubbing</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  Learn how to use our AI-powered dubbing to reach global audiences.
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="link" className="px-0 text-red-600" asChild>
                  <a
                    href="https://www.youtube.com/watch?v=194769JxDzE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Tutorial
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4">
                <MessageSquare className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle className="text-base">Subtitles</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  Generate accurate subtitles in multiple languages automatically.
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="link" className="px-0 text-purple-600" asChild>
                  <a
                    href="https://www.youtube.com/watch?v=194769JxDzE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Tutorial
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4">
                <Scissors className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle className="text-base">Clips Generator</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  Create viral clips from your long-form content automatically.
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button variant="link" className="px-0 text-orange-600" asChild>
                  <a
                    href="https://www.youtube.com/watch?v=194769JxDzE"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Tutorial
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Contact Support</span>
              </CardTitle>
              <CardDescription>
                Get personalized help from our support team at realmaidevs@gmail.com
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's your question about?"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question in detail"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;
