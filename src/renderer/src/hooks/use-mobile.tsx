import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isTablet, setIsTablet] = useState<boolean>(false)

  useEffect(() => {
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tabletQuery = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: 1023px)`)
    
    const handleResize = () => {
      setIsMobile(mobileQuery.matches)
      setIsTablet(tabletQuery.matches)
    }
    
    // Set initial values
    handleResize()
    
    // Add event listeners
    mobileQuery.addEventListener("change", handleResize)
    tabletQuery.addEventListener("change", handleResize)
    
    // Clean up
    return () => {
      mobileQuery.removeEventListener("change", handleResize)
      tabletQuery.removeEventListener("change", handleResize)
    }
  }, [])

  return { 
    isMobile, 
    isTablet,
    isDesktop: !isMobile && !isTablet
  }
}

// Keep the original function for backward compatibility
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}