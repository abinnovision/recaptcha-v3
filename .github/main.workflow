workflow "Test" {
  on = "push"
  resolves = ["Cypress tests"]
}

action "Install dependencies" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}

action "Cypress tests" {
  uses = "nuxt/actions-yarn@master"
  needs = ["Install dependencies"]
  args = "cypress:run"
}
