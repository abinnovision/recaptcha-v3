workflow "Test" {
  on = "push"
  resolves = ["Cypress tests"]
}

action "Install dependencies" {
  uses = "nuxt/actions-yarn@master"
  args = "install"
}

action "Cypress tests" {
  uses = "docker://cypress/browsers:chrome69"
  needs = ["Install dependencies"]
  runs = "yarn"
  args = "cypress:run"
}
