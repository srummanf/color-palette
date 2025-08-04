"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { spaceGrotesk, jetbrainsMono, rubik } from "@/app/fonts";


interface Color {
  hex: string
  rgb: string
}

interface ColorCandidate {
  r: number
  g: number
  b: number
  frequency: number
  spatialWeight: number
  aestheticScore: number
  finalScore: number
}

const PaletteGen = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dominantColors, setDominantColors] = useState<Color[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasteHint, setShowPasteHint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            processImageFile(file);
            setShowPasteHint(false);
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        setShowPasteHint(true);
        setTimeout(() => setShowPasteHint(false), 2000);
      }
    };

    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Enhanced color extraction with balanced frequency and visual impact
  const extractDominantColors = (imageElement: HTMLImageElement): Color[] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const ctx = canvas.getContext("2d");
    if (!ctx) return [];

    // Scale down for performance
    const maxDimension = 300;
    const scale = Math.min(
      maxDimension / imageElement.width,
      maxDimension / imageElement.height
    );

    canvas.width = Math.floor(imageElement.width * scale);
    canvas.height = Math.floor(imageElement.height * scale);
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    const totalPixels = width * height;

    // Step 1: Collect all colors with basic grouping
    const colorMap = new Map<string, ColorCandidate>();

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        if (alpha < 128) continue;

        // Moderate grouping - not too aggressive
        const groupedR = Math.round(r / 15) * 15;
        const groupedG = Math.round(g / 15) * 15;
        const groupedB = Math.round(b / 15) * 15;

        const colorKey = `${groupedR},${groupedG},${groupedB}`;

        if (!colorMap.has(colorKey)) {
          colorMap.set(colorKey, {
            r: groupedR,
            g: groupedG,
            b: groupedB,
            frequency: 0,
            spatialWeight: 0,
            aestheticScore: 0,
            finalScore: 0,
          });
        }

        colorMap.get(colorKey)!.frequency += 1;
      }
    }

    // Step 2: Calculate scores with balanced approach
    const colorCandidates = Array.from(colorMap.values());

    colorCandidates.forEach((color) => {
      // Basic color properties
      const saturation = calculateSaturation(color.r, color.g, color.b);
      const brightness = calculateBrightness(color.r, color.g, color.b);
      const colorfulness = calculateColorfulness(color.r, color.g, color.b);

      // Frequency score (how much of the image this color covers)
      const frequencyScore = color.frequency / totalPixels;

      // Visual impact score - vibrant colors get bonus, but not too much
      let visualImpact = 1.0;

      // Boost highly saturated colors (like bright yellows, greens)
      if (saturation > 0.3) {
        visualImpact *= 1.3;
      }

      // Boost colorful colors over dull ones
      if (colorfulness > 0.2) {
        visualImpact *= 1.2;
      }

      // Don't penalize colors too much for being frequent
      // This helps capture dominant background colors like marble
      const balancedFrequencyScore = Math.sqrt(frequencyScore) * 2;

      // Final score: heavily weight frequency, moderately boost visual impact
      color.finalScore = balancedFrequencyScore * visualImpact;

      // Store individual components for debugging
      color.aestheticScore = visualImpact;
      color.spatialWeight = frequencyScore;
    });

    // Step 3: Select top colors with diversity
    const selectedColors = selectDiverseColors(colorCandidates, 5);

    return selectedColors.map((color) => {
      const hex = `#${color.r.toString(16).padStart(2, "0")}${color.g
        .toString(16)
        .padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
      const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;
      return { hex, rgb };
    });
  };

  // Helper function to check if point is near rule of thirds intersections
  const isNearRuleOfThirds = (
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean => {
    const thirdX = width / 3;
    const thirdY = height / 3;
    const tolerance = Math.min(width, height) * 0.1;

    const intersections = [
      [thirdX, thirdY],
      [2 * thirdX, thirdY],
      [thirdX, 2 * thirdY],
      [2 * thirdX, 2 * thirdY],
    ];

    return intersections.some(
      ([ix, iy]) => Math.abs(x - ix) < tolerance && Math.abs(y - iy) < tolerance
    );
  };

  // Calculate color saturation
  const calculateSaturation = (r: number, g: number, b: number): number => {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    return max === 0 ? 0 : (max - min) / max;
  };

  // Calculate perceived brightness
  const calculateBrightness = (r: number, g: number, b: number): number => {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  // Calculate colorfulness (distance from gray)
  const calculateColorfulness = (r: number, g: number, b: number): number => {
    const avg = (r + g + b) / 3;
    const variance = ((r - avg) ** 2 + (g - avg) ** 2 + (b - avg) ** 2) / 3;
    return Math.sqrt(variance) / 255;
  };

  // Calculate perceptual color difference (Delta E approximation)
  const colorDistance = (c1: ColorCandidate, c2: ColorCandidate): number => {
    const deltaR = c1.r - c2.r;
    const deltaG = c1.g - c2.g;
    const deltaB = c1.b - c2.b;

    // Weighted Euclidean distance approximating perceptual difference
    const avgR = (c1.r + c2.r) / 2;
    const weightR = 2 + avgR / 256;
    const weightG = 4;
    const weightB = 2 + (255 - avgR) / 256;

    return Math.sqrt(
      weightR * deltaR * deltaR +
        weightG * deltaG * deltaG +
        weightB * deltaB * deltaB
    );
  };

  // Select diverse colors that aren't too similar
  const selectDiverseColors = (
    candidates: ColorCandidate[],
    count: number
  ): ColorCandidate[] => {
    if (candidates.length === 0) return [];

    // Sort by final score
    candidates.sort((a, b) => b.finalScore - a.finalScore);

    const selected: ColorCandidate[] = [];
    const minDistance = 40; // Reduced minimum distance to allow more color variety

    for (const candidate of candidates) {
      if (selected.length >= count) break;

      // Check if this color is too similar to already selected colors
      const tooSimilar = selected.some(
        (selected) => colorDistance(candidate, selected) < minDistance
      );

      if (!tooSimilar) {
        selected.push(candidate);
      }
    }

    // If we need more colors, gradually reduce the distance requirement
    let currentMinDistance = minDistance;
    while (
      selected.length < count &&
      selected.length < candidates.length &&
      currentMinDistance > 20
    ) {
      currentMinDistance -= 5;

      const remaining = candidates.filter((c) => !selected.includes(c));

      for (const candidate of remaining) {
        if (selected.length >= count) break;

        const tooSimilar = selected.some(
          (selected) => colorDistance(candidate, selected) < currentMinDistance
        );

        if (!tooSimilar) {
          selected.push(candidate);
        }
      }
    }

    return selected;
  };

  const processImageFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setUploadedImage(imageSrc);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const colors = extractDominantColors(img);
        setDominantColors(colors);
        setIsProcessing(false);
      };
      img.src = imageSrc;
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div
      className={`min-h-[88vh] bg-black text-white flex items-center justify-center p-4 ${spaceGrotesk.className}`}
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Paste Hint */}
        {showPasteHint && (
          <div
            className={`fixed top-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-6 py-3 font-black text-xs border-4 border-black z-50 ${jetbrainsMono.className}`}
          >
            PASTE IMAGE NOW
          </div>
        )}

        {/* Upload Section */}
        <div className="text-center mb-12">
          <div
            onClick={handleUploadClick}
            className="border-4 border-white bg-white text-black p-8 cursor-pointer hover:bg-black hover:text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded"
                  className="max-w-full max-h-48 mx-auto border-4 border-black"
                />
                <p
                  className={`font-black text-xs tracking-wider ${jetbrainsMono.className}`}
                >
                  CLICK TO CHANGE
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-black border-4 border-black flex items-center justify-center">
                  <div className="w-8 h-8 bg-white"></div>
                </div>
                <div>
                  <p
                    className={`font-black text-xs mb-2 tracking-widest ${jetbrainsMono.className}`}
                  >
                    Drop Image
                  </p>
                  <p
                    className={`font-bold text-xs opacity-70 ${jetbrainsMono.className}`}
                  >
                    Or Paste (⌘+V)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center mb-12">
            <div
              className={`inline-block bg-white text-black px-8 py-4 font-black text-xs animate-pulse tracking-widest ${jetbrainsMono.className}`}
            >
              ANALYZING...
            </div>
          </div>
        )}

        {/* Color Results */}
        {dominantColors.length > 0 && !isProcessing && (
          <div className="space-y-8">
            <div className="text-center">
              <h2
                className={`font-black text-sm mb-2 tracking-widest ${jetbrainsMono.className}`}
              >
                COLORS
              </h2>
              <p className={`font-bold text-xs opacity-70 ${rubik.className}`}>
                CLICK TO COPY
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {dominantColors.map((color, index) => (
                <div key={index} className="group">
                  {/* Color Swatch */}
                  <div
                    className="w-full h-32 border-4 border-white cursor-pointer transform transition-all duration-200 hover:scale-105 active:scale-95 mb-4"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyToClipboard(color.hex)}
                  />

                  {/* Color Info */}
                  <div className="space-y-2">
                    <button
                      onClick={() => copyToClipboard(color.hex)}
                      className={`w-full bg-white text-black p-3 font-black text-xs hover:bg-black hover:text-white border-4 border-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] tracking-wider ${jetbrainsMono.className}`}
                    >
                      {color.hex.toUpperCase()}
                    </button>

                    <button
                      onClick={() => copyToClipboard(color.rgb)}
                      className={`w-full bg-black text-white p-3 font-bold text-xs border-4 border-white hover:bg-white hover:text-black transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${rubik.className}`}
                    >
                      {color.rgb.toUpperCase()}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => {
                  const paletteData = {
                    colors: dominantColors.map((color, index) => ({
                      id: index + 1,
                      hex: color.hex,
                      rgb: color.rgb,
                      name: `Color ${index + 1}`,
                    })),
                    extractedAt: new Date().toISOString(),
                    totalColors: dominantColors.length,
                  };

                  const dataStr = JSON.stringify(paletteData, null, 2);
                  const dataBlob = new Blob([dataStr], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(dataBlob);

                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "palette.json";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className={`bg-white text-black px-12 py-4 font-black text-xs hover:bg-black hover:text-white border-4 border-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] tracking-widest ${jetbrainsMono.className}`}
              >
                DOWNLOAD JSON
              </button>
            </div>
          </div>
        )}

        {/* Hidden Elements */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default PaletteGen;
