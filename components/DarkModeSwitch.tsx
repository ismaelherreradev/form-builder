import { Switch } from "@nextui-org/react"

import { MoonIcon } from "./icons/Moon"
import { SunIcon } from "./icons/Sun"

export default function DarkModeSwitch() {
  return (
    <Switch
      defaultSelected
      size="lg"
      color="secondary"
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
