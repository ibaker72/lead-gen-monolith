import { ClipboardList, Zap, PhoneCall } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

interface HowItWorksProps {
  nicheName: string
}

export function HowItWorks({ nicheName }: HowItWorksProps) {
  const steps: Step[] = [
    {
      number: '1',
      icon: ClipboardList,
      title: 'Tell Us What You Need',
      description: 'Fill out the short form above — takes about 60 seconds. No account required.',
    },
    {
      number: '2',
      icon: Zap,
      title: 'We Match You Instantly',
      description: `Our system finds the best available licensed ${nicheName.toLowerCase()} contractors in your area.`,
    },
    {
      number: '3',
      icon: PhoneCall,
      title: 'Expert Calls Within 60 Min',
      description: `A vetted local ${nicheName.toLowerCase()} pro calls you — no waiting, no call centers.`,
    },
  ]

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 text-center">How It Works</h2>
        <p className="text-center text-slate-500 mt-2 mb-12 max-w-xl mx-auto">
          Getting matched with a trusted {nicheName.toLowerCase()} expert takes under 60 seconds.
        </p>

        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-slate-200"
            aria-hidden="true"
          />

          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="flex flex-col items-center text-center relative">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center relative z-10">
                    <Icon className="w-9 h-9 text-white" aria-hidden="true" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold z-20">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
