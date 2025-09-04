"use client"

import React from 'react'

// Elephant Illustration - Friendly and approachable
export const ElephantIllustration = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="200" cy="150" r="140" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" opacity="0.3"/>
    
    {/* Elephant body */}
    <ellipse cx="200" cy="180" rx="60" ry="40" fill="#94A3B8" opacity="0.8"/>
    
    {/* Elephant head */}
    <ellipse cx="200" cy="140" rx="45" ry="35" fill="#94A3B8" opacity="0.9"/>
    
    {/* Elephant trunk */}
    <path d="M200 120 Q180 100 160 90 Q150 85 155 80 Q160 75 170 80 Q180 85 190 90 Q200 95 200 105" 
          fill="#94A3B8" opacity="0.9"/>
    
    {/* Elephant ears */}
    <ellipse cx="170" cy="130" rx="20" ry="25" fill="#94A3B8" opacity="0.8"/>
    <ellipse cx="230" cy="130" rx="20" ry="25" fill="#94A3B8" opacity="0.8"/>
    
    {/* Elephant eyes */}
    <circle cx="185" cy="135" r="3" fill="#1E293B"/>
    <circle cx="215" cy="135" r="3" fill="#1E293B"/>
    
    {/* Elephant legs */}
    <rect x="175" y="210" width="12" height="25" rx="6" fill="#94A3B8" opacity="0.8"/>
    <rect x="195" y="210" width="12" height="25" rx="6" fill="#94A3B8" opacity="0.8"/>
    <rect x="215" y="210" width="12" height="25" rx="6" fill="#94A3B8" opacity="0.8"/>
    <rect x="235" y="210" width="12" height="25" rx="6" fill="#94A3B8" opacity="0.8"/>
    
    {/* Decorative elements */}
    <circle cx="120" cy="80" r="8" fill="#FBBF24" opacity="0.6"/>
    <circle cx="280" cy="100" r="6" fill="#F59E0B" opacity="0.5"/>
    <circle cx="100" cy="200" r="5" fill="#FCD34D" opacity="0.4"/>
  </svg>
)

// Lion Illustration - Bold and confident
export const LionIllustration = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="200" cy="150" r="140" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" opacity="0.3"/>
    
    {/* Lion mane */}
    <circle cx="200" cy="140" r="50" fill="#F59E0B" opacity="0.8"/>
    
    {/* Lion head */}
    <circle cx="200" cy="150" r="35" fill="#FCD34D" opacity="0.9"/>
    
    {/* Lion ears */}
    <circle cx="180" cy="120" r="12" fill="#FCD34D" opacity="0.9"/>
    <circle cx="220" cy="120" r="12" fill="#FCD34D" opacity="0.9"/>
    
    {/* Lion eyes */}
    <circle cx="190" cy="145" r="4" fill="#1E293B"/>
    <circle cx="210" cy="145" r="4" fill="#1E293B"/>
    
    {/* Lion nose */}
    <ellipse cx="200" cy="160" rx="3" ry="2" fill="#1E293B"/>
    
    {/* Lion mouth */}
    <path d="M200 165 Q195 170 190 165" stroke="#1E293B" strokeWidth="2" fill="none"/>
    <path d="M200 165 Q205 170 210 165" stroke="#1E293B" strokeWidth="2" fill="none"/>
    
    {/* Lion body */}
    <ellipse cx="200" cy="200" rx="40" ry="30" fill="#FCD34D" opacity="0.8"/>
    
    {/* Lion legs */}
    <rect x="180" y="220" width="10" height="20" rx="5" fill="#FCD34D" opacity="0.8"/>
    <rect x="195" y="220" width="10" height="20" rx="5" fill="#FCD34D" opacity="0.8"/>
    <rect x="210" y="220" width="10" height="20" rx="5" fill="#FCD34D" opacity="0.8"/>
    <rect x="225" y="220" width="10" height="20" rx="5" fill="#FCD34D" opacity="0.8"/>
    
    {/* Decorative elements */}
    <circle cx="120" cy="80" r="6" fill="#F59E0B" opacity="0.5"/>
    <circle cx="280" cy="90" r="8" fill="#FBBF24" opacity="0.6"/>
    <circle cx="100" cy="220" r="4" fill="#FCD34D" opacity="0.4"/>
  </svg>
)

// Giraffe Illustration - Tall and elegant
export const GiraffeIllustration = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="200" cy="150" r="140" fill="#F0FDF4" stroke="#22C55E" strokeWidth="2" opacity="0.3"/>
    
    {/* Giraffe neck */}
    <rect x="190" y="80" width="20" height="80" rx="10" fill="#FCD34D" opacity="0.9"/>
    
    {/* Giraffe head */}
    <ellipse cx="200" cy="70" rx="15" ry="20" fill="#FCD34D" opacity="0.9"/>
    
    {/* Giraffe ears */}
    <ellipse cx="190" cy="60" rx="4" ry="8" fill="#FCD34D" opacity="0.9"/>
    <ellipse cx="210" cy="60" rx="4" ry="8" fill="#FCD34D" opacity="0.9"/>
    
    {/* Giraffe eyes */}
    <circle cx="195" cy="70" r="2" fill="#1E293B"/>
    <circle cx="205" cy="70" r="2" fill="#1E293B"/>
    
    {/* Giraffe nose */}
    <ellipse cx="200" cy="80" rx="2" ry="1" fill="#1E293B"/>
    
    {/* Giraffe spots */}
    <circle cx="195" cy="100" r="3" fill="#F59E0B" opacity="0.7"/>
    <circle cx="205" cy="110" r="2" fill="#F59E0B" opacity="0.7"/>
    <circle cx="190" cy="120" r="2" fill="#F59E0B" opacity="0.7"/>
    <circle cx="210" cy="130" r="3" fill="#F59E0B" opacity="0.7"/>
    
    {/* Giraffe body */}
    <ellipse cx="200" cy="180" rx="35" ry="25" fill="#FCD34D" opacity="0.8"/>
    
    {/* Giraffe legs */}
    <rect x="180" y="200" width="8" height="30" rx="4" fill="#FCD34D" opacity="0.8"/>
    <rect x="195" y="200" width="8" height="30" rx="4" fill="#FCD34D" opacity="0.8"/>
    <rect x="210" y="200" width="8" height="30" rx="4" fill="#FCD34D" opacity="0.8"/>
    <rect x="225" y="200" width="8" height="30" rx="4" fill="#FCD34D" opacity="0.8"/>
    
    {/* Decorative elements */}
    <circle cx="120" cy="100" r="5" fill="#22C55E" opacity="0.5"/>
    <circle cx="280" cy="80" r="7" fill="#16A34A" opacity="0.6"/>
    <circle cx="100" cy="200" r="4" fill="#FCD34D" opacity="0.4"/>
  </svg>
)

// Monkey Illustration - Playful and energetic
export const MonkeyIllustration = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="200" cy="150" r="140" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" opacity="0.3"/>
    
    {/* Monkey head */}
    <circle cx="200" cy="130" r="30" fill="#F59E0B" opacity="0.9"/>
    
    {/* Monkey ears */}
    <circle cx="180" cy="110" r="12" fill="#F59E0B" opacity="0.9"/>
    <circle cx="220" cy="110" r="12" fill="#F59E0B" opacity="0.9"/>
    
    {/* Monkey eyes */}
    <circle cx="190" cy="125" r="3" fill="#1E293B"/>
    <circle cx="210" cy="125" r="3" fill="#1E293B"/>
    
    {/* Monkey nose */}
    <ellipse cx="200" cy="135" rx="2" ry="1" fill="#1E293B"/>
    
    {/* Monkey mouth */}
    <path d="M200 140 Q195 145 190 140" stroke="#1E293B" strokeWidth="2" fill="none"/>
    
    {/* Monkey body */}
    <ellipse cx="200" cy="180" rx="25" ry="35" fill="#F59E0B" opacity="0.8"/>
    
    {/* Monkey arms */}
    <ellipse cx="170" cy="170" rx="8" ry="20" fill="#F59E0B" opacity="0.8"/>
    <ellipse cx="230" cy="170" rx="8" ry="20" fill="#F59E0B" opacity="0.8"/>
    
    {/* Monkey legs */}
    <ellipse cx="185" cy="220" rx="8" ry="15" fill="#F59E0B" opacity="0.8"/>
    <ellipse cx="215" cy="220" rx="8" ry="15" fill="#F59E0B" opacity="0.8"/>
    
    {/* Monkey tail */}
    <path d="M225 180 Q250 160 270 140 Q280 120 275 100" 
          stroke="#F59E0B" strokeWidth="6" fill="none" opacity="0.8"/>
    
    {/* Decorative elements */}
    <circle cx="120" cy="80" r="6" fill="#EF4444" opacity="0.5"/>
    <circle cx="280" cy="100" r="5" fill="#F87171" opacity="0.6"/>
    <circle cx="100" cy="200" r="4" fill="#F59E0B" opacity="0.4"/>
  </svg>
)

// Bird Illustration - Free and graceful
export const BirdIllustration = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="200" cy="150" r="140" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" opacity="0.3"/>
    
    {/* Bird body */}
    <ellipse cx="200" cy="160" rx="20" ry="15" fill="#3B82F6" opacity="0.8"/>
    
    {/* Bird head */}
    <circle cx="200" cy="140" r="12" fill="#3B82F6" opacity="0.9"/>
    
    {/* Bird beak */}
    <path d="M200 130 L195 125 L200 120 L205 125 Z" fill="#F59E0B" opacity="0.8"/>
    
    {/* Bird eyes */}
    <circle cx="195" cy="135" r="2" fill="#1E293B"/>
    <circle cx="205" cy="135" r="2" fill="#1E293B"/>
    
    {/* Bird wings */}
    <ellipse cx="180" cy="155" rx="15" ry="8" fill="#1E40AF" opacity="0.7"/>
    <ellipse cx="220" cy="155" rx="15" ry="8" fill="#1E40AF" opacity="0.7"/>
    
    {/* Bird tail */}
    <path d="M180 170 Q160 180 140 190 Q120 200 100 210" 
          stroke="#3B82F6" strokeWidth="4" fill="none" opacity="0.8"/>
    
    {/* Bird legs */}
    <line x1="195" y1="175" x2="195" y2="185" stroke="#F59E0B" strokeWidth="2" opacity="0.8"/>
    <line x1="205" y1="175" x2="205" y2="185" stroke="#F59E0B" strokeWidth="2" opacity="0.8"/>
    
    {/* Decorative elements */}
    <circle cx="120" cy="80" r="5" fill="#3B82F6" opacity="0.5"/>
    <circle cx="280" cy="90" r="6" fill="#60A5FA" opacity="0.6"/>
    <circle cx="100" cy="200" r="4" fill="#3B82F6" opacity="0.4"/>
  </svg>
)

// Main illustration component that randomly selects an animal
export const AnimalIllustration = ({ className = "w-full h-full" }: { className?: string }) => {
  const animals = [ElephantIllustration, LionIllustration, GiraffeIllustration, MonkeyIllustration, BirdIllustration]
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)]
  const AnimalComponent = randomAnimal
  
  return <AnimalComponent className={className} />
}
