"use client";

import React, { useState } from "react";
import { MatchAnalysis as MatchAnalysisType } from "@/types";
import MatchScore from "./MatchScore";

interface MatchAnalysisProps {
  analysis: MatchAnalysisType;
}

export default function MatchAnalysis({ analysis }: MatchAnalysisProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Match Score */}
      <div className="flex items-center justify-center py-6">
        <MatchScore score={analysis.overallScore} size="lg" />
      </div>

      {/* Matched Skills */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Matched Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.matchedSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Keywords */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Missing Keywords
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.missingKeywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      {/* Experience Alignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Experience Alignment
        </h3>

        {/* Strong Matches */}
        {analysis.experienceAlignment.strongMatches.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-green-700">
              Strong Matches
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {analysis.experienceAlignment.strongMatches.map((match, index) => (
                <li key={index}>{match}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Partial Matches */}
        {analysis.experienceAlignment.partialMatches.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-yellow-700">
              Partial Matches
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {analysis.experienceAlignment.partialMatches.map((match, index) => (
                <li key={index}>{match}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Gaps */}
        {analysis.experienceAlignment.gaps.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-red-700">Gaps</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {analysis.experienceAlignment.gaps.map((gap, index) => (
                <li key={index}>{gap}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bridging Strategies Accordion */}
      {analysis.bridgingStrategies.length > 0 && (
        <div>
          <button
            onClick={() =>
              setExpandedSection(
                expandedSection === "strategies" ? null : "strategies"
              )
            }
            className="flex w-full items-center justify-between rounded-lg bg-primary-50 p-4 text-left font-semibold text-primary-900 hover:bg-primary-100"
          >
            <span>Bridging Strategies</span>
            <svg
              className={`h-5 w-5 transition-transform ${
                expandedSection === "strategies" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {expandedSection === "strategies" && (
            <div className="mt-2 space-y-2 rounded-lg bg-white p-4 shadow-sm">
              {analysis.bridgingStrategies.map((strategy, index) => (
                <div
                  key={index}
                  className="border-l-4 border-primary-500 pl-4 text-sm text-gray-700"
                >
                  {strategy}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

