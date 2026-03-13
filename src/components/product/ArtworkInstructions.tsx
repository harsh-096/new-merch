"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileDown,
  Palette,
  Ruler,
  FileCheck,
  Layers,
  Monitor,
} from "lucide-react";

interface ArtworkInstructionsProps {
  instructions?: string | null;
  templateUrl?: string | null;
  productName: string;
}

const defaultSteps = [
  {
    icon: FileDown,
    title: "Download Template",
    description:
      "Start by downloading our artwork template to ensure your design fits perfectly.",
  },
  {
    icon: Ruler,
    title: "Set Up Document",
    description:
      "Set your document resolution to 300 DPI for optimal print quality. Ensure correct dimensions.",
  },
  {
    icon: Layers,
    title: "Include Bleed",
    description:
      "Add 3mm bleed on all sides of your artwork. This prevents white edges after trimming.",
  },
  {
    icon: Monitor,
    title: "Safe Area",
    description:
      "Keep all important text and logos at least 5mm from the trim edge to avoid being cut off.",
  },
  {
    icon: Palette,
    title: "Use CMYK Colours",
    description:
      "Convert all colours to CMYK colour mode. RGB colours may appear differently when printed.",
  },
  {
    icon: FileCheck,
    title: "Export as PDF",
    description:
      "Export your final artwork as a high-resolution PDF (PDF/X-1a or PDF/X-4 recommended).",
  },
];

export default function ArtworkInstructions({
  instructions,
  templateUrl,
  productName,
}: ArtworkInstructionsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary-600" />
          <span className="font-medium text-gray-900">
            How to Create Your Artwork
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="p-5">
          {templateUrl && (
            <a
              href={templateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition mb-5"
            >
              <FileDown className="w-4 h-4" />
              Download {productName} Template
            </a>
          )}

          {instructions ? (
            <div className="prose prose-sm max-w-none text-gray-600">
              {instructions.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return (
                    <h3 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
                      {line.replace("## ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("- ") || line.match(/^\d+\./)) {
                  return (
                    <p key={i} className="ml-4 my-1">
                      {line}
                    </p>
                  );
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="my-1">{line}</p>;
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {defaultSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {i + 1}. {step.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
