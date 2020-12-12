const React = require("react")
require("./layout.css")
require("tailwindcss/tailwind.css")
// Logs when the client route changes
// Wraps every page in a component
exports.wrapPageElement = ({ element, props }) => {
  return <main >{element}</main>
}
