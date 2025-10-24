import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import UploadSection from "@/components/UploadSection";
import ResultCard from "@/components/ResultCard";
import { LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  issue_type: string;
  location: string;
  confidence: number;
}

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleAnalysisComplete = (analysisResult: AnalysisResult) => {
    setResult(analysisResult);
  };

  const handleSave = () => {
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CivicClean</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
          AI-Powered Civic Issue Detection
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Report civic problems like potholes, broken infrastructure, and more. 
          Our AI extracts issue types and locations automatically from text or images.
        </p>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12">
        {!result ? (
          <UploadSection onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <ResultCard 
            issueType={result.issue_type}
            location={result.location}
            confidence={result.confidence}
            onSave={handleSave}
          />
        )}
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Text Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Describe civic issues in natural language and let AI extract structured data
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Image Recognition</h3>
            <p className="text-sm text-muted-foreground">
              Upload photos of problems and AI will identify the issue and location
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Easy Integration</h3>
            <p className="text-sm text-muted-foreground">
              Structured JSON output ready for frontend integration
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
