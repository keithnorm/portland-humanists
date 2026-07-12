/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    member?: import('./lib/identity').MemberUser;
  }
}
