"use client"

import { SkillCard } from "@/components/ui/skill-card"
import { Carousel3D } from "@/components/ui/carousel-3d"
import { useInView } from "react-intersection-observer"
import { CardReveal } from "@/components/ui/unified-reveal"
import { SectionWrapper } from "@/components/ui/section-wrapper"
import { SectionHeader } from "@/components/ui/section-header"
import { skillCategories } from "@/lib/data"

export function Skills() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const renderSkillCard = (category: typeof skillCategories[0], index: number, isActive: boolean) => (
    <SkillCard
      title={category.title}
      icon={category.icon}
      skills={category.skills}
      gradient={category.gradient}
      className="w-full h-full"
    />
  )

  return (
    <SectionWrapper id="skills" maxWidth="7xl" delay={150} ref={ref}>
      <SectionHeader 
        title="Technical"
        subtitle="Skills"
        description="Comprehensive expertise across the full technology stack"
      />

      <CardReveal delay={200}>
        <Carousel3D
          items={skillCategories}
          renderCard={renderSkillCard}
        />
      </CardReveal>
    </SectionWrapper>
  )
}
