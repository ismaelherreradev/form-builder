"use client"

import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react"

import DarkModeSwitch from "../ThemeSwitcher"

export default function MainNavbar() {
  return (
    <Navbar as={"nav"} maxWidth="xl">
      <NavbarBrand>
        {/* <p className="font-bold text-lg">Form Builder</p> */}
      </NavbarBrand>
      <NavbarContent justify="end">
        <DarkModeSwitch />
      </NavbarContent>
    </Navbar>
  )
}
