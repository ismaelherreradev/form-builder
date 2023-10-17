import { ReactNode } from "react"

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col flex-grow mx-auto container">
      {children}
    </div>
  )
}
