import { ResumeData } from "@/types";

/**
 * Sample resume data for testing and demonstration
 */
export const sampleResumeData: ResumeData = {
  personalInfo: {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    linkedIn: "linkedin.com/in/sarahjohnson",
  },
  summary:
    "Experienced software engineer with 5+ years building scalable web applications. Proficient in React, Node.js, and cloud technologies. Led multiple projects that improved system performance by 40%.",
  workExperience: [
    {
      company: "TechCorp Inc.",
      title: "Senior Software Engineer",
      startDate: "2021-01",
      endDate: "Present",
      bullets: [
        "Led development of microservices architecture serving 1M+ daily active users",
        "Optimized database queries reducing API response time by 40%",
        "Mentored team of 3 junior engineers and conducted code reviews",
        "Implemented CI/CD pipelines reducing deployment time by 60%",
        "Collaborated with product team to deliver features on time and within budget",
      ],
    },
    {
      company: "StartupXYZ",
      title: "Full Stack Developer",
      startDate: "2019-06",
      endDate: "2020-12",
      bullets: [
        "Built responsive web applications using React and Node.js",
        "Designed and implemented RESTful APIs handling 100K+ requests per day",
        "Worked with AWS services including EC2, S3, and Lambda",
        "Participated in agile development process with 2-week sprints",
      ],
    },
    {
      company: "WebDev Agency",
      title: "Junior Developer",
      startDate: "2018-01",
      endDate: "2019-05",
      bullets: [
        "Developed client websites using HTML, CSS, and JavaScript",
        "Assisted in maintaining legacy codebase and fixing bugs",
        "Learned modern frameworks including React and Vue.js",
      ],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "2017-05",
    },
  ],
  skills: [
    "React",
    "Node.js",
    "TypeScript",
    "JavaScript",
    "Python",
    "AWS",
    "Docker",
    "PostgreSQL",
    "MongoDB",
    "Git",
    "Agile",
    "CI/CD",
  ],
  certifications: [
    "AWS Certified Solutions Architect (2022)",
    "Scrum Master Certification (2021)",
  ],
};

