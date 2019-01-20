workflow "Test" {
  on = "push"
  resolves = ["Install dependencies"]
}

action "Install dependencies" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}
