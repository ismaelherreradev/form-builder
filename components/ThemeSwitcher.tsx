import { useEffect, useState } from "react"
import { Switch } from "@nextui-org/react"
import { useTheme } from "next-themes"

import { MoonIcon } from "./icons/Moon"
import { SunIcon } from "./icons/Sun"

export default function DarkModeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return (
    <Switch
      isSelected={theme === "dark"}
      size="lg"
      color="secondary"
      onValueChange={(isSelected) => setTheme(isSelected ? "dark" : "light")}
      thumbIcon={({ isSelected, className }) =>
        isSelected ? (
          <SunIcon className={className} />
        ) : (
          <MoonIcon className={className} />
        )
      }
    />
  )
}
