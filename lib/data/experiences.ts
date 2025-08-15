export interface Experience {
  title: string
  company: string
  period: string
  location: string
  highlights: string[]
  technologies: string[]
  gradient: string
}

export const experiences: Experience[] = [
  {
    title: "Software Development Engineer in Test & Developer",
    company: "Polaris Wireless",
    period: "September 2024 - Present",
    location: "San Francisco, CA",
    highlights: [
      "Engineered robust CI/CD pipelines using Jenkins, reducing deployment time by 50%",
      "Led and mentored a cross-functional team of 4 engineers across QA, DevOps, and backend",
      "Designed scalable data ingestion pipelines processing over 10 million records daily",
      "Developed comprehensive testing frameworks increasing test coverage by 35%",
      "Migrated Ant-based build systems to Maven, optimizing dependency management by 25%",
    ],
    technologies: ["Jenkins", "Python", "Maven", "Apache Spark", "Hadoop", "PyTest", "JUnit", "Ansible"],
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Software Development Engineer in Test, CoreOS - File Systems",
    company: "Apple",
    period: "January 2023 - July 2024",
    location: "Cupertino, CA",
    highlights: [
      "Migrated and optimized 20+ legacy test scripts achieving 300% automation efficiency improvement",
      "Managed and resolved over 1,100 high-priority tickets for APFS updates impacting 100M+ macOS users",
      "Implemented streamlined workflows using Ansible, reducing manual intervention by 30%",
      "Designed modular Python test suites, enhancing code reusability by 40%",
      "Authored technical documentation reducing onboarding time for new hires by 50%",
    ],
    technologies: ["Python", "Ansible", "APFS", "macOS", "Git", "Automated Testing", "CI/CD"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Walmart",
    period: "May 2022 - August 2022",
    location: "Sunnyvale, CA",
    highlights: [
      "Built and optimized REST APIs managing over 50,000 data items daily with 60% latency reduction",
      "Enhanced backend performance by 300% using optimization techniques in Java and Spring Boot",
      "Designed user flows using Figma and implemented them in Angular, achieving 25% increase in user satisfaction",
      "Developed scalable advertisement delivery systems increasing revenue by $2 million annually",
      "Automated recurring tasks, saving over 1,400 work hours annually and reducing costs by $4 million",
    ],
    technologies: ["Java", "Spring Boot", "Angular", "REST APIs", "Figma", "AdTech"],
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Software Engineer Intern, Machine Learning",
    company: "Lawrence Berkeley National Laboratory",
    period: "May 2021 - August 2021",
    location: "Berkeley, CA",
    highlights: [
      "Enhanced ML model clustering accuracy from 82% to 87% using K-Means and hierarchical clustering",
      "Performed extensive data correlation analysis, identifying trends and improving hypothesis testing",
      "Streamlined data processing workflows, saving over 200 hours annually in repetitive tasks",
      "Built reusable data visualization libraries, improving reporting efficiency across multiple projects",
    ],
    technologies: ["Python", "Machine Learning", "K-Means", "Data Analysis", "Visualization", "Jupyter"],
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Software Engineer Intern",
    company: "Honda Innovations",
    period: "January 2021 - May 2021",
    location: "Mountain View, CA",
    highlights: [
      "Engineered fleet optimization solutions achieving 500% improvement in medical supply delivery rates",
      "Implemented Agile methodologies and facilitated stand-ups, increasing team productivity by 30%",
      "Automated CI/CD workflows using GitHub Actions, improving code integration efficiency by 35%",
      "Led high-impact Capstone Project delivering $1 million cost-saving outcome through data-driven decisions",
      "Collaborated with cross-functional teams ensuring alignment on strategic goals",
    ],
    technologies: ["GitHub Actions", "Agile", "Fleet Optimization", "Data Analytics", "CI/CD"],
    gradient: "from-orange-500 to-red-500",
  },
]