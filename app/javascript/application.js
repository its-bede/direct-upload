// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import * as bootstrap from "bootstrap"

document.addEventListener("turbo:load", () => {
  const form = document.querySelector("form");
  form.addEventListener("file-uploaded", (event) => {
    const signedId = event.detail.signedId;
    form.querySelector("input[name='post[file_signed_id]']").value = signedId;
  });
});