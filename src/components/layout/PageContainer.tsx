interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-screen-lg px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  )
}
