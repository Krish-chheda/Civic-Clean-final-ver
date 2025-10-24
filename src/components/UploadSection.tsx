import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  issue_type: string;
  location: string;
  confidence: number;
}

interface UploadSectionProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const UploadSection = ({ onAnalysisComplete }: UploadSectionProps) => {
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-issue', {
        body: {
          inputType: 'text',
          content: textInput
        }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message.includes('402')) {
          toast.error("AI credits depleted. Please contact support.");
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        onAnalysisComplete(data);
        toast.success("Issue analyzed successfully!");
      }
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      toast.error(error.message || "Failed to analyze text");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSubmit = async () => {
    if (!imageFile || !imagePreview) {
      toast.error("Please upload an image");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-issue', {
        body: {
          inputType: 'image',
          content: imagePreview
        }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message.includes('402')) {
          toast.error("AI credits depleted. Please contact support.");
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        onAnalysisComplete(data);
        toast.success("Image analyzed successfully!");
      }
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Report a Civic Issue</CardTitle>
        <CardDescription>
          Describe the problem or upload an image for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <FileText className="w-4 h-4 mr-2" />
              Text Description
            </TabsTrigger>
            <TabsTrigger value="image">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Describe the issue</Label>
              <Textarea
                id="text-input"
                placeholder="E.g., There's a large pothole on Main Street near the city center in Mumbai..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button 
              onClick={handleTextSubmit} 
              disabled={loading || !textInput.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-input">Upload an image</Label>
              <Input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            {imagePreview && (
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            <Button 
              onClick={handleImageSubmit} 
              disabled={loading || !imageFile}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Image"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UploadSection;