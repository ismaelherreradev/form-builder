import { ReactNode } from "react"

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-grow mx-auto">{children}</div>
}
