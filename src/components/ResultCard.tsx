import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ResultCardProps {
  issueType: string;
  location: string;
  confidence: number;
  onSave?: () => void;
}

const ResultCard = ({ issueType, location, confidence, onSave }: ResultCardProps) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to save issues");
        return;
      }

      const { error } = await supabase.from('issues').insert({
        user_id: user.id,
        issue_type: issueType,
        location: location,
        confidence_score: confidence,
        status: 'pending'
      });

      if (error) throw error;

      toast.success("Issue saved successfully!");
      if (onSave) onSave();
    } catch (error: any) {
      console.error('Error saving issue:', error);
      toast.error(error.message || "Failed to save issue");
    } finally {
      setSaving(false);
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "bg-secondary text-secondary-foreground";
    if (conf >= 0.6) return "bg-yellow-500 text-white";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-secondary" />
          Analysis Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Issue Type</p>
              <p className="text-lg font-semibold capitalize">{issueType}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-lg font-semibold">{location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">Confidence Score</p>
              <Badge className={getConfidenceColor(confidence)}>
                {Math.round(confidence * 100)}% Confident
              </Badge>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? "Saving..." : "Save to Database"}
        </Button>

        <div className="text-xs text-muted-foreground text-center pt-2">
          This data can be easily integrated with your frontend application
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;