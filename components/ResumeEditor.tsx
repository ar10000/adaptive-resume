"use client";

import { ResumeData } from "@/types";

interface ResumeEditorProps {
  resumeData: ResumeData;
  onUpdate: (updatedData: ResumeData) => void;
}

export default function ResumeEditor({
  resumeData,
  onUpdate,
}: ResumeEditorProps) {
  const updateField = (path: string[], value: any) => {
    const updated = { ...resumeData };
    let current: any = updated;

    for (let i = 0; i < path.length - 1; i++) {
      if (Array.isArray(current[path[i]])) {
        current = current[path[i]];
      } else {
        current = current[path[i]] = { ...current[path[i]] };
      }
    }

    if (Array.isArray(current)) {
      const index = parseInt(path[path.length - 1]);
      current[index] = value;
    } else {
      current[path[path.length - 1]] = value;
    }

    onUpdate(updated);
  };

  return (
    <div className="space-y-6 overflow-y-auto p-6">
      {/* Personal Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Personal Information
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={resumeData.personalInfo.name}
              onChange={(e) =>
                updateField(["personalInfo", "name"], e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={resumeData.personalInfo.email}
              onChange={(e) =>
                updateField(["personalInfo", "email"], e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {resumeData.summary && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Summary</h2>
          <textarea
            value={resumeData.summary}
            onChange={(e) => updateField(["summary"], e.target.value)}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Work Experience */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Work Experience
        </h2>
        <div className="space-y-6">
          {resumeData.workExperience.map((exp, expIndex) => (
            <div key={expIndex} className="border-t border-gray-200 pt-4">
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) =>
                      updateField(
                        ["workExperience", expIndex.toString(), "title"],
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) =>
                      updateField(
                        ["workExperience", expIndex.toString(), "company"],
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Bullets
                </label>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="mt-2 flex gap-2">
                    <textarea
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...exp.bullets];
                        newBullets[bulletIndex] = e.target.value;
                        updateField(
                          ["workExperience", expIndex.toString(), "bullets"],
                          newBullets
                        );
                      }}
                      rows={2}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Skills</h2>
        <textarea
          value={resumeData.skills.join(", ")}
          onChange={(e) =>
            updateField(
              ["skills"],
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Comma-separated skills"
        />
      </div>
    </div>
  );
}

