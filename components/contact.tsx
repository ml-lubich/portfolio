import { Mail, Phone, MapPin, Calendar, Linkedin, Github, GraduationCap, FileText } from "lucide-react"
import { AnimatedSection } from "./animated-section"

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "michaelle.lubich@gmail.com",
    href: "mailto:michaelle.lubich@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (415) 275-0094",
    href: "tel:+14152750094",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "San Francisco Bay Area",
    href: null,
  },
]

const socialLinks = [
  { icon: Calendar, label: "Schedule a Call", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: GraduationCap, label: "Google Scholar", href: "https://scholar.google.com" },
]

export function Contact() {
  return (
    <AnimatedSection id="contact" className="py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            {"Let's Connect"}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Ready to collaborate on{" "}
            <span className="gradient-text">innovative projects</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            {"Ready to collaborate on innovative projects and drive technical excellence"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Contact info */}
          <AnimatedSection delay={100}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Download resume */}
              <div className="mt-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <FileText className="h-4 w-4" />
                  Download Resume
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Social + Calendar */}
          <AnimatedSection delay={200}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground">Schedule a Meeting</h3>
              <p className="text-sm text-muted-foreground">
                {"Book a time that works best for you - let's discuss your project or collaboration opportunities"}
              </p>

              <div className="flex flex-1 flex-col justify-end gap-3">
                <p className="text-xs text-muted-foreground">Or find me on these platforms</p>
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                    >
                      <link.icon className="h-4 w-4" />
                      <span className="text-xs">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </AnimatedSection>
  )
}
