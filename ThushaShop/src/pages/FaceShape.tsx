
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Upload, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useUser, FaceShape as FaceShapeType } from "@/context/UserContext";
import { faceShapeGuide } from "@/data/products";
import { motion } from "framer-motion";

const FaceShapePage = () => {
  const { user, setUserFaceShape } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzingFace, setAnalyzingFace] = useState(false);
  const [faceShape, setFaceShape] = useState<FaceShapeType | null>(null);
  const [showResults, setShowResults] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Access Error",
        description: "Could not access your camera. Please check permissions or use the upload method.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/png");
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    startCamera();
  };

  const resetUpload = () => {
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeImage = () => {
    const imageToAnalyze = capturedImage || filePreview;
    if (!imageToAnalyze) {
      toast({
        title: "No Image Selected",
        description: "Please upload or capture an image first.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingFace(true);

    // Simulate face shape analysis with a random result (in a real app, this would be an API call)
    setTimeout(() => {
      const shapes: FaceShapeType[] = ["oval", "round", "square", "heart", "diamond", "triangle", "oblong"];
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      
      setFaceShape(randomShape);
      setUserFaceShape(randomShape); // Save to user context
      setAnalyzingFace(false);
      setShowResults(true);

      toast({
        title: "Analysis Complete",
        description: `Your face shape appears to be ${randomShape}.`,
      });
    }, 2000);
  };

  const viewRecommendations = () => {
    navigate("/catalog");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Face Shape Analyzer</h1>
      <p className="text-muted-foreground mb-8">
        Find the perfect frames for your face shape. Upload a photo or use your camera
        to analyze your face shape and get personalized recommendations.
      </p>

      {showResults ? (
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-background rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 capitalize">
                  Your Face Shape: {faceShape}
                </h2>
                <p className="mb-6">{faceShapeGuide[faceShape as keyof typeof faceShapeGuide]?.description}</p>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Characteristics</h3>
                  <ul className="space-y-1 list-disc pl-5">
                    {faceShapeGuide[faceShape as keyof typeof faceShapeGuide]?.characteristics.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Recommended Frames</h3>
                    <ul className="space-y-1 list-disc pl-5">
                      {faceShapeGuide[faceShape as keyof typeof faceShapeGuide]?.recommendedFrames.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Frames to Avoid</h3>
                    <ul className="space-y-1 list-disc pl-5">
                      {faceShapeGuide[faceShape as keyof typeof faceShapeGuide]?.avoidFrames.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Button onClick={viewRecommendations} className="flex items-center">
                    View Recommended Frames <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    Analyze Again
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={capturedImage || filePreview || faceShapeGuide[faceShape as keyof typeof faceShapeGuide]?.image}
                  alt="Face shape example"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">All Face Shape Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(faceShapeGuide).map(([shape, info]) => (
                <div 
                  key={shape} 
                  className={`bg-background rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                    shape === faceShape ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <div className="aspect-square relative">
                    <img
                      src={info.image}
                      alt={`${shape} face shape`}
                      className="w-full h-full object-cover"
                    />
                    {shape === faceShape && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 capitalize">{shape}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {info.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-background rounded-lg shadow-md overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1">
                <Upload className="h-4 w-4 mr-2" /> Upload Photo
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex-1">
                <Camera className="h-4 w-4 mr-2" /> Use Camera
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="p-6">
              <div className="text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {filePreview ? (
                  <div className="mb-6">
                    <div className="relative w-full aspect-square max-w-md mx-auto mb-4 rounded-lg overflow-hidden">
                      <img
                        src={filePreview}
                        alt="Uploaded face"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button variant="outline" onClick={resetUpload}>
                      Choose Different Photo
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-border rounded-lg p-8 mb-6 cursor-pointer hover:bg-accent transition-colors duration-200"
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload Your Photo</h3>
                      <p className="text-muted-foreground text-sm max-w-md mb-4">
                        For best results, use a front-facing photo with your face clearly visible and
                        hair pulled back from your face.
                      </p>
                      <Button>Select Image</Button>
                    </div>
                  </div>
                )}
                
                {filePreview && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      onClick={analyzeImage} 
                      disabled={analyzingFace}
                      className="w-full"
                    >
                      {analyzingFace ? "Analyzing..." : "Analyze Face Shape"}
                    </Button>
                  </motion.div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="camera" className="p-6">
              <div className="text-center">
                {!isCameraActive && !capturedImage ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 mb-6">
                    <div className="flex flex-col items-center">
                      <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Use Your Camera</h3>
                      <p className="text-muted-foreground text-sm max-w-md mb-4">
                        We'll use your webcam to take a photo. Make sure you're in good lighting and
                        your face is clearly visible.
                      </p>
                      <Button onClick={startCamera}>Start Camera</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    {isCameraActive ? (
                      <div className="relative w-full aspect-square max-w-md mx-auto mb-4 rounded-lg overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-square max-w-md mx-auto mb-4 rounded-lg overflow-hidden">
                        <img
                          src={capturedImage || ""}
                          alt="Captured face"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-center gap-3">
                      {isCameraActive ? (
                        <Button onClick={captureImage}>Take Photo</Button>
                      ) : (
                        <Button variant="outline" onClick={resetCamera}>
                          Retake Photo
                        </Button>
                      )}
                      {!isCameraActive && capturedImage && (
                        <Button onClick={analyzeImage} disabled={analyzingFace}>
                          {analyzingFace ? "Analyzing..." : "Analyze Face Shape"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="p-6 bg-accent">
            <h3 className="font-semibold mb-2">Tips for Best Results</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-600 shrink-0" />
                Use a well-lit environment with even lighting on your face
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-600 shrink-0" />
                Pull your hair back so your entire face is visible
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-600 shrink-0" />
                Remove glasses and face the camera directly
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-600 shrink-0" />
                Maintain a neutral expression (no smiling)
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceShapePage;
