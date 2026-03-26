import HeroSection from '../components/sections/HeroSection'
import CategoryRail from '../components/sections/CategoryRail'
import ProductShowcase from '../components/sections/ProductShowcase'
import CapabilitiesSection from '../components/sections/CapabilitiesSection'
import ProcessSection from '../components/sections/ProcessSection'
import TestimonialsSection from '../components/sections/TestimonialsSection'
import CtaSection from '../components/sections/CtaSection'

function HomePage() {
  return (
    <div className="page-stack">
      <HeroSection />
      <CategoryRail />
      <ProductShowcase />
      <CapabilitiesSection />
      <ProcessSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  )
}

export default HomePage