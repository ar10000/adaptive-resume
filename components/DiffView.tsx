"use client";

import { ResumeData } from "@/types";

interface DiffViewProps {
  originalResume: ResumeData;
  tailoredResume: ResumeData;
}

export default function DiffView({
  originalResume,
  tailoredResume,
}: DiffViewProps) {
  // Find differences in work experience bullets
  const getDifferences = () => {
    const differences: Array<{
      company: string;
      title: string;
      originalBullets: string[];
      tailoredBullets: string[];
      changed: boolean;
    }> = [];

    originalResume.workExperience.forEach((originalExp, index) => {
      const tailoredExp = tailoredResume.workExperience.find(
        (exp) =>
          exp.company === originalExp.company &&
          exp.startDate === originalExp.startDate
      );

      if (tailoredExp) {
        const originalBullets = originalExp.bullets.map((b) =>
          b.replace(/\[LESS_RELEVANT\]/g, "").trim()
        );
        const tailoredBullets = tailoredExp.bullets.map((b) =>
          b.replace(/\[LESS_RELEVANT\]/g, "").trim()
        );

        // Check if bullets changed
        const changed =
          JSON.stringify(originalBullets) !== JSON.stringify(tailoredBullets);

        differences.push({
          company: originalExp.company,
          title: originalExp.title,
          originalBullets,
          tailoredBullets,
          changed,
        });
      }
    });

    return differences;
  };

  const differences = getDifferences();
  const hasChanges = differences.some((diff) => diff.changed);

  if (!hasChanges) {
    return (
      <div className="rounded-lg bg-green-50 p-4">
        <p className="text-sm text-green-800">
          No changes detected. Your resume is already well-aligned with the job description.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          What&apos;s Changed
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Compare your original resume bullets with the tailored versions. Only
          phrasing and emphasis have changed—no new skills or experience were
          added.
        </p>
      </div>

      {differences
        .filter((diff) => diff.changed)
        .map((diff, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900">{diff.title}</h4>
              <p className="text-sm text-gray-600">{diff.company}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Original */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    ORIGINAL
                  </span>
                </div>
                <div className="space-y-2 rounded-md bg-gray-50 p-3">
                  {diff.originalBullets.map((bullet, bulletIndex) => (
                    <div
                      key={bulletIndex}
                      className="text-sm text-gray-700"
                    >
                      • {bullet}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailored */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-primary-600">
                    TAILORED
                  </span>
                </div>
                <div className="space-y-2 rounded-md bg-primary-50 p-3">
                  {diff.tailoredBullets.map((bullet, bulletIndex) => {
                    const originalBullet =
                      diff.originalBullets[bulletIndex] || "";
                    const isChanged = bullet !== originalBullet;

                    return (
                      <div
                        key={bulletIndex}
                        className={`text-sm ${
                          isChanged
                            ? "text-primary-900 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        • {bullet}
                        {isChanged && (
                          <span className="ml-2 text-xs text-primary-600">
                            (rewritten)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

