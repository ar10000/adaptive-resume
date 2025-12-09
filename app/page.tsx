import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Truth-Locked Resume
              <span className="block text-primary-200">Tailoring</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-primary-100 sm:text-xl">
              Create perfectly tailored resumes for every job application while
              staying 100% true to your actual experience. Our AI ensures your
              resume matches job descriptions without fabricating qualifications.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button href="/builder" variant="secondary" className="text-lg px-8 py-4">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Step Process */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Three simple steps to your perfect resume
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Upload Your Resume
                  </h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Upload your existing resume in PDF or DOCX format. Our system
                  extracts all your experience, skills, and achievements.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Add Job Description
                  </h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Paste the job description you&apos;re applying for. Our AI
                  analyzes requirements and matches them to your experience.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Get Tailored Resume
                  </h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Receive a perfectly tailored resume that highlights relevant
                  experience and skills while maintaining complete accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Create Your Perfect Resume?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Start tailoring your resume in minutes. No credit card required.
            </p>
            <div className="mt-8">
              <Button href="/builder" variant="primary" className="text-lg px-8 py-4">
                Start Building
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

